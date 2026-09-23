import os
import shutil
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, HTTPException
import uvicorn
from dotenv import load_dotenv
from openai import OpenAI

from schemas import DepartmentFunction, DocumentExtractionResult
from extractors import DocumentExtractor

# .env файлынан OpenAI API кілтін жүктеу
load_dotenv()

app = FastAPI(
    title="Department Functions Extractor API",
    description="Документтерден бөлімшелер мен олардың функцияларын AI арқылы парсинг жасау"
)

# OpenAI клиентін баптау
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Уақытша деректер қоры (Жадыда сақтау)
DB: List[DepartmentFunction] = []

SYSTEM_PROMPT = """
Ты — эксперт по анализу документов.
Твоя задача — извлечь из предоставленного текста названия подразделений и их конкретные функции/обязанности.
Обязательно выявляй номер пункта/раздела (например: 2.1, 4.3.1), если он есть в тексте.
Отвечай строго в формате JSON, соответствующем заданной схеме.
"""

def parse_with_llm(filename: str, page_label: str, text: str) -> List[DepartmentFunction]:
    """LLM (OpenAI) арқылы тексттен функцияларды структуризациялап извлекать ету"""
    try:
        response = client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Файл: {filename}, Орны: {page_label}\n\nТекст:\n{text}"}
            ],
            response_format=DocumentExtractionResult,
            temperature=0.0
        )
        
        result: DocumentExtractionResult = response.choices[0].message.parsed
        
        # Метадеректерді толтыру (файл аты мен беті)
        for fn in result.functions:
            fn.source.filename = filename
            if not fn.source.page_or_sheet:
                fn.source.page_or_sheet = page_label
                
        return result.functions
    except Exception as e:
        print(f"Парсинг қатесі: {e}")
        return []

@app.post("/upload", summary="Документті жүктеу және парсинг жасау")
async def upload_document(file: UploadFile = File(...)):
    """PDF, DOCX немесе XLSX файлдарын қабылдап, ішіндегі функцияларды извлекать етеді"""
    ext = file.filename.split(".")[-1].lower()
    temp_path = f"temp_{file.filename}"
    
    # Файлды уақытша сақтау
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        # 1. Файл түріне байланысты текстті оқу
        if ext == "pdf":
            chunks = DocumentExtractor.extract_pdf(temp_path)
        elif ext in ["docx", "doc"]:
            chunks = DocumentExtractor.extract_docx(temp_path)
        elif ext in ["xlsx", "xls"]:
            chunks = DocumentExtractor.extract_excel(temp_path)
        else:
            raise HTTPException(status_code=400, detail="Қолдау көрсетілмейтін файл форматы")
        
        # 2. Мәтін бөліктерін AI-ға жіберіп өңдеу
        extracted_functions = []
        for chunk in chunks:
            funcs = parse_with_llm(
                filename=file.filename,
                page_label=chunk["page"],
                text=chunk["text"]
            )
            extracted_functions.extend(funcs)
            
        # 3. Алынған нәтижелерді базаға сақтау
        DB.extend(extracted_functions)
        
        return {
            "status": "success",
            "filename": file.filename,
            "total_extracted": len(extracted_functions),
            "data": [f.model_dump() for f in extracted_functions]
        }
    finally:
        # Уақытша файлды өшіру
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.get("/functions", summary="Барлық алынған функциялар тізімін алу")
async def get_functions(department: Optional[str] = None):
    """Барлық функцияларды алу немесе бөлімше атауы бойынша сүзгілеу"""
    if department:
        filtered = [f.model_dump() for f in DB if department.lower() in f.department.lower()]
        return {"count": len(filtered), "data": filtered}
    return {"count": len(DB), "data": [f.model_dump() for f in DB]}

# Visual Studio-дан тікелей F5 арқылы серверді іске қосу
if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
import pdfplumber
import docx
import pandas as pd
from typing import List, Dict, Any


class DocumentExtractor:

    @staticmethod
    def extract_pdf(file_path: str) -> List[Dict[str, Any]]:
        """PDF файлынан текстті бет бойынша (page) оқиды"""
        chunks = []
        with pdfplumber.open(file_path) as pdf:
            for i, page in enumerate(pdf.pages, start=1):
                text = page.extract_text()
                if text and text.strip():
                    chunks.append({"page": f"Стр. {i}", "text": text.strip()})
        return chunks

    @staticmethod
    def extract_docx(file_path: str) -> List[Dict[str, Any]]:
        """Word (DOCX) файлынан текстті абзацтар бойынша оқиды"""
        doc = docx.Document(file_path)
        chunks = []
        for i, p in enumerate(doc.paragraphs, start=1):
            if p.text.strip():
                chunks.append({"page": f"Абзац {i}", "text": p.text.strip()})
        return chunks

    @staticmethod
    def extract_excel(file_path: str) -> List[Dict[str, Any]]:
        """Excel (XLSX) файлынан текстті парақтар (Sheet) бойынша оқиды"""
        excel_file = pd.ExcelFile(file_path)
        chunks = []
        for sheet_name in excel_file.sheet_names:
            df = pd.read_excel(excel_file, sheet_name=sheet_name)
            text_rep = df.to_csv(index=False)
            if text_rep.strip():
                chunks.append({"page": f"Лист: {sheet_name}", "text": text_rep.strip()})
        return chunks
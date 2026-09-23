from pydantic import BaseModel, Field
from typing import List, Optional

class SourceMetadata(BaseModel):
    """Файл мен оның ішіндегі орынның (бет, пункт, абзац) сілтемесі"""
    filename: str = Field(
        description="Жүктелген файлдың аты"
    )
    page_or_sheet: Optional[str] = Field(
        default=None, 
        description="Бет нөмірі, парақ аты немесе абзац нөмірі (мыс: Стр. 3, Парақ: Sheet1)"
    )
    section_number: Optional[str] = Field(
        default=None, 
        description="Документтегі пункт немесе бөлім нөмірі (мыс: Пункт 2.1.4)"
    )

class DepartmentFunction(BaseModel):
    """Жекелеген бөлімше және оның анықталған функциясы"""
    department: str = Field(
        description="Бөлімше, департамент немесе отдел атауы"
    )
    function: str = Field(
        description="Бөлімшенің нақты міндеті, функциясы немесе жауапкершілігі"
    )
    source: SourceMetadata

class DocumentExtractionResult(BaseModel):
    """LLM қайтаратын барлық функциялардың жиынтық тізімі"""
    functions: List[DepartmentFunction]
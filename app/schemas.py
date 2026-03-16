from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, Literal

Label = Literal["Safe", "Suspicious", "Phishing"]

class AnalyzeEmailRequest(BaseModel):
    text: str = Field(min_length=5, max_length=20000)

class AnalyzeUrlRequest(BaseModel):
    url: str = Field(min_length=5, max_length=5000)

class AnalyzeCombinedRequest(BaseModel):
    text: Optional[str] = Field(default=None, max_length=20000)
    url: Optional[str] = Field(default=None, max_length=5000)

class AnalyzeResponse(BaseModel):
    label: Label
    confidence: float = Field(ge=0.0, le=1.0)
    explanation: str

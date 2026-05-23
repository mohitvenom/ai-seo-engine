from pydantic import BaseModel
from typing import Optional, Literal

class PipelineRequest(BaseModel):
    product: str
    category: Optional[str] = "General"
    provider: Literal["openai", "gemini"] = "openai"

class KeywordOutput(BaseModel):
    primary: list[str]
    secondary: list[str]
    longTail: list[str]
    intent: dict[str, list[str]]
    voiceSearch: list[str]
    trendScore: Optional[float] = None
    risingQueries: list[str] = []
    autoSuggestions: list[str] = []
    serpRelated: list[str] = []
    paaQuestions: list[str] = []

class MetaOutput(BaseModel):
    metaTitle: str
    metaDescription: str
    slug: str
    ogTitle: str
    ogDescription: str
    competitorTitles: list[str] = []
    competitorDescriptions: list[str] = []

class DescriptionOutput(BaseModel):
    headline: str
    shortDescription: str
    longDescription: str
    bulletPoints: list[str]
    cta: str

class SchemaOutput(BaseModel):
    jsonLd: dict
    breadcrumb: list[str]

class PipelineResponse(BaseModel):
    keywords: KeywordOutput
    meta: MetaOutput
    description: DescriptionOutput
    schemaMarkup: SchemaOutput
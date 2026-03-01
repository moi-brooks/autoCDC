from pydantic import BaseModel, HttpUrl
from typing import List, Optional, Dict, Any

class ProjectCreate(BaseModel):
    url: HttpUrl
    description: Optional[str] = None

class ProjectResponse(BaseModel):
    id: str
    url: str
    status: str
    created_at: str

class CrawlResult(BaseModel):
    url: str
    title: str
    pages: List[Dict[str, Any]]
    features: List[str]
    roles: List[str]

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ─── Author ──────────────────────────────────────────────────────────────────

class AuthorOut(BaseModel):
    id: str = Field(alias="_id")
    name: str
    affiliation: Optional[str] = None
    total_citations: Optional[int] = 0
    citations_since_2021: Optional[int] = 0
    total_publications: Optional[int] = 0
    scraped_at: Optional[datetime] = None

    class Config:
        populate_by_name = True


# ─── Publication ─────────────────────────────────────────────────────────────

class PublicationOut(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    author_id: str
    author_name: str
    title: str
    year: Optional[int] = None
    cited_by: Optional[int] = 0
    pub_type: Optional[str] = "unknown"   # journal / conference / book / unknown
    link: Optional[str] = None
    scraped_at: Optional[datetime] = None

    class Config:
        populate_by_name = True


# ─── Paginated response wrapper ───────────────────────────────────────────────

class PaginatedPublications(BaseModel):
    total: int
    page: int
    limit: int
    total_pages: int
    results: list[PublicationOut]

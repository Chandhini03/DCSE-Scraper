from fastapi import APIRouter, Query
from typing import Optional
from math import ceil
from api.core.database import get_db
from api.models.schemas import PaginatedPublications

router = APIRouter()


def _fix_id(doc: dict) -> dict:
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc


@router.get("/", response_model=PaginatedPublications)
async def list_publications(
    year: Optional[int] = Query(None, description="Filter by publication year"),
    pub_type: Optional[str] = Query(None, description="Filter by type: journal, conference, book"),
    author_name: Optional[str] = Query(None, description="Partial match on faculty name"),
    author_id: Optional[str] = Query(None, description="Exact Google Scholar author ID"),
    min_citations: Optional[int] = Query(None, description="Minimum cited_by count"),
    max_citations: Optional[int] = Query(None, description="Maximum cited_by count"),
    year_from: Optional[int] = Query(None, description="Publications from this year onward"),
    year_to: Optional[int] = Query(None, description="Publications up to this year"),
    sort_by: str = Query("cited_by", description="Sort field: cited_by | year | title"),
    order: str = Query("desc", description="Sort order: asc | desc"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    """
    Paginated, filtered list of all publications.

    Combine any filters freely — e.g. year=2023 & pub_type=journal & min_citations=10
    """
    db = get_db()
    query = {}

    if year:
        query["year"] = year
    elif year_from or year_to:
        year_filter = {}
        if year_from:
            year_filter["$gte"] = year_from
        if year_to:
            year_filter["$lte"] = year_to
        query["year"] = year_filter

    if pub_type:
        query["pub_type"] = pub_type

    if author_id:
        query["author_id"] = author_id
    elif author_name:
        query["author_name"] = {"$regex": author_name, "$options": "i"}

    if min_citations is not None or max_citations is not None:
        cit_filter = {}
        if min_citations is not None:
            cit_filter["$gte"] = min_citations
        if max_citations is not None:
            cit_filter["$lte"] = max_citations
        query["cited_by"] = cit_filter

    allowed_sorts = {"cited_by", "year", "title", "author_name"}
    if sort_by not in allowed_sorts:
        sort_by = "cited_by"
    sort_dir = -1 if order == "desc" else 1

    total = await db.publications.count_documents(query)
    skip = (page - 1) * limit

    pubs = (
        await db.publications.find(query)
        .sort(sort_by, sort_dir)
        .skip(skip)
        .limit(limit)
        .to_list(limit)
    )

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": ceil(total / limit) if total else 0,
        "results": [_fix_id(p) for p in pubs],
    }


@router.get("/search")
async def search_publications(
    q: str = Query(..., min_length=2, description="Full-text search query"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    """
    Full-text search across publication titles and author names.
    Requires the text index created on startup (title + author_name fields).
    """
    db = get_db()
    query = {"$text": {"$search": q}}
    projection = {"score": {"$meta": "textScore"}}

    total = await db.publications.count_documents(query)
    skip = (page - 1) * limit

    pubs = (
        await db.publications.find(query, projection)
        .sort([("score", {"$meta": "textScore"})])
        .skip(skip)
        .limit(limit)
        .to_list(limit)
    )
    return {
        "query": q,
        "total": total,
        "page": page,
        "limit": limit,
        "results": [_fix_id(p) for p in pubs],
    }


@router.get("/years")
async def get_available_years():
    """Return the distinct years present in the publications collection."""
    db = get_db()
    years = await db.publications.distinct("year")
    return sorted([y for y in years if y], reverse=True)


@router.get("/types")
async def get_available_types():
    """Return the distinct publication types in the collection."""
    db = get_db()
    types = await db.publications.distinct("pub_type")
    return sorted([t for t in types if t])

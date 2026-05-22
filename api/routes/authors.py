from fastapi import APIRouter, HTTPException
from api.core.database import get_db
from api.models.schemas import AuthorOut

router = APIRouter()


def _fix_id(doc: dict) -> dict:
    """Convert ObjectId or plain string _id to str for JSON serialisation."""
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc


@router.get("/", response_model=list[AuthorOut])
async def list_authors():
    """
    Return all scraped faculty members with their citation totals.
    Sorted alphabetically by name.
    """
    db = get_db()
    authors = await db.authors.find({}).sort("name", 1).to_list(500)
    return [_fix_id(a) for a in authors]


@router.get("/{author_id}", response_model=AuthorOut)
async def get_author(author_id: str):
    """
    Return a single author by their Google Scholar profile ID.
    """
    db = get_db()
    author = await db.authors.find_one({"_id": author_id})
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")
    return _fix_id(author)


@router.get("/{author_id}/publications")
async def get_author_publications(
    author_id: str,
    year: int = None,
    pub_type: str = None,
    sort_by: str = "cited_by",   # cited_by | year | title
    order: str = "desc",          # asc | desc
):
    """
    Return all publications for a specific author.
    Optional filters: year, pub_type.
    Optional sort: cited_by (default), year, title.
    """
    db = get_db()

    # Confirm author exists
    author = await db.authors.find_one({"_id": author_id})
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")

    query = {"author_id": author_id}
    if year:
        query["year"] = year
    if pub_type:
        query["pub_type"] = pub_type

    allowed_sorts = {"cited_by", "year", "title"}
    if sort_by not in allowed_sorts:
        sort_by = "cited_by"
    sort_dir = -1 if order == "desc" else 1

    pubs = (
        await db.publications.find(query)
        .sort(sort_by, sort_dir)
        .to_list(500)
    )
    return {
        "author": _fix_id(author),
        "total": len(pubs),
        "publications": [_fix_id(p) for p in pubs],
    }

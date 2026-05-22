from fastapi import APIRouter
from api.core.database import get_db

router = APIRouter()


@router.get("/overview")
async def overview():
    """
    Dashboard summary stats:
    - Total authors, publications, citations
    - Top 5 most cited authors
    - Publications per year (for a bar chart)
    - Breakdown by publication type
    """
    db = get_db()

    total_authors = await db.authors.count_documents({})
    total_publications = await db.publications.count_documents({})

    # Sum all citations
    pipeline_citations = [{"$group": {"_id": None, "total": {"$sum": "$cited_by"}}}]
    cit_result = await db.publications.aggregate(pipeline_citations).to_list(1)
    total_citations = cit_result[0]["total"] if cit_result else 0

    # Top 5 authors by total citations
    top_authors = (
        await db.authors.find({}, {"name": 1, "total_citations": 1})
        .sort("total_citations", -1)
        .limit(5)
        .to_list(5)
    )
    for a in top_authors:
        a["_id"] = str(a["_id"])

    # Publications per year
    pipeline_per_year = [
        {"$match": {"year": {"$ne": None}}},
        {"$group": {"_id": "$year", "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}},
    ]
    per_year = await db.publications.aggregate(pipeline_per_year).to_list(100)
    per_year_clean = [{"year": r["_id"], "count": r["count"]} for r in per_year]

    # Breakdown by type
    pipeline_per_type = [
        {"$group": {"_id": "$pub_type", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    per_type = await db.publications.aggregate(pipeline_per_type).to_list(20)
    per_type_clean = [{"type": r["_id"] or "unknown", "count": r["count"]} for r in per_type]

    return {
        "total_authors": total_authors,
        "total_publications": total_publications,
        "total_citations": total_citations,
        "top_authors_by_citations": top_authors,
        "publications_per_year": per_year_clean,
        "publications_by_type": per_type_clean,
    }


@router.get("/author/{author_id}")
async def author_stats(author_id: str):
    """Per-author stats: citation trend by year, top papers."""
    db = get_db()

    pipeline = [
        {"$match": {"author_id": author_id, "year": {"$ne": None}}},
        {"$group": {"_id": "$year", "count": {"$sum": 1}, "citations": {"$sum": "$cited_by"}}},
        {"$sort": {"_id": 1}},
    ]
    by_year = await db.publications.aggregate(pipeline).to_list(100)

    top_papers = (
        await db.publications.find({"author_id": author_id})
        .sort("cited_by", -1)
        .limit(5)
        .to_list(5)
    )
    for p in top_papers:
        p["_id"] = str(p["_id"])

    return {
        "by_year": [{"year": r["_id"], "count": r["count"], "citations": r["citations"]} for r in by_year],
        "top_papers": top_papers,
    }

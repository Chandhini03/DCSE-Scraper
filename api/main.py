from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from api.core.database import connect_db, disconnect_db
from api.routes import authors, publications, scrape, stats, export


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await disconnect_db()


app = FastAPI(
    title="DCSE Scholar API",
    description="API for browsing Anna University CSE faculty publications scraped from Google Scholar.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],           # tighten this to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(authors.router,      prefix="/authors",      tags=["Authors"])
app.include_router(publications.router, prefix="/publications", tags=["Publications"])
app.include_router(scrape.router,       prefix="/scrape",       tags=["Scraper"])
app.include_router(stats.router,        prefix="/stats",        tags=["Stats"])
app.include_router(export.router,       prefix="/export",       tags=["Export"])


@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "message": "DCSE Scholar API is running"}


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy"}

# DCSE Scholar - Scraper + API

Monorepo containing the Google Scholar scraper and REST API for DCSE faculty publications.

## Structure

`
DCSE-Scraper/
├── scraper/
│   ├── scraper.py          # Main scraper (Tor + MongoDB)
│   └── test_tor.py         # Original test script
├── api/
│   ├── main.py             # FastAPI app
│   ├── core/               # Config + DB connection
│   ├── models/             # Pydantic schemas
│   └── routes/             # API endpoints
├── scripts/
│   └── seed_from_scraper.py
├── requirements.txt
├── .env.example
└── README.md
`

## Setup

`ash
python -m venv .venv
.venv\Scripts\activate       # Windows
pip install -r requirements.txt
cp .env.example .env         # Edit with your MongoDB URI and Tor path
`

## Run the Scraper

`ash
python scraper/scraper.py
`

This scrapes all faculty profiles and saves directly to MongoDB.

## Run the API

`ash
uvicorn api.main:app --reload
`

API docs at http://localhost:8000/docs

## How They Connect

Both the scraper and API use the same MongoDB database (scholar_db).
The scraper writes authors + publications; the API reads them.

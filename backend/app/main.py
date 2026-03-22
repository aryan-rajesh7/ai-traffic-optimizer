
from fastapi import FastAPI
from dotenv import load_dotenv
import os
from supabase import create_client
from fastapi.middleware.cors import CORSMiddleware
from app.ingestion.tomtom import ingest_all_intersections

load_dotenv()

app = FastAPI(title = "AI Traffic Signal Optimizer")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase = create_client (
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

@app.get("/")
async def root():
    return {"status": "ok", "message": "AI Traffic Signal Optimizer API"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/test-db")
async def test_db():
    result = supabase.table("intersections").select("*").execute()
    return {"intersections": result.data}

@app.post("/ingest")
async def ingest():
    await ingest_all_intersections()
    return {"status": "ok", "message": "Traffic data ingested successfully"}


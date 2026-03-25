from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from app.ingestion.tomtom import fetch_all_intersections
from app.ws.stream import websocket_endpoint, latest_traffic_data, refresh_traffic_data
from app.rag.chain import get_signal_recommendation, get_congestion_explanation
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="AI Traffic Signal Optimizer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "ok", "message": "AI Traffic Signal Optimizer API"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/traffic")
async def get_traffic():
    data = await fetch_all_intersections()
    return {"traffic": data}

@app.post("/refresh")
async def refresh():
    await refresh_traffic_data()
    return {"status": "ok", "message": "Traffic data refreshed"}

@app.get("/recommend/{intersection_name}")
async def recommend(intersection_name: str):
    fresh_data = await fetch_all_intersections()
    recommendation = get_signal_recommendation(intersection_name, fresh_data)
    return {
        "intersection": intersection_name,
        "recommendation": recommendation
    }

@app.get("/explain/{intersection_name}")
async def explain(intersection_name: str):
    fresh_data = await fetch_all_intersections()
    explanation = get_congestion_explanation(intersection_name, fresh_data)
    return {
        "intersection": intersection_name,
        "explanation": explanation
    }

@app.websocket("/ws/traffic")
async def traffic_websocket(websocket: WebSocket):
    await websocket_endpoint(websocket)
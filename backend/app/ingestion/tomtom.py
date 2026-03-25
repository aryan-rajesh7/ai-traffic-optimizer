import httpx
import os
from dotenv import load_dotenv

load_dotenv()

TOMTOM_API_KEY = os.getenv("TOMTOM_API_KEY")

INTERSECTIONS = [
    {"name": "5th Ave & Broadway",         "lat": 40.7549, "lon": -73.9840,  "city": "New York"},
    {"name": "Market St & 5th St",         "lat": 37.7836, "lon": -122.4089, "city": "San Francisco"},
    {"name": "Michigan Ave & Chicago Ave", "lat": 41.8966, "lon": -87.6239,  "city": "Chicago"},
    {"name": "Sunset Blvd & Vine St",      "lat": 34.0983, "lon": -118.3263, "city": "Los Angeles"},
    {"name": "Pike St & 1st Ave",          "lat": 47.6086, "lon": -122.3408, "city": "Seattle"},
]

async def fetch_traffic_data(lat: float, lon: float) -> dict:
    url = (
        f"https://api.tomtom.com/traffic/services/4/flowSegmentData/"
        f"absolute/10/json?point={lat},{lon}&key={TOMTOM_API_KEY}"
    )
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        data = response.json()
        flow = data.get("flowSegmentData", {})
        return {
            "current_speed": flow.get("currentSpeed", 0),
            "free_flow_speed": flow.get("freeFlowSpeed", 0),
            "current_travel_time": flow.get("currentTravelTime", 0),
            "free_flow_travel_time": flow.get("freeFlowTravelTime", 0),
            "road_closure": flow.get("roadClosure", False),
            "confidence": flow.get("confidence", 0),
        }

def calculate_congestion_score(current_speed: float, free_flow_speed: float) -> float:
    if free_flow_speed == 0:
        return 0.0
    score = 1 - (current_speed / free_flow_speed)
    return round(max(0.0, min(1.0, score)), 2)

async def fetch_all_intersections() -> list:
    print("Fetching live traffic data...")
    results = []
    for intersection in INTERSECTIONS:
        traffic_data = await fetch_traffic_data(
            intersection["lat"],
            intersection["lon"]
        )
        congestion_score = calculate_congestion_score(
            traffic_data["current_speed"],
            traffic_data["free_flow_speed"]
        )
        results.append({
            "name": intersection["name"],
            "city": intersection["city"],
            "lat": intersection["lat"],
            "lon": intersection["lon"],
            "congestion_score": congestion_score,
            "road_closure": traffic_data["road_closure"],
            "confidence": traffic_data["confidence"],
        })
        print(f"{intersection['name']} - congestion: {congestion_score}")
    print("Done fetching all intersections!")
    return results
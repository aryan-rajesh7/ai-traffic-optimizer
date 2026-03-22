# Aryan Rajesh

import httpx
import os
from dotenv import load_dotenv

load_dotenv()

tom_apikey = os.getenv("TOMTOM_API_KEY")

INTERSECTIONS = [
    {"id": None, "name": "5th Ave & Broadway", "lat": 40.7549, "lon": -73.9840},
    {"id": None, "name": "Market St & 5th St", "lat": 37.7836, "lon": -122.4089},
    {"id": None, "name": "Michigan Ave & Chicago Ave", "lat": 41.8966, "lon": -87.6239},
    {"id": None, "name": "Sunset Blvd & Vine St", "lat": 34.0983, "lon": -118.3263},
    {"id": None, "name": "Pike St & 1st Ave", "lat": 47.6086, "lon": -122.3408},
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

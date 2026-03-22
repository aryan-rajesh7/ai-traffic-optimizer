import httpx
import os
from dotenv import load_dotenv
from supabase import create_client

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
        f"absolute/10/json?point={lat},{lon}&key={tom_apikey}"
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


def get_intersection_ids() -> dict:
    result = supabase.table("intersections").select("id, name").execute()
    return {row["name"]: row["id"] for row in result.data}


async def store_sensor_reading(intersection_id: str, traffic_data: dict):
    congestion_score = calculate_congestion_score(
        traffic_data["current_speed"],
        traffic_data["free_flow_speed"]
    )
    supabase.table("sensor_readings").insert({
        "intersection_id": intersection_id,
        "vehicle_count": 0,
        "average_speed": traffic_data["current_speed"],
        "congestion_score": congestion_score,
        "source": "tomtom"
    }).execute()

async def ingest_all_intersections():
    print("Getting traffic data")
    intersection_ids = get_intersection_ids()
    for intersection in INTERSECTIONS:
        name = intersection["name"]
        intersection_id = intersection_ids.get(name)
        if not intersection_id:
            print(f"Skipping {name} - not found in database")
            continue
        traffic_data = await fetch_traffic_data(
            intersection["lat"],
            intersection["lon"]
        )
        await store_sensor_reading(intersection_id, traffic_data)
        print(f"Saved data for {name} - congestion: {calculate_congestion_score(traffic_data['current_speed'], traffic_data['free_flow_speed'])}")
    print("Done!")

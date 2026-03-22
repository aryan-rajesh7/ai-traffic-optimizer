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

import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable is not set")

client = genai.Client(api_key=GEMINI_API_KEY)

def build_context_from_memory(intersection_name: str, traffic_data: list):
    print(f"Looking for: '{intersection_name}'")
    print(f"Available: {[i['name'] for i in traffic_data]}")

    intersection = None

    # Exact match first
    for i in traffic_data:
        if i["name"].strip().lower() == intersection_name.strip().lower():
            intersection = i
            break

    # Fuzzy match — ignore spaces and special chars
    if not intersection:
        clean_search = intersection_name.replace(" ", "").replace("&", "").lower()
        for i in traffic_data:
            clean_name = i["name"].replace(" ", "").replace("&", "").lower()
            if clean_search == clean_name:
                intersection = i
                break

    # Partial match
    if not intersection:
        for i in traffic_data:
            if intersection_name.lower().strip() in i["name"].lower().strip():
                intersection = i
                break

    if not intersection:
        return None

    return intersection


def get_signal_recommendation(intersection_name: str, traffic_data: list) -> str:
    intersection = build_context_from_memory(intersection_name, traffic_data)

    if not intersection:
        return f"Intersection '{intersection_name}' not found."

    congestion = intersection['congestion_score']
    if congestion < 0.3:
        level = "LOW"
    elif congestion < 0.6:
        level = "MODERATE"
    elif congestion < 0.8:
        level = "HIGH"
    else:
        level = "SEVERE"

    prompt = f"""
You are an expert traffic signal engineer.
You have REAL LIVE sensor data right now. Use it.

CURRENT READINGS:
- Intersection: {intersection['name']} in {intersection['city']}
- Congestion score: {congestion} out of 1.0
- Congestion level: {level}
- Road closure: {intersection['road_closure']}

Using the ACTUAL congestion score above provide:
1. Current situation — reference the exact score and level
2. Exact signal timing in seconds for green/yellow/red
3. Expected improvement percentage

Be specific. Use the actual numbers. Keep under 150 words.
    """

    response = client.models.generate_content(
        model="gemini-2.0-flash-lite",
        contents=prompt
    )
    return response.text


def get_congestion_explanation(intersection_name: str, traffic_data: list) -> str:
    intersection = build_context_from_memory(intersection_name, traffic_data)

    if not intersection:
        return f"Intersection '{intersection_name}' not found."

    congestion = intersection['congestion_score']
    if congestion < 0.3:
        level = "LOW"
    elif congestion < 0.6:
        level = "MODERATE"
    elif congestion < 0.8:
        level = "HIGH"
    else:
        level = "SEVERE"

    prompt = f"""
You are a traffic analyst explaining conditions to a user.
You have REAL LIVE sensor data right now. Use it.

CURRENT READINGS:
- Intersection: {intersection['name']} in {intersection['city']}
- Congestion score: {congestion} out of 1.0
- Congestion level: {level}
- Road closure: {intersection['road_closure']}

Using the ACTUAL data above explain:
1. Current congestion situation — use the exact score and level
2. What is likely causing it
3. One immediate action to take

Be specific. Use the actual numbers. Keep under 150 words.
    """

    response = client.models.generate_content(
        model="gemini-2.0-flash-lite",
        contents=prompt
    )
    return response.text

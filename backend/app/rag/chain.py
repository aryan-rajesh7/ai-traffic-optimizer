import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def build_context_from_memory(intersection_name: str, traffic_data: list) -> str:
    print(f"Looking for: '{intersection_name}'")
    print(f"Available: {[i['name'] for i in traffic_data]}")
    
    intersection = None
    for i in traffic_data:
        if i["name"].lower().strip() == intersection_name.lower().strip():
            intersection = i
            break
    
    if not intersection:
        for i in traffic_data:
            if intersection_name.lower().strip() in i["name"].lower().strip():
                intersection = i
                break

    if not intersection:
        print(f"Could not find intersection: {intersection_name}")
        return None

    congestion = intersection['congestion_score']
    if congestion < 0.3:
        level = "LOW"
    elif congestion < 0.6:
        level = "MODERATE"
    elif congestion < 0.8:
        level = "HIGH"
    else:
        level = "SEVERE"

    context = f"""
REAL LIVE DATA FROM INTERSECTION: {intersection['name']} in {intersection['city']}
TIMESTAMP: right now

CURRENT READINGS:
- Congestion score: {congestion} out of 1.0
- Congestion level: {level}
- Road closure: {intersection['road_closure']}
- Data confidence: {intersection['confidence'] * 100}%
- GPS location: {intersection['lat']}, {intersection['lon']}

CONGESTION SCALE:
- 0.0 to 0.3 = LOW — traffic flowing freely
- 0.3 to 0.6 = MODERATE — some slowdowns
- 0.6 to 0.8 = HIGH — significant delays
- 0.8 to 1.0 = SEVERE — near gridlock
    """
    return context

def get_signal_recommendation(intersection_name: str, traffic_data: list) -> str:
    context = build_context_from_memory(intersection_name, traffic_data)
    
    if not context:
        return f"Intersection '{intersection_name}' not found. Available intersections: {[i['name'] for i in traffic_data]}"

    prompt = f"""
You are an expert traffic signal engineer.
You have REAL LIVE sensor data right now. Use it.

{context}

Using the ACTUAL congestion score above provide:
1. Current situation — reference the exact congestion score and level
2. Exact signal timing in seconds for green/yellow/red phases
3. Expected improvement percentage

Be specific. Use the actual numbers. Do not say data is unavailable.
Keep under 150 words.
    """
    model = genai.GenerativeModel("gemini-2.5-flash")
    response = model.generate_content(prompt)
    return response.text

def get_congestion_explanation(intersection_name: str, traffic_data: list) -> str:
    context = build_context_from_memory(intersection_name, traffic_data)

    if not context:
        return f"Intersection '{intersection_name}' not found. Available intersections: {[i['name'] for i in traffic_data]}"

    prompt = f"""
You are a traffic analyst explaining conditions to a city manager.
You have REAL LIVE sensor data right now. Use it.

{context}

Using the ACTUAL data above explain:
1. Current congestion situation — use the exact score and level
2. What is likely causing it
3. One immediate action to take

Be specific. Use the actual numbers. Do not say data is unavailable.
Keep under 150 words.
    """
    model = genai.GenerativeModel("gemini-2.5-flash")
    response = model.generate_content(prompt)
    return response.text
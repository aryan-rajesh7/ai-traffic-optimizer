from fastapi import WebSocket, WebSocketDisconnect
from supabase import create_client
import asyncio
import os
import json
from dotenv import load_dotenv


load_dotenv()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)


class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"Client connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        print(f"Client disconnected. Total connections: {len(self.active_connections)}")

    async def broadcast(self, data: dict):
        for connection in self.active_connections:
            await connection.send_text(json.dumps(data))

manager = ConnectionManager()

def get_latest_traffic_data() -> list:
    result = (
        supabase.table("sensor_readings")
        .select("*, intersections(name, latitude, longitude, city)")
        .order("recorded_at", desc=True)
        .limit(5)
        .execute()
    )
    return result.data



async def broadcast_traffic_update():
    data = get_latest_traffic_data()
    await manager.broadcast({
        "type": "traffic_update",
        "data": data
    })

async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = get_latest_traffic_data()
            await websocket.send_text(json.dumps({
                "type": "traffic_update",
                "data": data
            }))
            await asyncio.sleep(30)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
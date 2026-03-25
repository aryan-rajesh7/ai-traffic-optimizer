from fastapi import WebSocket, WebSocketDisconnect
import asyncio
import json
from app.ingestion.tomtom import fetch_all_intersections

latest_traffic_data = []

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"Client connected. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        print(f"Client disconnected. Total: {len(self.active_connections)}")

    async def broadcast(self, data: dict):
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(data))
            except Exception:
                pass

manager = ConnectionManager()

async def refresh_traffic_data():
    global latest_traffic_data
    latest_traffic_data = await fetch_all_intersections()
    await manager.broadcast({
        "type": "traffic_update",
        "data": latest_traffic_data
    })

async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        if latest_traffic_data:
            await websocket.send_text(json.dumps({
                "type": "traffic_update",
                "data": latest_traffic_data
            }))
        while True:
            await asyncio.sleep(30)
            await refresh_traffic_data()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
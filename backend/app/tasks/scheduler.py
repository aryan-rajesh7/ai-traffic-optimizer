from celery import Celery
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "traffic_optimizer",
    broker=REDIS_URL,
    backend=REDIS_URL
)

celery_app.conf.beat_schedule = {
    "refresh-traffic-every-30-seconds": {
        "task": "app.tasks.scheduler.refresh_traffic",
        "schedule": 30.0,
    },
}

celery_app.conf.timezone = "UTC"

@celery_app.task
def refresh_traffic():
    from app.ws.stream import refresh_traffic_data
    print("Running scheduled traffic refresh...")
    asyncio.run(refresh_traffic_data())
    print("Scheduled refresh complete!")
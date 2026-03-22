from celery import Celery
from celery.schedules import crontab
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
    "ingest-traffic-every-30-seconds": {
        "task": "app.tasks.scheduler.ingest_traffic",
        "schedule": 30.0,
    },
}


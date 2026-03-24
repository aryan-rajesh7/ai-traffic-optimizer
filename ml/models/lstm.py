import numpy as np
import pandas as pd
from supabase import create_client
import os
from dotenv import load_dotenv
from datetime import datetime


load_dotenv()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

SEQUENCE_LENGTH = 10

def fetch_training_data() -> pd.DataFrame:
    result = (
        supabase.table("sensor_readings")
        .select("*, intersections(name, city)")
        .order("recorded_at", desc=False)
        .execute()
    )
    df = pd.DataFrame(result.data)
    return df
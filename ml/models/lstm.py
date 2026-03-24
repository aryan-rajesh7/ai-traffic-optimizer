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

def prepare_features(df: pd.DataFrame) -> pd.DataFrame:
    df["recorded_at"] = pd.to_datetime(df["recorded_at"])
    df["hour"] = df["recorded_at"].dt.hour
    df["day_of_week"] = df["recorded_at"].dt.dayofweek
    df["rolling_avg"] = (
        df.groupby("intersection_id")["congestion_score"]
        .transform(lambda x: x.rolling(3, min_periods=1).mean())
    )
    df["lag_1"] = df.groupby("intersection_id")["congestion_score"].shift(1)
    df["lag_2"] = df.groupby("intersection_id")["congestion_score"].shift(2)
    df = df.dropna()
    return df

def create_sequences(data: np.ndarray, sequence_length: int):
    X, y = [], []
    for i in range(len(data) - sequence_length):
        X.append(data[i:i + sequence_length])
        y.append(data[i + sequence_length, 0])
    return np.array(X), np.array(y)
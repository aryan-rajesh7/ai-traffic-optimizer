import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import os
import pickle
from supabase import create_client
from dotenv import load_dotenv

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



class CongestionLSTM(nn.Module):
    def __init__(self, input_size=5, hidden_size=64, num_layers=2, dropout=0.2):
        super(CongestionLSTM, self).__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout
        )
        self.dropout = nn.Dropout(dropout)
        self.fc = nn.Linear(hidden_size, 1)

    def forward(self, x):
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size)
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size)
        out, _ = self.lstm(x, (h0, c0))
        out = self.dropout(out[:, -1, :])
        out = self.fc(out)
        return out

def train_lstm(df):
    print("Training LSTM model...")
    features = ["congestion_score", "hour", "day_of_week", "rolling_avg", "lag_1"]
    scaler = MinMaxScaler()
    scaled = scaler.fit_transform(df[features])
    X, y = create_sequences(scaled, SEQUENCE_LENGTH)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    X_train = torch.FloatTensor(X_train)
    X_test = torch.FloatTensor(X_test)
    y_train = torch.FloatTensor(y_train)
    y_test = torch.FloatTensor(y_test)
    model = CongestionLSTM(input_size=5)
    criterion = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
    train_losses = []
    test_losses = []
    epochs = 100
 
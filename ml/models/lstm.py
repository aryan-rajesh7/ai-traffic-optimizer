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

SEQUENCE_LENGTH = 10

def generate_synthetic_data() -> pd.DataFrame:
        print("Generating synthetic training data...")
        np.random.seed(42)
        n_readings = 1000
        intersection_ids = [f"intersection_{i}" for i in range(5)]
        cities = ["New York", "San Francisco", "Chicago", "Los Angeles", "Seattle"]
        rows = []
        base_time = pd.Timestamp.now() - pd.Timedelta(hours=24)
        for i in range(n_readings):
            for j, (iid, city) in enumerate(zip(intersection_ids, cities)):
                hour = (base_time + pd.Timedelta(minutes=i * 2)).hour
                rush_hour = 1 if (7 <= hour <= 9 or 16 <= hour <= 18) else 0
                base_score = 0.3 + rush_hour * 0.3 + np.random.normal(0, 0.1)
                congestion_score = float(np.clip(base_score, 0.0, 1.0))
                rows.append({
                    "intersection_id": iid,
                    "city": city,
                    "congestion_score": congestion_score,
                    "average_speed": float(np.random.uniform(5, 60)),
                    "vehicle_count": int(np.random.randint(10, 100)),
                    "recorded_at": (base_time + pd.Timedelta(minutes=i * 2)).isoformat(),
                })
        df = pd.DataFrame(rows)
        print(f"Generated {len(df)} synthetic readings")
        return df

def prepare_features(df: pd.DataFrame) -> pd.DataFrame:
    print("Preparing features...")
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
    print(f"Features prepared. Shape: {df.shape}")
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
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    X_train = torch.FloatTensor(X_train)
    X_test = torch.FloatTensor(X_test)
    y_train = torch.FloatTensor(y_train)
    y_test = torch.FloatTensor(y_test)
    model = CongestionLSTM(input_size=5)
    criterion = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
    train_losses = []
    test_losses = []
    for epoch in range(100):
        model.train()
        optimizer.zero_grad()
        output = model(X_train)
        loss = criterion(output.squeeze(), y_train)
        loss.backward()
        optimizer.step()
        model.eval()
        with torch.no_grad():
            test_output = model(X_test)
            test_loss = criterion(test_output.squeeze(), y_test)
        train_losses.append(loss.item())
        test_losses.append(test_loss.item())
        if (epoch + 1) % 10 == 0:
            print(f"Epoch {epoch+1}/100 - Train Loss: {loss.item():.4f} - Test Loss: {test_loss.item():.4f}")
    return model, scaler, train_losses, test_losses, X_test, y_test

def save_model(model, scaler):
    os.makedirs("ml/saved_models", exist_ok=True)
    torch.save(model.state_dict(), "ml/saved_models/lstm_model.pt")
    with open("ml/saved_models/scaler.pkl", "wb") as f:
        pickle.dump(scaler, f)
    print("Model saved to ml/saved_models/")

def plot_training_loss(train_losses, test_losses):
    os.makedirs("ml/plots", exist_ok=True)
    plt.figure(figsize=(10, 6))
    plt.plot(train_losses, label="Training Loss", color="blue", linewidth=2)
    plt.plot(test_losses, label="Test Loss", color="orange", linewidth=2)
    plt.title("LSTM Training Loss Over Time")
    plt.xlabel("Epoch")
    plt.ylabel("Loss (MSE)")
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig("ml/plots/training_loss.png", dpi=150)
    plt.close()
    print("Saved training_loss.png")

def plot_congestion_over_time(df):
    os.makedirs("ml/plots", exist_ok=True)
    plt.figure(figsize=(14, 7))
    for iid in df["intersection_id"].unique():
        subset = df[df["intersection_id"] == iid]
        city = subset.iloc[0]["city"]
        plt.plot(subset["recorded_at"], subset["congestion_score"], label=city, linewidth=1.5, alpha=0.8)
    plt.title("Congestion Score Over Time by City")
    plt.xlabel("Time")
    plt.ylabel("Congestion Score")
    plt.legend(loc="upper right", fontsize=8)
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig("ml/plots/congestion_over_time.png", dpi=150)
    plt.close()
    print("Saved congestion_over_time.png")

def plot_prediction_vs_actual(model, X_test, y_test, scaler):
    os.makedirs("ml/plots", exist_ok=True)
    model.eval()
    with torch.no_grad():
        predictions = model(X_test).squeeze().numpy()
    actual = y_test.numpy()
    plt.figure(figsize=(12, 6))
    plt.plot(actual[:100], label="Actual", color="blue", linewidth=2)
    plt.plot(predictions[:100], label="Predicted", color="red", linewidth=2, linestyle="--")
    plt.title("LSTM: Predicted vs Actual Congestion Score")
    plt.xlabel("Time Step")
    plt.ylabel("Congestion Score")
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig("ml/plots/prediction_vs_actual.png", dpi=150)
    plt.close()
    print("Saved prediction_vs_actual.png")

def plot_city_comparison(df):
    os.makedirs("ml/plots", exist_ok=True)
    city_avg = df.groupby("city")["congestion_score"].mean()
    colors = ["red" if s > 0.3 else "orange" if s > 0.15 else "green" for s in city_avg.values]
    plt.figure(figsize=(12, 6))
    bars = plt.bar(city_avg.index, city_avg.values, color=colors, alpha=0.8, edgecolor="black")
    plt.title("Average Congestion Score by City")
    plt.xlabel("City")
    plt.ylabel("Average Congestion Score")
    plt.xticks(rotation=15, ha="right")
    for bar, score in zip(bars, city_avg.values):
        plt.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.005, f"{score:.2f}", ha="center", fontsize=10)
    plt.grid(True, alpha=0.3, axis="y")
    plt.tight_layout()
    plt.savefig("ml/plots/city_comparison.png", dpi=150)
    plt.close()
    print("Saved city_comparison.png")
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import xgboost as xgb
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import os
import pickle

from models.lstm import CongestionLSTM, create_sequences, plot_training_loss, plot_prediction_vs_actual
from models.xgboost_model import plot_xgboost_feature_importance, plot_xgboost_predictions

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PLOTS_DIR = os.path.join(BASE_DIR, "plots")
MODELS_DIR = os.path.join(BASE_DIR, "saved_models")

SEQUENCE_LENGTH = 10
XGB_FEATURES = ["hour", "day_of_week", "rolling_avg", "lag_1", "lag_2"]
LSTM_FEATURES = ["congestion_score", "hour", "day_of_week", "rolling_avg", "lag_1"]
TARGET = "congestion_score"

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
                "recorded_at": (base_time + pd.Timedelta(minutes=i * 2)).isoformat(),
            })
    return pd.DataFrame(rows)

def prepare_features(df: pd.DataFrame) -> pd.DataFrame:
    print("Preparing features...")
    df["recorded_at"] = pd.to_datetime(df["recorded_at"])
    df["hour"] = df["recorded_at"].dt.hour
    df["day_of_week"] = df["recorded_at"].dt.dayofweek
    df["rolling_avg"] = df.groupby("intersection_id")["congestion_score"].transform(lambda x: x.rolling(3, min_periods=1).mean())
    df["lag_1"] = df.groupby("intersection_id")["congestion_score"].shift(1)
    df["lag_2"] = df.groupby("intersection_id")["congestion_score"].shift(2)
    return df.dropna()

def plot_general_stats(df, save_dir):
    os.makedirs(save_dir, exist_ok=True)
    
    plt.figure(figsize=(14, 7))
    for iid in df["intersection_id"].unique():
        subset = df[df["intersection_id"] == iid]
        city = subset.iloc[0]["city"]
        plt.plot(subset["recorded_at"], subset["congestion_score"], label=city, linewidth=1.5, alpha=0.8)
    plt.title("Congestion Score Over Time by City")
    plt.legend(loc="upper right", fontsize=8)
    plt.tight_layout()
    plt.savefig(os.path.join(save_dir, "congestion_over_time.png"), dpi=150)
    plt.close()

    city_avg = df.groupby("city")["congestion_score"].mean()
    colors = ["red" if s > 0.3 else "orange" if s > 0.15 else "green" for s in city_avg.values]
    plt.figure(figsize=(12, 6))
    bars = plt.bar(city_avg.index, city_avg.values, color=colors, alpha=0.8, edgecolor="black")
    plt.title("Average Congestion Score by City")
    plt.tight_layout()
    plt.savefig(os.path.join(save_dir, "city_comparison.png"), dpi=150)
    plt.close()

if __name__ == "__main__":
    os.makedirs(PLOTS_DIR, exist_ok=True)
    os.makedirs(MODELS_DIR, exist_ok=True)
    
    df_raw = generate_synthetic_data()
    df_prepared = prepare_features(df_raw)
    plot_general_stats(df_prepared, PLOTS_DIR)
    
    print("\n--- Training LSTM ---")
    scaler = MinMaxScaler()
    scaled = scaler.fit_transform(df_prepared[LSTM_FEATURES])
    X, y = create_sequences(scaled, SEQUENCE_LENGTH)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    lstm_model = CongestionLSTM(input_size=len(LSTM_FEATURES))
    criterion = nn.MSELoss()
    optimizer = torch.optim.Adam(lstm_model.parameters(), lr=0.001)
    
    train_losses, test_losses = [], []
    X_train_t, X_test_t = torch.FloatTensor(X_train), torch.FloatTensor(X_test)
    y_train_t, y_test_t = torch.FloatTensor(y_train), torch.FloatTensor(y_test)
    
    for epoch in range(100):
        lstm_model.train()
        optimizer.zero_grad()
        output = lstm_model(X_train_t)
        loss = criterion(output.squeeze(), y_train_t)
        loss.backward()
        optimizer.step()
        
        lstm_model.eval()
        with torch.no_grad():
            test_loss = criterion(lstm_model(X_test_t).squeeze(), y_test_t)
        train_losses.append(loss.item())
        test_losses.append(test_loss.item())
        if (epoch + 1) % 20 == 0: print(f"LSTM Epoch {epoch+1} - Loss: {loss.item():.4f}")
            
    plot_training_loss(train_losses, test_losses, PLOTS_DIR)
    plot_prediction_vs_actual(lstm_model, X_test_t, y_test_t, PLOTS_DIR)
    
    torch.save(lstm_model.state_dict(), os.path.join(MODELS_DIR, "lstm_model.pt"))
    with open(os.path.join(MODELS_DIR, "scaler.pkl"), "wb") as f: pickle.dump(scaler, f)
        
    print("\n--- Training XGBoost ---")
    X_xgb = df_prepared[XGB_FEATURES]
    y_xgb = df_prepared[TARGET]
    X_train_x, X_test_x, y_train_x, y_test_x = train_test_split(X_xgb, y_xgb, test_size=0.2, random_state=42)
    
    xgb_model = xgb.XGBRegressor(n_estimators=100, learning_rate=0.1, max_depth=6, random_state=42)
    xgb_model.fit(X_train_x, y_train_x)
    xgb_predictions = xgb_model.predict(X_test_x)
    print(f"XGBoost RMSE: {np.sqrt(mean_squared_error(y_test_x, xgb_predictions)):.4f}")
    
    plot_xgboost_feature_importance(xgb_model, XGB_FEATURES, PLOTS_DIR)
    plot_xgboost_predictions(y_test_x, xgb_predictions, PLOTS_DIR)
    
    with open(os.path.join(MODELS_DIR, "xgboost_model.pkl"), "wb") as f: pickle.dump(xgb_model, f)
    print(f"\nPipeline Complete. Models saved in {MODELS_DIR} and plots saved in {PLOTS_DIR}!")
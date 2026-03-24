import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import pickle
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

FEATURES = ["hour", "day_of_week", "rolling_avg", "lag_1", "lag_2"]
TARGET = "congestion_score"

def train_xgboost(df: pd.DataFrame):
    print("Training XGBoost model...")
    X = df[FEATURES]
    y = df[TARGET]
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    model = xgb.XGBRegressor(
        n_estimators=100,
        learning_rate=0.1,
        max_depth=6,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        verbosity=0
    )
    model.fit(
        X_train, y_train,
        eval_set=[(X_test, y_test)],
        verbose=False
    )
    predictions = model.predict(X_test)
    mse = mean_squared_error(y_test, predictions)
    rmse = np.sqrt(mse)
    print(f"XGBoost RMSE: {rmse:.4f}")
    return model, X_test, y_test, predictions


def plot_xgboost_feature_importance(model):
    print("Generating XGBoost feature importance graph...")
    os.makedirs("ml/plots", exist_ok=True)
    importance = model.feature_importances_
    plt.figure(figsize=(10, 6))
    colors = ["#2196F3", "#4CAF50", "#FF9800", "#F44336", "#9C27B0"]
    bars = plt.bar(FEATURES, importance, color=colors, alpha=0.85, edgecolor="black")
    plt.title("XGBoost Feature Importance")
    plt.xlabel("Feature")
    plt.ylabel("Importance Score")
    for bar, score in zip(bars, importance):
        plt.text(
            bar.get_x() + bar.get_width() / 2,
            bar.get_height() + 0.002,
            f"{score:.3f}",
            ha="center",
            fontsize=10
        )
    plt.grid(True, alpha=0.3, axis="y")
    plt.tight_layout()
    plt.savefig("ml/plots/xgboost_feature_importance.png", dpi=150)
    plt.close()
    print("Saved xgboost_feature_importance.png")

def plot_xgboost_predictions(y_test, predictions):
    print("Generating XGBoost prediction graph...")
    os.makedirs("ml/plots", exist_ok=True)
    plt.figure(figsize=(12, 6))
    plt.plot(y_test.values[:100], label="Actual", color="blue", linewidth=2)
    plt.plot(predictions[:100], label="Predicted", color="green",
             linewidth=2, linestyle="--")
    plt.title("XGBoost: Predicted vs Actual Congestion Score")
    plt.xlabel("Time Step")
    plt.ylabel("Congestion Score")
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig("ml/plots/xgboost_predictions.png", dpi=150)
    plt.close()
    print("Saved xgboost_predictions.png")

def save_xgboost_model(model):
    os.makedirs("ml/saved_models", exist_ok=True)
    with open("ml/saved_models/xgboost_model.pkl", "wb") as f:
        pickle.dump(model, f)
    print("XGBoost model saved to ml/saved_models/")
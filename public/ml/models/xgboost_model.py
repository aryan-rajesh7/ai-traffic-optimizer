import xgboost as xgb
import numpy as np
import matplotlib.pyplot as plt
import os

def plot_xgboost_feature_importance(model, features, save_dir):
    os.makedirs(save_dir, exist_ok=True)
    importance = model.feature_importances_
    colors = ["#2196F3", "#4CAF50", "#FF9800", "#F44336", "#9C27B0"]
    plt.figure(figsize=(10, 6))
    bars = plt.bar(features, importance, color=colors, alpha=0.85, edgecolor="black")
    plt.title("XGBoost Feature Importance")
    plt.xlabel("Feature")
    plt.ylabel("Importance Score")
    for bar, score in zip(bars, importance):
        plt.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.002, f"{score:.3f}", ha="center", fontsize=10)
    plt.grid(True, alpha=0.3, axis="y")
    plt.tight_layout()
    plt.savefig(os.path.join(save_dir, "xgboost_feature_importance.png"), dpi=150)
    plt.close()

def plot_xgboost_predictions(y_test, predictions, save_dir):
    os.makedirs(save_dir, exist_ok=True)
    plt.figure(figsize=(12, 6))
    plt.plot(y_test.values[:100], label="Actual", color="blue", linewidth=2)
    plt.plot(predictions[:100], label="Predicted", color="green", linewidth=2, linestyle="--")
    plt.title("XGBoost: Predicted vs Actual Congestion Score")
    plt.xlabel("Time Step")
    plt.ylabel("Congestion Score")
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(os.path.join(save_dir, "xgboost_predictions.png"), dpi=150)
    plt.close()
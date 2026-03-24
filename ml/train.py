import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.lstm import (
    fetch_training_data,
    prepare_features,
    train_lstm,
    save_model,
    plot_training_loss,
    plot_congestion_over_time,
    plot_prediction_vs_actual,
    plot_city_comparison,
    SEQUENCE_LENGTH
)
from models.xgboost_model import (
    train_xgboost,
    plot_xgboost_feature_importance,
    plot_xgboost_predictions,
    save_xgboost_model
)

def run_training():
    print("=" * 50)
    print("AI Traffic Signal Optimizer — ML Training")
    print("=" * 50)

    df = fetch_training_data()

    if len(df) < SEQUENCE_LENGTH + 1:
        print(f"Not enough data. Need {SEQUENCE_LENGTH + 1} rows, have {len(df)}")
        return

    print(f"Dataset size: {len(df)} readings")
    df = prepare_features(df)

    print("\n--- Generating data visualizations ---")
    plot_congestion_over_time(df)
    plot_city_comparison(df)

    print("\n--- Training LSTM model ---")
    model, scaler, train_losses, test_losses, X_test, y_test = train_lstm(df)
    plot_training_loss(train_losses, test_losses)
    plot_prediction_vs_actual(model, X_test, y_test, scaler)
    save_model(model, scaler)

    print("\n--- Training XGBoost model ---")
    xgb_model, X_test_xgb, y_test_xgb, predictions = train_xgboost(df)
    plot_xgboost_feature_importance(xgb_model)
    plot_xgboost_predictions(y_test_xgb, predictions)
    save_xgboost_model(xgb_model)

    print("\n" + "=" * 50)
    print("Training complete!")
    print(f"LSTM  - Final train loss: {train_losses[-1]:.4f}")
    print(f"LSTM  - Final test loss:  {test_losses[-1]:.4f}")
    print("Graphs saved to ml/plots/")
    print("Models saved to ml/saved_models/")
    print("=" * 50)

if __name__ == "__main__":
    run_training()
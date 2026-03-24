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

def run_training():
    print("=" * 50)
    print("AI Traffic Signal Optimizer — ML Training")
    print("=" * 50)

    df = fetch_training_data()

    if len(df) < SEQUENCE_LENGTH + 1:
        print(f"Not enough data to train. Need at least {SEQUENCE_LENGTH + 1} rows.")
        print(f"Currently have {len(df)} rows.")
        print("Wait for Celery to collect more data and try again.")
        return

    print(f"Dataset size: {len(df)} readings")

    df = prepare_features(df)

    print("Generating congestion over time graph...")
    plot_congestion_over_time(df)

    print("Generating city comparison graph...")
    plot_city_comparison(df)

    model, scaler, train_losses, test_losses, X_test, y_test = train_lstm(df)

    print("Generating training loss graph...")
    plot_training_loss(train_losses, test_losses)

    print("Generating prediction vs actual graph...")
    plot_prediction_vs_actual(model, X_test, y_test, scaler)

    save_model(model, scaler)

    print("=" * 50)
    print("Training complete!")
    print(f"Final train loss: {train_losses[-1]:.4f}")
    print(f"Final test loss:  {test_losses[-1]:.4f}")
    print("Graphs saved to ml/plots/")
    print("Model saved to ml/saved_models/")
    print("=" * 50)


if __name__ == "__main__":
    run_training()
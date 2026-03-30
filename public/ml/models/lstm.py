import torch
import torch.nn as nn
import numpy as np
import matplotlib.pyplot as plt
import os

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

def create_sequences(data: np.ndarray, sequence_length: int):
    X, y = [], []
    for i in range(len(data) - sequence_length):
        X.append(data[i:i + sequence_length])
        y.append(data[i + sequence_length, 0])
    return np.array(X), np.array(y)

def plot_training_loss(train_losses, test_losses, save_dir):
    os.makedirs(save_dir, exist_ok=True)
    plt.figure(figsize=(10, 6))
    plt.plot(train_losses, label="Training Loss", color="blue", linewidth=2)
    plt.plot(test_losses, label="Test Loss", color="orange", linewidth=2)
    plt.title("LSTM Training Loss Over Time")
    plt.xlabel("Epoch")
    plt.ylabel("Loss (MSE)")
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(os.path.join(save_dir, "training_loss.png"), dpi=150)
    plt.close()

def plot_prediction_vs_actual(model, X_test, y_test, save_dir):
    os.makedirs(save_dir, exist_ok=True)
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
    plt.savefig(os.path.join(save_dir, "prediction_vs_actual.png"), dpi=150)
    plt.close()
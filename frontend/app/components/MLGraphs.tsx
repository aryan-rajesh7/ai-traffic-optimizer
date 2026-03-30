"use client";

import { useState } from "react";
import Image from "next/image";

const graphs = [
  {
    file: "/ml-graphs/training_loss.png",
    title: "LSTM Training Loss",
    description: "Training and test loss over 100 epochs. Both lines converge showing the model learned without overfitting."
  },
  {
    file: "/ml-graphs/prediction_vs_actual.png",
    title: "LSTM: Predicted vs Actual",
    description: "Red dashed line shows LSTM predictions against blue actual congestion scores."
  },
  {
    file: "/ml-graphs/xgboost_predictions.png",
    title: "XGBoost: Predicted vs Actual",
    description: "Green dashed line shows XGBoost predictions. XGBoost tracks individual spikes more accurately."
  },
  {
    file: "/ml-graphs/xgboost_feature_importance.png",
    title: "XGBoost Feature Importance",
    description: "Which features the model relied on most. Rolling average and lag features are most predictive."
  },
  {
    file: "/ml-graphs/congestion_over_time.png",
    title: "Congestion Over Time",
    description: "Live congestion patterns across all 5 cities. Rush hour spikes visible at 8am and 5pm."
  },
  {
    file: "/ml-graphs/city_comparison.png",
    title: "City Comparison",
    description: "Average congestion scores by city. Red bars indicate high congestion cities."
  },
];

export default function MLGraphs() {
  const [open, setOpen] = useState(false);
  const [activeGraph, setActiveGraph] = useState(0);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          bottom: "16px",
          right: "396px",
          background: "#533483",
          color: "white",
          border: "none",
          borderRadius: "8px",
          padding: "8px 16px",
          fontSize: "12px",
          fontWeight: "bold",
          cursor: "pointer",
          zIndex: 9999,
        }}
      >
        {open ? "Hide ML Graphs ↓" : "Show ML Graphs ↑"}
      </button>

      {open && (
        <div style={{
          position: "fixed",
          bottom: "52px",
          right: "396px",
          width: "600px",
          background: "#1a1a2e",
          border: "1px solid #333",
          borderRadius: "12px",
          padding: "16px",
          zIndex: 9998,
          maxHeight: "70vh",
          overflowY: "auto"
        }}>
          <h3 style={{ color: "white", fontSize: "16px", fontWeight: "bold", margin: "0 0 12px" }}>
            ML Training Results
          </h3>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
            {graphs.map((g, i) => (
              <button
                key={i}
                onClick={() => setActiveGraph(i)}
                style={{
                  background: activeGraph === i ? "#533483" : "#0f3460",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  padding: "4px 10px",
                  fontSize: "11px",
                  cursor: "pointer",
                  fontWeight: activeGraph === i ? "bold" : "normal"
                }}
              >
                {g.title}
              </button>
            ))}
          </div>

          <div style={{
            background: "#0f0f1a",
            borderRadius: "8px",
            padding: "12px",
            marginBottom: "8px"
          }}>
            <img
              src={graphs[activeGraph].file}
              alt={graphs[activeGraph].title}
              style={{ width: "100%", borderRadius: "6px" }}
            />
          </div>

          <p style={{ color: "#888", fontSize: "12px", margin: 0, lineHeight: "1.5" }}>
            {graphs[activeGraph].description}
          </p>
        </div>
      )}
    </>
  );
}
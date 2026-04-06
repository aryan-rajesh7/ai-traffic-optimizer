"use client";

import { Intersection } from "../hooks/useTrafficData";

interface StatsBarProps {
  traffic: Intersection[];
}

export default function StatsBar({ traffic }: StatsBarProps) {
  if (traffic.length === 0) return null;

  const avgCongestion = traffic.reduce((sum, i) => sum + i.congestion_score, 0) / traffic.length;
  const mostCongested = traffic.reduce((prev, curr) =>
    prev.congestion_score > curr.congestion_score ? prev : curr
  );
  const clearCount = traffic.filter((i) => i.congestion_score < 0.3).length;
  const heavyCount = traffic.filter((i) => i.congestion_score >= 0.6).length;

  function getCongestionColor(score: number): string {
    if (score < 0.3) return "#22c55e";
    if (score < 0.6) return "#eab308";
    if (score < 0.8) return "#f97316";
    return "#ef4444";
  }

  return (
    <div
      style={{
        position: "absolute",
        top: "12px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(255, 255, 255, 0.85)", // Light, translucent gray-white
        backdropFilter: "blur(8px)",
        border: "1px solid #d1d5db", // Subtle gray border
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        borderRadius: "12px",
        padding: "8px 24px",
        display: "flex",
        gap: "24px",
        alignItems: "center",
        color: "#1f2937", // Dark gray text
        fontSize: "12px",
        zIndex: 10,
        whiteSpace: "nowrap",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: "10px", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>Avg Congestion</span>
        <span style={{ fontWeight: "bold", fontSize: "14px", color: getCongestionColor(avgCongestion) }}>
          {avgCongestion.toFixed(2)}
        </span>
      </div>

      <div style={{ width: "1px", height: "24px", background: "#e5e7eb" }} />

      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: "10px", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>Worst Traffic</span>
        <span style={{ fontWeight: "bold", fontSize: "14px", color: getCongestionColor(mostCongested.congestion_score) }}>
          {mostCongested.name}
        </span>
      </div>

      <div style={{ width: "1px", height: "24px", background: "#e5e7eb" }} />

      <div style={{ display: "flex", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#22c55e" }} />
          <span style={{ fontWeight: "500" }}>{clearCount} Clear</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ef4444" }} />
          <span style={{ fontWeight: "500" }}>{heavyCount} Heavy</span>
        </div>
      </div>
    </div>
  );
}

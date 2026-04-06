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
        background: "rgba(255, 255, 255, 0.9)", // Changed to light translucent background
        border: "1px solid #e2e8f0", // Added border to match Sidebar
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)", // Added shadow
        backdropFilter: "blur(8px)",
        borderRadius: "12px",
        padding: "8px 20px",
        display: "flex",
        gap: "24px",
        alignItems: "center",
        color: "#0f172a", // Changed text color to dark slate
        fontSize: "12px",
        zIndex: 10,
        whiteSpace: "nowrap",
      }}
    >
    </div>
  );
}

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
      background: "rgba(0, 0, 0, 0.5)",
      backdropFilter: "blur(8px)",
      borderRadius: "12px",
      padding: "8px 20px",
      display: "flex",
      gap: "24px",
      alignItems: "center",
      color: "white",
      fontSize: "12px",
      zIndex: 10,
      whiteSpace: "nowrap",
    }}
  >
  </div>
);

}
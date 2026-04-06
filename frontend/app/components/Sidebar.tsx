"use client";

import { useState } from "react";
import { Intersection } from "../hooks/useTrafficData";

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/#{1,6}\s/g, "")
    .replace(/\n\n/g, "\n")
    .trim();
}

interface SidebarProps {
  traffic: Intersection[];
  loading: boolean;
  refreshing: boolean;
  lastUpdated: Date | null;
  onIntersectionClick: (intersection: Intersection) => void;
  onRefresh: () => void;
  onAddCustomLocation: (location: Intersection) => void;
  onRemoveCustomLocation: (name: string) => void;
  customLocations: Intersection[];
}

function getCongestionColor(score: number): string {
  if (score < 0.3) return "#22c55e";
  if (score < 0.6) return "#eab308";
  if (score < 0.8) return "#f97316";
  return "#ef4444";
}

function getCongestionLabel(score: number): string {
  if (score < 0.3) return "Low";
  if (score < 0.6) return "Moderate";
  if (score < 0.8) return "High";
  return "Severe";
}

export default function Sidebar({
  traffic,
  loading,
  refreshing,
  lastUpdated,
  onIntersectionClick,
  onRefresh,
  onAddCustomLocation,
  onRemoveCustomLocation,
  customLocations,
}: SidebarProps) {
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [recLoading, setRecLoading] = useState(false);
  const [activeIntersection, setActiveIntersection] = useState<string | null>(null);
  const [customAddress, setCustomAddress] = useState("");
  const [customName, setCustomName] = useState("");
  const [customResult, setCustomResult] = useState<string | null>(null);
  const [customLoading, setCustomLoading] = useState(false);
  
  interface MlPrediction {
    current_congestion: number;
    predicted_congestion: number;
    model: string;
  }

  const [mlPrediction, setMlPrediction] = useState<MlPrediction | null>(null);
  
  const getRecommendation = async (intersection: Intersection) => {
    setRecLoading(true);
    setActiveIntersection(intersection.name);
    setRecommendation(null);
    setExplanation(null);
    setMlPrediction(null);

    try {
      const encodedName = encodeURIComponent(intersection.name);
      const [recRes, expRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/recommend/${encodedName}`),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/explain/${encodedName}`),
      ]);
      const recData = await recRes.json();
      const expData = await expRes.json();
      setRecommendation(recData.recommendation);
      setExplanation(expData.explanation);
    } catch {
      setRecommendation("Failed to get recommendation. Please try again.");
    } finally {
      setRecLoading(false);
    }
  };

  const checkCustomLocation = async () => {
    if (!customAddress || !customName) return;
    setCustomLoading(true);
    setCustomResult(null);

    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(customAddress)}&format=json&limit=1&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "en",
            "User-Agent": "ai-traffic-optimizer"
          }
        }
      );
      const geoData = await geoRes.json();

      if (!geoData || geoData.length === 0) {
        setCustomResult("Address not found. Try: Street Name City State e.g. 'Hollywood Blvd Los Angeles California'");
        setCustomLoading(false);
        return;
      }

      const lat = parseFloat(geoData[0].lat);
      const lon = parseFloat(geoData[0].lon);
      const foundAddress = geoData[0].display_name;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/traffic/custom?lat=${lat}&lon=${lon}&name=${encodeURIComponent(customName)}`
      );
      const data = await res.json();

      const newLocation: Intersection = {
        name: customName,
        city: geoData[0].address?.city ?? geoData[0].address?.town ?? geoData[0].address?.state ?? "Custom",
        lat,
        lon,
        congestion_score: data.congestion_score,
        road_closure: data.road_closure,
        confidence: 1,
      };

      onAddCustomLocation(newLocation);
      setCustomResult(
        `Found: ${foundAddress.split(",").slice(0, 3).join(",")}\nCongestion: ${data.congestion_score} (${data.level})\n${stripMarkdown(data.recommendation)}`
      );
      setCustomName("");
      setCustomAddress("");
    } catch {
      setCustomResult("Failed to fetch. Check your connection and try again.");
    } finally {
      setCustomLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        width: "380px",
        background: "#f8fafc",
        color: "#0f172a",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        borderRight: "1px solid #e2e8f0"
      }}>
        <div style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" }}>
          <div style={{ height: "20px", width: "60%", background: "#e2e8f0", borderRadius: "4px", marginBottom: "8px" }} />
          <div style={{ height: "12px", width: "40%", background: "#e2e8f0", borderRadius: "4px" }} />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{
            background: "#e2e8f0",
            borderRadius: "8px",
            padding: "12px",
            height: "80px",
            opacity: Math.max(0.2, 1 - i * 0.15)
          }} />
        ))}
      </div>
    );
  }

  return (
    <div style={{
      width: "380px",
      background: "#f8fafc",
      color: "#0f172a",
      padding: "16px",
      overflowY: "auto",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      borderRight: "1px solid #e2e8f0"
    }}>

      {/* Header */}
      <div style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ fontSize: "18px", fontWeight: "bold", margin: 0, color: "#1e293b" }}>
            AI Traffic Optimizer
          </h1>
          <button
            onClick={onRefresh}
            disabled={refreshing}
            style={{
              background: refreshing ? "#94a3b8" : "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "6px 12px",
              fontSize: "11px",
              cursor: refreshing ? "not-allowed" : "pointer",
              fontWeight: "bold",
              transition: "background-color 0.2s"
            }}
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
        <p style={{ fontSize: "11px", color: "#64748b", margin: "6px 0 0" }}>
          {lastUpdated
            ? `Last updated: ${lastUpdated.toLocaleTimeString()}`
            : "Loading live traffic data..."}
        </p>
      </div>

      {/* Custom Location */}
      <div style={{ 
        background: "#ffffff", 
        borderRadius: "8px", 
        padding: "16px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        border: "1px solid #e2e8f0"
      }}>
        <p style={{ fontWeight: "bold", fontSize: "13px", margin: "0 0 10px", color: "#1e293b" }}>
          Check Custom Location
        </p>
        <input
          type="text"
          placeholder="Name e.g. My Home, Office"
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #cbd5e1",
            background: "#ffffff",
            color: "#0f172a",
            fontSize: "12px",
            marginBottom: "8px",
            outline: "none",
            boxSizing: "border-box"
          }}
        />
        <input
          type="text"
          placeholder="e.g. 1600 Pennsylvania Ave Washington DC"
          value={customAddress}
          onChange={(e) => setCustomAddress(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #cbd5e1",
            background: "#ffffff",
            color: "#0f172a",
            fontSize: "12px",
            marginBottom: "6px",
            outline: "none",
            boxSizing: "border-box"
          }}
        />
        <p style={{ fontSize: "11px", color: "#64748b", margin: "0 0 10px" }}>
          Tip: Street Name City State — no commas needed
        </p>
        <button
          onClick={checkCustomLocation}
          disabled={customLoading || !customAddress || !customName}
          style={{
            width: "100%",
            padding: "8px",
            background: customLoading ? "#94a3b8" : "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: customLoading ? "not-allowed" : "pointer",
            fontSize: "12px",
            fontWeight: "bold",
            transition: "background-color 0.2s"
          }}
        >
          {customLoading ? "Finding location..." : "Check Traffic / AI Reccomendation"}
        </button>
        {customResult && (
          <div style={{
            marginTop: "12px",
            background: "#f1f5f9",
            borderRadius: "6px",
            padding: "10px",
            fontSize: "12px",
            color: "#334155",
            lineHeight: "1.6",
            whiteSpace: "pre-wrap",
            border: "1px solid #e2e8f0"
          }}>
            {customResult}
          </div>
        )}
      </div>

      {/* Custom Locations List */}
      {customLocations.length > 0 && (
        <div style={{ 
          background: "#ffffff", 
          borderRadius: "8px", 
          padding: "16px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          border: "1px solid #e2e8f0"
        }}>
          <p style={{ fontWeight: "bold", fontSize: "13px", margin: "0 0 10px", color: "#1e293b" }}>
            Custom Locations ({customLocations.length})
          </p>
          {customLocations.map((loc) => {
            const color = getCongestionColor(loc.congestion_score);
            const label = getCongestionLabel(loc.congestion_score);
            return (
              <div key={loc.name} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                padding: "8px 10px"
              }}>
                <div>
                  <p style={{ margin: 0, fontSize: "12px", fontWeight: "bold", color: "#0f172a" }}>{loc.name}</p>
                  <p style={{ margin: "2px 0 0", fontSize: "11px", color, fontWeight: "600" }}>{label} ({loc.congestion_score})</p>
                  <p style={{ margin: "2px 0 0", fontSize: "10px", color: "#64748b" }}>{loc.city}</p>
                </div>
                <button
                  onClick={() => onRemoveCustomLocation(loc.name)}
                  style={{
                    background: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "4px 8px",
                    cursor: "pointer",
                    fontSize: "11px",
                    fontWeight: "bold"
                  }}
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Traffic Intersections List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {traffic.map((intersection) => {
          const color = getCongestionColor(intersection.congestion_score);
          const label = getCongestionLabel(intersection.congestion_score);
          const isActive = activeIntersection === intersection.name;

          return (
            <div
              key={intersection.name}
              style={{
                background: isActive ? "#eff6ff" : "#ffffff",
                borderRadius: "8px",
                padding: "16px",
                border: isActive ? `2px solid ${color}` : "1px solid #e2e8f0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onClick={() => onIntersectionClick(intersection)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontWeight: "bold", margin: 0, fontSize: "14px", color: "#0f172a" }}>
                    {intersection.name}
                  </p>
                  <p style={{ color: "#64748b", margin: "2px 0 0", fontSize: "12px" }}>
                    {intersection.city}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{
                    background: color,
                    color: "white",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    fontSize: "11px",
                    fontWeight: "bold",
                    display: "inline-block"
                  }}>
                    {label}
                  </div>
                  <p style={{ color, fontWeight: "bold", margin: "4px 0 0", fontSize: "16px" }}>
                    {intersection.congestion_score.toFixed(2)}
                  </p>
                </div>
              </div>

              {intersection.road_closure && (
                <div style={{
                  background: "#ef4444",
                  color: "white",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "11px",
                  marginTop: "10px",
                  display: "inline-block",
                  fontWeight: "bold"
                }}>
                  ROAD CLOSURE
                </div>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  getRecommendation(intersection);
                }}
                style={{
                  marginTop: "12px",
                  width: "100%",
                  padding: "8px",
                  background: isActive ? "#1d4ed8" : "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "bold",
                  transition: "background-color 0.2s"
                }}
              >
                {recLoading && isActive ? "Getting AI Recommendation..." : "Get AI Recommendation"}
              </button>

              {isActive && recommendation && (
                <div style={{
                  marginTop: "12px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  padding: "12px",
                  fontSize: "12px",
                  lineHeight: "1.6"
                }}>
                  <p style={{ color: "#1d4ed8", fontWeight: "bold", margin: "0 0 6px" }}>
                    AI Recommendation
                  </p>
                  <p style={{ margin: 0, color: "#334155", whiteSpace: "pre-wrap" }}>
                    {stripMarkdown(recommendation)}
                  </p>
                  
                  {explanation && (
                    <>
                      <p style={{ color: "#0369a1", fontWeight: "bold", margin: "12px 0 6px" }}>
                        Congestion Explanation
                      </p>
                      <p style={{ margin: 0, color: "#334155", whiteSpace: "pre-wrap" }}>
                        {stripMarkdown(explanation)}
                      </p>
                    </>
                  )}
                  
                  {mlPrediction && (
                    <div style={{ marginTop: "12px", background: "#f0fdf4", padding: "8px", borderRadius: "4px", border: "1px solid #bbf7d0" }}>
                      <p style={{ color: "#059669", fontWeight: "bold", margin: "0 0 4px" }}>
                        ML Prediction (XGBoost)
                      </p>
                      <p style={{ margin: 0, color: "#166534", fontSize: "11px" }}>
                        Current: {mlPrediction.current_congestion} → Predicted: {mlPrediction.predicted_congestion}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

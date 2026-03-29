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
        background: "#1a1a2e",
        color: "white",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px"
      }}>
        <div style={{ borderBottom: "1px solid #333", paddingBottom: "12px" }}>
          <div style={{ height: "20px", width: "60%", background: "#0f3460", borderRadius: "4px", marginBottom: "8px" }} />
          <div style={{ height: "12px", width: "40%", background: "#0f3460", borderRadius: "4px" }} />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{
            background: "#0f3460",
            borderRadius: "8px",
            padding: "12px",
            height: "80px",
            opacity: 1 - i * 0.15
          }} />
        ))}
      </div>
    );
  }

  return (
    <div style={{
      width: "380px",
      background: "#1a1a2e",
      color: "white",
      padding: "16px",
      overflowY: "auto",
      display: "flex",
      flexDirection: "column",
      gap: "12px"
    }}>

      {/* Header */}
      <div style={{ borderBottom: "1px solid #333", paddingBottom: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ fontSize: "18px", fontWeight: "bold", margin: 0 }}>
            AI Traffic Optimizer
          </h1>
          <button
            onClick={onRefresh}
            disabled={refreshing}
            style={{
              background: refreshing ? "#333" : "#533483",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "4px 10px",
              fontSize: "11px",
              cursor: refreshing ? "not-allowed" : "pointer",
              fontWeight: "bold"
            }}
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
        <p style={{ fontSize: "11px", color: "#888", margin: "4px 0 0" }}>
          {lastUpdated
            ? `Last updated: ${lastUpdated.toLocaleTimeString()}`
            : "Loading live traffic data..."}
        </p>
      </div>

      {/* Custom Location */}
      <div style={{ background: "#0f3460", borderRadius: "8px", padding: "12px" }}>
        <p style={{ fontWeight: "bold", fontSize: "13px", margin: "0 0 8px" }}>
          Check Custom Location
        </p>
        <input
          type="text"
          placeholder="Name e.g. My Home, Office"
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          style={{
            width: "100%",
            padding: "6px",
            borderRadius: "4px",
            border: "1px solid #333",
            background: "#1a1a2e",
            color: "white",
            fontSize: "12px",
            marginBottom: "6px"
          }}
        />
        <input
          type="text"
          placeholder="e.g. 1600 Pennsylvania Ave Washington DC"
          value={customAddress}
          onChange={(e) => setCustomAddress(e.target.value)}
          style={{
            width: "100%",
            padding: "6px",
            borderRadius: "4px",
            border: "1px solid #333",
            background: "#1a1a2e",
            color: "white",
            fontSize: "12px",
            marginBottom: "4px"
          }}
        />
        <p style={{ fontSize: "10px", color: "#666", margin: "0 0 6px" }}>
          Tip: Street Name City State — no commas needed
        </p>
        <button
          onClick={checkCustomLocation}
          disabled={customLoading || !customAddress || !customName}
          style={{
            width: "100%",
            padding: "6px",
            background: customLoading ? "#333" : "#533483",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: customLoading ? "not-allowed" : "pointer",
            fontSize: "12px",
            fontWeight: "bold"
          }}
        >
          {customLoading ? "Finding location..." : "Check Traffic"}
        </button>
        {customResult && (
          <div style={{
            marginTop: "8px",
            background: "#0d0d1a",
            borderRadius: "6px",
            padding: "8px",
            fontSize: "12px",
            color: "#ddd",
            lineHeight: "1.6",
            whiteSpace: "pre-wrap"
          }}>
            {customResult}
          </div>
        )}
      </div>

      {customLocations.length > 0 && (
        <div style={{ background: "#0f3460", borderRadius: "8px", padding: "12px" }}>
          <p style={{ fontWeight: "bold", fontSize: "13px", margin: "0 0 8px" }}>
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
                marginBottom: "6px",
                background: "#16213e",
                borderRadius: "6px",
                padding: "6px 8px"
              }}>
                <div>
                  <p style={{ margin: 0, fontSize: "12px", fontWeight: "bold" }}>{loc.name}</p>
                  <p style={{ margin: 0, fontSize: "11px", color }}>{label} ({loc.congestion_score})</p>
                  <p style={{ margin: 0, fontSize: "10px", color: "#666" }}>{loc.city}</p>
                </div>
                <button
                  onClick={() => onRemoveCustomLocation(loc.name)}
                  style={{
                    background: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "2px 8px",
                    cursor: "pointer",
                    fontSize: "11px"
                  }}
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      )}

      {traffic.map((intersection) => {
        const color = getCongestionColor(intersection.congestion_score);
        const label = getCongestionLabel(intersection.congestion_score);
        const isActive = activeIntersection === intersection.name;

        return (
          <div
            key={intersection.name}
            style={{
              background: isActive ? "#16213e" : "#0f3460",
              borderRadius: "8px",
              padding: "12px",
              border: isActive ? `2px solid ${color}` : "2px solid transparent",
              cursor: "pointer",
            }}
            onClick={() => onIntersectionClick(intersection)}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontWeight: "bold", margin: 0, fontSize: "14px" }}>
                  {intersection.name}
                </p>
                <p style={{ color: "#888", margin: "2px 0 0", fontSize: "12px" }}>
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
                  fontWeight: "bold"
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
                padding: "2px 8px",
                borderRadius: "4px",
                fontSize: "11px",
                marginTop: "8px",
                display: "inline-block"
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
                marginTop: "8px",
                width: "100%",
                padding: "6px",
                background: "#533483",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "bold"
              }}
            >
              {recLoading && isActive ? "Getting AI Recommendation..." : "Get AI Recommendation"}
            </button>

            {isActive && recommendation && (
              <div style={{
                marginTop: "10px",
                background: "#0d0d1a",
                borderRadius: "6px",
                padding: "10px",
                fontSize: "12px",
                lineHeight: "1.6"
              }}>
                <p style={{ color: "#a78bfa", fontWeight: "bold", margin: "0 0 6px" }}>
                  AI Recommendation
                </p>
                <p style={{ margin: 0, color: "#ddd" }}>{stripMarkdown(recommendation)}</p>
                {explanation && (
                  <>
                    <p style={{ color: "#60a5fa", fontWeight: "bold", margin: "10px 0 6px" }}>
                      Congestion Explanation
                    </p>
                    <p style={{ margin: 0, color: "#ddd" }}>{stripMarkdown(explanation)}</p>
                  </>
                )}
                {mlPrediction && (
                  <div style={{ marginTop: "8px" }}>
                    <p style={{ color: "#34d399", fontWeight: "bold", margin: "0 0 4px" }}>
                      ML Prediction (XGBoost)
                    </p>
                    <p style={{ margin: 0, color: "#ddd", fontSize: "11px" }}>
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
  );
}
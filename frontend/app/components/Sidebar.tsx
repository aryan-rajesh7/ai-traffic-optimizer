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
@@ -184,7 +189,12 @@
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      borderRight: "1px solid #e2e8f0"
    }}>


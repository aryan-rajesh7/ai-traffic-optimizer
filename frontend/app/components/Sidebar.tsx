"use client";

import { useState } from "react";
import { Intersection } from "../hooks/useTrafficData";

interface SidebarProps {
  traffic: Intersection[];
  loading: boolean;
  selectedIntersection: Intersection | null;
  onIntersectionClick: (intersection: Intersection) => void;
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
  selectedIntersection,
  onIntersectionClick,
}: SidebarProps) {
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [recLoading, setRecLoading] = useState(false);
  const [activeIntersection, setActiveIntersection] = useState<string | null>(null);
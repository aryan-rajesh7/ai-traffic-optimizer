"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useTrafficData, Intersection } from "./hooks/useTrafficData";
import Sidebar from "./components/Sidebar";

const Map = dynamic(() => import("./components/Map"), {
  ssr: false,
  loading: () => (
    <div style={{
      flex: 1,
      background: "#0f0f1a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontSize: "14px"
    }}>
      Loading map...
    </div>
  ),
});

export default function Home() {
  const { traffic, loading, error, lastUpdated, refreshing, refetch } = useTrafficData();
  const [selectedIntersection, setSelectedIntersection] = useState<Intersection | null>(null);

  const handleIntersectionClick = (intersection: Intersection) => {
    setSelectedIntersection(intersection);
  };

  if (error) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f0f1a",
        color: "white",
        flexDirection: "column",
        gap: "12px"
      }}>
        <p style={{ fontSize: "18px", fontWeight: "bold" }}>
          Cannot connect to backend
        </p>
        <p style={{ fontSize: "14px", color: "#888" }}>
          Make sure your FastAPI server is running on localhost:8000
        </p>
      </div>
    );
  }

  return (
    <main style={{
      display: "flex",
      height: "100vh",
      width: "100vw",
      overflow: "hidden",
      background: "#0f0f1a"
    }}>
      <div style={{ flex: 1, position: "relative" }}>
        <Map
          traffic={traffic}
          onIntersectionClick={handleIntersectionClick}
        />
        <div style={{
          position: "absolute",
          top: "12px",
          left: "12px",
          background: "rgba(0,0,0,0.7)",
          color: "white",
          padding: "8px 12px",
          borderRadius: "8px",
          fontSize: "12px",
          backdropFilter: "blur(4px)"
        }}>
          {loading ? "Loading..." : `${traffic.length} intersections live`}
        </div>
      </div>
      <Sidebar
        traffic={traffic}
        loading={loading}
        refreshing={refreshing}
        lastUpdated={lastUpdated}
        onIntersectionClick={handleIntersectionClick}
        onRefresh={refetch}
      />
    </main>
  );
}
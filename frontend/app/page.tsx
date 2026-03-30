"use client";

import dynamic from "next/dynamic";
import { useTrafficData, Intersection } from "./hooks/useTrafficData";
import Sidebar from "./components/Sidebar";
import Legend from "./components/Legend";
import StatsBar from "./components/StatsBar";
import MLGraphs from "./components/MLGraphs";

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
  const {
    traffic,
    loading,
    error,
    lastUpdated,
    refreshing,
    refetch,
    customLocations,
    addCustomLocation,
    removeCustomLocation,
  } = useTrafficData();

  const handleIntersectionClick = (intersection: Intersection) => {
    console.log("Clicked:", intersection.name);
  };

  const combinedTraffic = [...traffic, ...customLocations];

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
        <div style={{
          width: "40px",
          height: "40px",
          border: "3px solid #533483",
          borderTop: "3px solid transparent",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontSize: "18px", fontWeight: "bold" }}>
          Backend is waking up...
        </p>
        <p style={{ fontSize: "14px", color: "#888", textAlign: "center", maxWidth: "400px" }}>
          Hugging Face Spaces takes 1-2 minutes to wake up after inactivity.
          This page will automatically load when ready — no refresh needed!
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
      background: "#0f0f1a",
      position: "relative"
    }}>
      <div style={{ flex: 1, position: "relative" }}>
        <Map
          traffic={combinedTraffic}
          onIntersectionClick={handleIntersectionClick}
          customLocations={customLocations}
        />
      </div>

      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: "380px",
        zIndex: 9998,
        pointerEvents: "none"
      }}>
        <StatsBar traffic={combinedTraffic} />
      </div>

      <div style={{
        position: "fixed",
        bottom: "40px",
        left: "12px",
        zIndex: 9998,
        pointerEvents: "none"
      }}>
        <Legend />
      </div>

      <Sidebar
        traffic={traffic}
        loading={loading}
        refreshing={refreshing}
        lastUpdated={lastUpdated}
        onIntersectionClick={handleIntersectionClick}
        onRefresh={refetch}
        onAddCustomLocation={addCustomLocation}
        onRemoveCustomLocation={removeCustomLocation}
        customLocations={customLocations}
      />
    </main>
  );
}
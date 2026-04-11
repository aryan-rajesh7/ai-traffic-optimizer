"use client";

import dynamic from "next/dynamic";
import { useTrafficData, Intersection } from "./hooks/useTrafficData";
import Sidebar from "./components/Sidebar";
import Legend from "./components/Legend";
import StatsBar from "./components/StatsBar";

const Map = dynamic(() => import("./components/Map"), {
  ssr: false,
  loading: () => null,
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

  if (traffic.length === 0) {
    return (
      <div style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f0f1a",
        color: "white",
        flexDirection: "column",
        gap: "16px"
      }}>
        <div style={{
          width: "48px",
          height: "48px",
          border: "4px solid #533483",
          borderTop: "4px solid transparent",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontSize: "22px", fontWeight: "bold", margin: 0 }}>
          AI Traffic Optimizer
        </p>
        <p style={{ fontSize: "15px", color: "#888", textAlign: "center", maxWidth: "420px", lineHeight: "1.6", margin: 0 }}>
          Backend is starting up — please wait 1-2 minutes.
          The page will automatically load when ready, no refresh needed!
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
        bottom: "100px",
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

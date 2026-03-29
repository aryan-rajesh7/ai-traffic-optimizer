"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Intersection } from "../hooks/useTrafficData";

interface MapProps {
  traffic: Intersection[];
  onIntersectionClick: (intersection: Intersection) => void;
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


export default function MapComponent({ traffic, onIntersectionClick, customLocations }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);

  
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [-98.5795, 39.8283],
      zoom: 3.5,
    });

    map.current.addControl(new maplibregl.NavigationControl());
    map.current.addControl(
      new maplibregl.AttributionControl({
      compact: false,
      customAttribution: '<a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a>'
    })
    );

  }, []);
  

  useEffect(() => {
    if (!map.current || traffic.length === 0) return;

    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    traffic.forEach((intersection) => {
      const color = getCongestionColor(intersection.congestion_score);
      const label = getCongestionLabel(intersection.congestion_score);

      const el = document.createElement("div");
      el.style.width = "20px";
      el.style.height = "20px";
      el.style.borderRadius = "50%";
      el.style.backgroundColor = color;
      el.style.border = "3px solid white";
      el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
      el.style.cursor = "pointer";

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div style="font-family: sans-serif; padding: 4px;">
          <strong>${intersection.name}</strong><br/>
          ${intersection.city}<br/>
          Congestion: <span style="color: ${color}; font-weight: bold;">${label} (${intersection.congestion_score})</span>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([intersection.lon, intersection.lat])
        .setPopup(popup)
        .addTo(map.current!);

      el.addEventListener("click", () => {
        onIntersectionClick(intersection);
      });

      markers.current.push(marker);
    });
  }, [traffic, onIntersectionClick]);

  return (
  <div style={{ width: "100%", height: "100vh", position: "relative" }}>
    <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
    <p style={{
      position: "absolute",
      bottom: "8px",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 99999,
      pointerEvents: "none",
      whiteSpace: "nowrap",
      fontSize: "11px",
      color: "white",
      background: "rgba(0,0,0,0.7)",
      padding: "4px 10px",
      borderRadius: "4px",
      margin: 0
    }}>
      <a href="https://maplibre.org" target="_blank" rel="noopener noreferrer" style={{ color: "#aaa", pointerEvents: "auto" }}>MapLibre</a>
      {" | "}
      <a href="https://openfreemap.org" target="_blank" rel="noopener noreferrer" style={{ color: "#aaa", pointerEvents: "auto" }}>OpenFreeMap</a>
      {" © "}
      <a href="https://www.openmaptiles.org" target="_blank" rel="noopener noreferrer" style={{ color: "#aaa", pointerEvents: "auto" }}>OpenMapTiles</a>
      {" | Data from "}
      <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" style={{ color: "#aaa", pointerEvents: "auto" }}>OpenStreetMap</a>
    </p>
  </div>
);

}
"use client";

import { useState } from "react";

const LIVE_DEMO_URL = "https://ai-traffic-optimizer.vercel.app";
const GITHUB_URL = "https://github.com/aryan-rajesh7/ai-traffic-optimizer";
const HF_URL = "https://aryan-rajesh7-ai-traffic-optimizer.hf.space";

export default function LandingPage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: "🗺️",
      title: "Live Traffic Map",
      description: "Real-time traffic data from TomTom API displayed on an interactive map with color-coded congestion markers updating every 30 seconds."
    },
    {
      icon: "🧠",
      title: "ML Predictions",
      description: "LSTM neural network and XGBoost models trained on real traffic data predict future congestion patterns before they happen."
    },
    {
      icon: "🤖",
      title: "Gemini AI Recommendations",
      description: "Google Gemini AI analyzes live traffic data and provides specific signal timing recommendations with exact green/yellow/red durations."
    },
    {
      icon: "⚡",
      title: "Real-time WebSockets",
      description: "Live data streams directly to the frontend via WebSockets — no page refresh needed. Data updates automatically every 30 seconds."
    },
    {
      icon: "🔒",
      title: "Fully Secure",
      description: "Zero data storage — all traffic data flows through memory only. API keys encrypted in deployment dashboards, never in code."
    },
    {
      icon: "🌍",
      title: "Custom Locations",
      description: "Check traffic congestion at any location worldwide by entering GPS coordinates. Get instant AI recommendations for any intersection."
    },
  ];

  const techStack = [
    { name: "Next.js 14", category: "Frontend", color: "#ffffff" },
    { name: "TypeScript", category: "Frontend", color: "#3178c6" },
    { name: "MapLibre GL", category: "Frontend", color: "#4a90d9" },
    { name: "FastAPI", category: "Backend", color: "#009688" },
    { name: "Python 3.11", category: "Backend", color: "#3776ab" },
    { name: "PyTorch", category: "ML", color: "#ee4c2c" },
    { name: "XGBoost", category: "ML", color: "#ff6b35" },
    { name: "Gemini AI", category: "AI", color: "#4285f4" },
    { name: "TomTom API", category: "Data", color: "#ff6600" },
    { name: "C++", category: "Performance", color: "#00599c" },
    { name: "Docker", category: "DevOps", color: "#2496ed" },
    { name: "GitHub Actions", category: "DevOps", color: "#2088ff" },
    { name: "Hugging Face", category: "Hosting", color: "#ff9a00" },
    { name: "Vercel", category: "Hosting", color: "#ffffff" },
  ];

  const architecture = [
    { step: "1", label: "TomTom API", desc: "Live traffic flow data" },
    { step: "2", label: "FastAPI Backend", desc: "Python processing layer" },
    { step: "3", label: "ML Models", desc: "LSTM + XGBoost predictions" },
    { step: "4", label: "Gemini AI", desc: "RAG recommendations" },
    { step: "5", label: "WebSocket", desc: "Real-time streaming" },
    { step: "6", label: "Next.js Map", desc: "Live dashboard" },
  ];

  return (
    <main style={{ background: "#0a0a0f", color: "white", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>

      {/* Hero */}
      <section style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "40px 20px",
        background: "linear-gradient(180deg, #0a0a0f 0%, #0f0f2e 100%)",
      }}>
        <div style={{
          background: "#533483",
          color: "white",
          padding: "4px 16px",
          borderRadius: "20px",
          fontSize: "13px",
          marginBottom: "24px",
          display: "inline-block"
        }}>
          Full-Stack AI Project
        </div>

        <h1 style={{
          fontSize: "clamp(36px, 6vw, 72px)",
          fontWeight: "800",
          lineHeight: "1.1",
          marginBottom: "24px",
          background: "linear-gradient(135deg, #ffffff 0%, #a78bfa 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          AI Traffic Signal<br />Optimizer
        </h1>

        <p style={{
          fontSize: "clamp(16px, 2vw, 20px)",
          color: "#888",
          maxWidth: "600px",
          lineHeight: "1.6",
          marginBottom: "40px"
        }}>
          Real-time traffic optimization using LSTM neural networks, XGBoost, and Google Gemini AI.
          Live data from TomTom API across 5 major US cities.
        </p>

        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
          <a href={LIVE_DEMO_URL} target="_blank" rel="noopener noreferrer" style={{
            background: "#533483",
            color: "white",
            padding: "14px 32px",
            borderRadius: "8px",
            textDecoration: "none",
            fontSize: "16px",
            fontWeight: "bold",
          }}>
            Live Demo →
          </a>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" style={{
            background: "transparent",
            color: "white",
            padding: "14px 32px",
            borderRadius: "8px",
            textDecoration: "none",
            fontSize: "16px",
            fontWeight: "bold",
            border: "1px solid #333"
          }}>
            GitHub →
          </a>
        </div>

        <div style={{
          display: "flex",
          gap: "32px",
          marginTop: "60px",
          flexWrap: "wrap",
          justifyContent: "center"
        }}>
          {[
            { label: "ML Models", value: "2" },
            { label: "Cities", value: "5" },
            { label: "Languages", value: "4" },
            { label: "Live APIs", value: "2" },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <p style={{ fontSize: "36px", fontWeight: "800", color: "#a78bfa" }}>{stat.value}</p>
              <p style={{ fontSize: "13px", color: "#888" }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "80px 20px", maxWidth: "1100px", margin: "0 auto" }}>
        <h2 style={{ fontSize: "36px", fontWeight: "700", textAlign: "center", marginBottom: "12px" }}>
          Features
        </h2>
        <p style={{ color: "#888", textAlign: "center", marginBottom: "48px" }}>
          Built with production-grade technologies
        </p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px"
        }}>
          {features.map((feature, i) => (
            <div
              key={i}
              onMouseEnter={() => setHoveredFeature(i)}
              onMouseLeave={() => setHoveredFeature(null)}
              style={{
                background: hoveredFeature === i ? "#16213e" : "#0f0f1a",
                border: `1px solid ${hoveredFeature === i ? "#533483" : "#222"}`,
                borderRadius: "12px",
                padding: "24px",
                transition: "all 0.2s",
                cursor: "default"
              }}
            >
              <div style={{ fontSize: "32px", marginBottom: "12px" }}>{feature.icon}</div>
              <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>{feature.title}</h3>
              <p style={{ color: "#888", fontSize: "14px", lineHeight: "1.6" }}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture */}
      <section style={{ padding: "80px 20px", background: "#0f0f1a" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "36px", fontWeight: "700", textAlign: "center", marginBottom: "12px" }}>
            Architecture
          </h2>
          <p style={{ color: "#888", textAlign: "center", marginBottom: "48px" }}>
            How data flows through the system
          </p>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "8px"
          }}>
            {architecture.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  background: "#16213e",
                  border: "1px solid #533483",
                  borderRadius: "10px",
                  padding: "16px 20px",
                  textAlign: "center",
                  minWidth: "120px"
                }}>
                  <div style={{
                    background: "#533483",
                    borderRadius: "50%",
                    width: "28px",
                    height: "28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 8px",
                    fontSize: "13px",
                    fontWeight: "bold"
                  }}>
                    {item.step}
                  </div>
                  <p style={{ fontWeight: "600", fontSize: "13px", marginBottom: "4px" }}>{item.label}</p>
                  <p style={{ color: "#888", fontSize: "11px" }}>{item.desc}</p>
                </div>
                {i < architecture.length - 1 && (
                  <div style={{ color: "#533483", fontSize: "20px" }}>→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section style={{ padding: "80px 20px", maxWidth: "1100px", margin: "0 auto" }}>
        <h2 style={{ fontSize: "36px", fontWeight: "700", textAlign: "center", marginBottom: "12px" }}>
          Tech Stack
        </h2>
        <p style={{ color: "#888", textAlign: "center", marginBottom: "48px" }}>
          Production-grade technologies across the full stack
        </p>
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          justifyContent: "center"
        }}>
          {techStack.map((tech, i) => (
            <div key={i} style={{
              background: "#0f0f1a",
              border: "1px solid #222",
              borderRadius: "8px",
              padding: "8px 16px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <div style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: tech.color
              }} />
              <span style={{ fontSize: "14px", fontWeight: "500" }}>{tech.name}</span>
              <span style={{ fontSize: "11px", color: "#666" }}>{tech.category}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: "80px 20px",
        textAlign: "center",
        background: "#0f0f1a"
      }}>
        <h2 style={{ fontSize: "36px", fontWeight: "700", marginBottom: "16px" }}>
          See it live
        </h2>
        <p style={{ color: "#888", marginBottom: "32px", fontSize: "16px" }}>
          Real traffic data. Real AI recommendations. Right now.
        </p>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <a href={LIVE_DEMO_URL} target="_blank" rel="noopener noreferrer" style={{
            background: "#533483",
            color: "white",
            padding: "14px 32px",
            borderRadius: "8px",
            textDecoration: "none",
            fontSize: "16px",
            fontWeight: "bold"
          }}>
            Open Live Demo →
          </a>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" style={{
            background: "transparent",
            color: "white",
            padding: "14px 32px",
            borderRadius: "8px",
            textDecoration: "none",
            fontSize: "16px",
            fontWeight: "bold",
            border: "1px solid #333"
          }}>
            View on GitHub →
          </a>
          <a href={HF_URL} target="_blank" rel="noopener noreferrer" style={{
            background: "transparent",
            color: "#ff9a00",
            padding: "14px 32px",
            borderRadius: "8px",
            textDecoration: "none",
            fontSize: "16px",
            fontWeight: "bold",
            border: "1px solid #ff9a00"
          }}>
            Hugging Face API →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: "24px",
        textAlign: "center",
        color: "#444",
        fontSize: "13px",
        borderTop: "1px solid #111"
      }}>
      <footer style={{
      padding: "24px",
      textAlign: "center",
      color: "#444",
      fontSize: "13px",
      borderTop: "1px solid #111"
    }}>
      <p>· © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" style={{ color: "#666" }}>OpenStreetMap contributors</a> | OpenFreeMap © OpenMapTiles | Data from OpenStreetMap</p>
    </footer>
      </footer>

    </main>
  );
}
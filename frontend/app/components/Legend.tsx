"use client";

export default function Legend() {
  const items = [
    { color: "#22c55e", label: "Low (0.0 - 0.3)" },
    { color: "#eab308", label: "Moderate (0.3 - 0.6)" },
    { color: "#f97316", label: "High (0.6 - 0.8)" },
    { color: "#ef4444", label: "Severe (0.8 - 1.0)" },
  ];

  return (
    <div style={{
      background: "rgba(255, 255, 255, 0.9)",
      backdropFilter: "blur(8px)",
      border: "1px solid #e2e8f0",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      borderRadius: "10px",
      padding: "10px 14px",
      color: "#0f172a",
      fontSize: "12px",
    }}>
      <p style={{ fontWeight: "bold", margin: "0 0 8px", fontSize: "11px", color: "#1e293b" }}>
        CONGESTION LEVEL
      </p>
      {items.map((item) => (
        <div key={item.label} style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "6px"
        }}>
          <div style={{
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            background: item.color,
            border: "2px solid #ffffff",
            boxShadow: "0 0 0 1px #e2e8f0", // Helps the white border stand out against the light bg
            flexShrink: 0
          }} />
          <span style={{ fontWeight: "500" }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

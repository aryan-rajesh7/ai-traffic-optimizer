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
      background: "rgba(0,0,0,0.75)",
      backdropFilter: "blur(8px)",
      borderRadius: "10px",
      padding: "10px 14px",
      color: "white",
      fontSize: "12px",
    }}>
      <p style={{ fontWeight: "bold", margin: "0 0 8px", fontSize: "11px", color: "#888" }}>
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
            border: "2px solid white",
            flexShrink: 0
          }} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
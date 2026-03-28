import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Traffic Signal Optimizer",
  description: "Real-time AI-powered traffic signal optimization using LSTM, XGBoost, and Gemini AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
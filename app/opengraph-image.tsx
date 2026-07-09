import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Sellganise — Stock Management for Resellers";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#0e0d0b",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: "72px 80px",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* background glow */}
        <div
          style={{
            position: "absolute",
            top: -120,
            left: "50%",
            transform: "translateX(-50%)",
            width: 900,
            height: 500,
            background: "radial-gradient(ellipse at center, rgba(240,160,32,0.12) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        {/* subtle grid lines */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "linear-gradient(rgba(240,160,32,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(240,160,32,0.04) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* top: logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, zIndex: 1 }}>
          {/* amber box icon */}
          <div
            style={{
              width: 48,
              height: 48,
              background: "#f0a020",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M21 8l-9-5-9 5 9 5 9-5z" stroke="#0e0d0b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 8v8l9 5 9-5V8" stroke="#0e0d0b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 13v8" stroke="#0e0d0b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span style={{ fontSize: 28, fontWeight: 600, color: "#f5f1e8", letterSpacing: "-0.5px" }}>
            Sellganise
          </span>
        </div>

        {/* centre: headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, zIndex: 1, maxWidth: 820 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(240,160,32,0.12)",
              border: "1px solid rgba(240,160,32,0.25)",
              borderRadius: 999,
              padding: "8px 18px",
              width: "fit-content",
            }}
          >
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#f0a020" }} />
            <span style={{ fontSize: 15, color: "#f0a020", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Stock management for resellers
            </span>
          </div>

          <span
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "#f5f1e8",
              lineHeight: 1.02,
              letterSpacing: "-2px",
            }}
          >
            Never lose track of{" "}
            <span style={{ color: "#f0a020" }}>stock you've paid for.</span>
          </span>
        </div>

        {/* bottom: platforms + trust */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", zIndex: 1 }}>
          <div style={{ display: "flex", gap: 10 }}>
            {["Vinted", "eBay", "Depop", "Facebook"].map((p) => (
              <div
                key={p}
                style={{
                  background: "rgba(245,241,232,0.07)",
                  border: "1px solid rgba(245,241,232,0.12)",
                  borderRadius: 8,
                  padding: "7px 16px",
                  fontSize: 15,
                  color: "#b8b1a3",
                  fontWeight: 500,
                }}
              >
                {p}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16, color: "#6f6a5e" }}>Free plan ·</span>
            <span style={{ fontSize: 16, color: "#6f6a5e" }}>sellganise.com</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}

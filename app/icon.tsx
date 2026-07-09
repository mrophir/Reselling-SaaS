import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "#0e0d0b",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1.5px solid #2a2722",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 20,
            height: 20,
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            {/* Box body */}
            <path
              d="M3 7.5L10 4L17 7.5V15.5L10 19L3 15.5V7.5Z"
              fill="#1a1815"
              stroke="#f0a020"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            {/* Box lid flap */}
            <path
              d="M3 7.5L10 11L17 7.5"
              stroke="#f0a020"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            {/* Centre spine */}
            <path
              d="M10 11V19"
              stroke="#f0a020"
              strokeWidth="1.2"
            />
          </svg>
        </div>
      </div>
    ),
    { ...size }
  );
}

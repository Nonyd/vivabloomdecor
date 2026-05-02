import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = { width: 1200, height: 630 };

export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#0F0E0C",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p
          style={{
            fontFamily: "Georgia",
            fontSize: 80,
            color: "#C9A96E",
            fontStyle: "italic",
            margin: 0,
          }}
        >
          Vivabloom
        </p>
        <p
          style={{
            fontFamily: "Arial",
            fontSize: 18,
            letterSpacing: "6px",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.4)",
            marginTop: 16,
          }}
        >
          Luxury Event & Wedding Décor
        </p>
      </div>
    ),
    { ...size }
  );
}

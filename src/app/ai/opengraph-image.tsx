import { ImageResponse } from "next/og";

export const alt = "AND U｜Web制作・移行・運用サポート";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", background: "#202728", color: "#ffffff" }}>
      <div style={{ display: "flex", fontSize: 36, letterSpacing: "8px" }}>AND U</div>
      <div style={{ display: "flex", flexDirection: "column", fontSize: 66, lineHeight: 1.2 }}><div>WEBSITE CARE</div><div>&amp; DEVELOPMENT</div></div>
      <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 24, borderTop: "1px solid #72817b", color: "#d7dcda", fontSize: 24 }}><div>Design. Migration. Support.</div><div>ando-seika.com/ai</div></div>
    </div>,
    size,
  );
}

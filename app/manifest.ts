import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "구세군 마포영문 기획서 아카이브",
    short_name: "마포 기획 아카이브",
    description: "함께 준비한 기획을 기록하고 다음 사람에게 이어가는 아카이브",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F8FA",
    theme_color: "#16181D",
    icons: [
      { src: "/brand/app-icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/app-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}

import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  // 開発中に左下へ出るNext.jsのDev Toolsバッジを非表示にする
  devIndicators: false,
  // スポット画像は public/ の外（data/images）に置き、Route Handler で fs から読むため、
  // Vercel のサーバーレス関数に画像ファイルが含まれるよう明示的に指定する
  outputFileTracingIncludes: {
    "/api/spots/**": ["./data/images/spots/**/*"],
    "/api/quiz/**": ["./data/images/spots/**/*"],
  },
};

export default nextConfig;

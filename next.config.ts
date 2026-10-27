import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  // 開発中に左下へ出るNext.jsのDev Toolsバッジを非表示にする
  devIndicators: false,
};

export default nextConfig;

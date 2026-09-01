"use client";

import dynamic from "next/dynamic";

// ランダム選出をサーバー/クライアントで一致させる必要はないため、クライアントのみで描画する
const AmbientPlayer = dynamic(() => import("./AmbientPlayerView"), {
  ssr: false,
});

export default AmbientPlayer;

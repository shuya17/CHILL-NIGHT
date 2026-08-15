"use client";

import dynamic from "next/dynamic";

// Leafletはwindowを参照するためSSRを無効化してクライアントのみで読み込む
const GeoguesserMap = dynamic(() => import("./GeoguesserMapView"), {
  ssr: false,
});

export default GeoguesserMap;

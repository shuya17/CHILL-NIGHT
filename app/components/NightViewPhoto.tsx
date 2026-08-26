"use client";

import dynamic from "next/dynamic";

// ランダム選出をサーバー/クライアントで一致させる必要はないため、クライアントのみで描画する
const NightViewPhoto = dynamic(() => import("./NightViewPhotoView"), {
  ssr: false,
});

export default NightViewPhoto;

"use client";

import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import spotsData from "../../data/spots.json";
import { getSpotImageUrl } from "../lib/spotImage";
import type { Spot } from "../types/spot";

const spots = spotsData as Spot[];

export default function NightViewCrossfade() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // 夜の画像のURLを取得する（画像は public/ の外にあるためAPI経由のURLにする）
  // ※もし特定の時間帯がない場合は、エラーを防ぐために除外しています
  const images = spots
    .filter((spot) => spot.images?.night)
    .map((spot) => getSpotImageUrl(spot.id, "night"));

  useEffect(() => {
    // 画像がない場合や1枚しかない場合はタイマーをセットしない
    if (images.length <= 1) return;

    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // 5秒ごとに切り替え

    // コンポーネントがアンマウントされた時にタイマーを解除
    return () => clearInterval(intervalId);
  }, [images.length]);

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1, // 他の要素の背景になるように一番後ろへ配置
        backgroundColor: "#000", // 画像読み込み前の黒背景
      }}
    >
      {images.map((imgSrc, index) => (
        <Box
          key={index}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: `url(${imgSrc})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            // 現在のインデックスの画像だけ opacity を 1 に、それ以外は 0 にする
            opacity: index === currentIndex ? 1 : 0,
            // opacity に対して 1.5秒 かけてフェードイン・フェードアウトさせる
            transition: "opacity 1.5s ease-in-out",
          }}
        />
      ))}
    </Box>
  );
}

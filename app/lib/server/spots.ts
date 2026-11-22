import { readFile } from "node:fs/promises";
import path from "node:path";
import spotsData from "../../../data/spots.json";
import type { Spot, TimeOfDay } from "../../types/spot";

// サーバー側（Route Handler）専用。クライアントコンポーネントからは import しないこと。
// ジオゲッサーの正解（名前・緯度経度）がブラウザのJSに含まれてしまうため。

const spots = spotsData as Spot[];

// 画像は public/ に置くとファイル名で直接開けてしまうため、public の外に置いてAPI経由でのみ配信する
const IMAGES_DIR = path.join(process.cwd(), "data", "images", "spots");

export function getAllSpots(): Spot[] {
  return spots;
}

export function getSpotById(id: string): Spot | undefined {
  return spots.find((spot) => spot.id === id);
}

export function pickRandomSpot(): Spot {
  return spots[Math.floor(Math.random() * spots.length)];
}

export function isTimeOfDay(value: string): value is TimeOfDay {
  return value === "morning" || value === "evening" || value === "night";
}

// スポットの画像ファイルを読み込んでレスポンスとして返す（見つからなければ404）
export async function createSpotImageResponse(
  spot: Spot,
  time: TimeOfDay,
  cacheControl: string,
): Promise<Response> {
  const fileName = spot.images[time];
  // spots.json の値をそのまま使うが、念のためディレクトリ外を指すパスは拒否する
  if (!fileName || path.basename(fileName) !== fileName) {
    return new Response("Not Found", { status: 404 });
  }

  try {
    const file = await readFile(path.join(IMAGES_DIR, fileName));
    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": cacheControl,
      },
    });
  } catch {
    return new Response("Not Found", { status: 404 });
  }
}

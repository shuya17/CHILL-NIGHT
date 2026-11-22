import type { NextRequest } from "next/server";
import { calculateDistance } from "../../../lib/distance";
import { calculateScore } from "../../../lib/score";
import { readQuizToken } from "../../../lib/server/quizToken";
import { getSpotById } from "../../../lib/server/spots";

function isValidCoordinate(lat: unknown, lng: unknown): boolean {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
  );
}

// 推測地点を受け取り、サーバー側で距離とスコアを計算して正解を返す
export async function POST(req: NextRequest) {
  let body: { token?: unknown; lat?: unknown; lng?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { token, lat, lng } = body;
  if (typeof token !== "string" || !isValidCoordinate(lat, lng)) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const spotId = readQuizToken(token);
  const spot = spotId ? getSpotById(spotId) : undefined;
  if (!spot) {
    return Response.json({ error: "Invalid token" }, { status: 400 });
  }

  const distanceKm = calculateDistance(
    lat as number,
    lng as number,
    spot.lat,
    spot.lng,
  );
  return Response.json({
    lat: spot.lat,
    lng: spot.lng,
    name: spot.name,
    description: spot.description,
    distanceKm,
    score: calculateScore(distanceKm),
  });
}

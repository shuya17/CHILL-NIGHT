import type { NextRequest } from "next/server";
import {
  createSpotImageResponse,
  getSpotById,
  isTimeOfDay,
} from "../../../../../lib/server/spots";

// アンビエント画面・トップ画面用のスポット画像配信
export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/spots/[id]/images/[time]">,
) {
  const { id, time } = await ctx.params;
  const spot = getSpotById(id);
  if (!spot || !isTimeOfDay(time)) {
    return new Response("Not Found", { status: 404 });
  }
  // 画像は差し替え時にデプロイし直すため、1日キャッシュで十分
  return createSpotImageResponse(spot, time, "public, max-age=86400");
}

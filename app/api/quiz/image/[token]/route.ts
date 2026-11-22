import type { NextRequest } from "next/server";
import { readQuizToken } from "../../../../lib/server/quizToken";
import {
  createSpotImageResponse,
  getSpotById,
} from "../../../../lib/server/spots";

// 出題中の写真を配信する。URLにはトークンしか含まれないため、検証ツールで見てもスポットが分からない
export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/quiz/image/[token]">,
) {
  const { token } = await ctx.params;
  const spotId = readQuizToken(token);
  const spot = spotId ? getSpotById(spotId) : undefined;
  if (!spot) {
    return new Response("Not Found", { status: 404 });
  }
  // トークンは毎回変わるため共有キャッシュには載せない
  return createSpotImageResponse(spot, "night", "private, max-age=3600");
}

import { pickRandomSpot } from "../../../lib/server/spots";
import { createQuizToken } from "../../../lib/server/quizToken";

// 新しい問題を出題する。ブラウザには暗号化したトークンと画像URLだけを返し、スポット名や座標は返さない
export async function GET() {
  const token = createQuizToken(pickRandomSpot().id);
  return Response.json(
    { token, imageUrl: `/api/quiz/image/${token}` },
    { headers: { "Cache-Control": "no-store" } },
  );
}

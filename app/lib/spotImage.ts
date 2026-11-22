import type { TimeOfDay } from "../types/spot";

// アンビエント画面・トップ画面で使うスポット画像のURL
// 画像は public/ の外にあるため、Route Handler（app/api/spots/[id]/images/[time]）経由で配信する
export function getSpotImageUrl(spotId: string, time: TimeOfDay): string {
  return `/api/spots/${encodeURIComponent(spotId)}/images/${time}`;
}

export type TimeOfDay = "morning" | "evening" | "night";

export interface Spot {
  id: string;
  name: string;
  prefecture: string;
  lat: number;
  lng: number;
  description: string;
  // data/images/spots/ 内の画像ファイル名（URLではない）
  // ブラウザから参照するときは lib/spotImage.ts の getSpotImageUrl を使う
  images: Record<TimeOfDay, string>;
}

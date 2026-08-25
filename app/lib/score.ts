const MAX_SCORE = 1000;
const DECAY_KM = 300;


// 距離(km)をもとにスコア(0〜1000点)を算出する
export function calculateScore(distanceKm: number): number {
  const score = Math.round(MAX_SCORE * Math.exp(-distanceKm / DECAY_KM));
  return Math.max(0, score);
}

export interface Spot {
  id: string;
  name: string;
  prefecture: string;
  lat: number;
  lng: number;
  description: string;
  images: {
    morning: string;
    evening: string;
    night: string;
  };
}

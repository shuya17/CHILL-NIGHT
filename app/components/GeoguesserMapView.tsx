"use client";

import "leaflet/dist/leaflet.css";
import L, { type LatLng, type Map as LeafletMap } from "leaflet";
import { useRef, useState, type TransitionEvent } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import Box from "@mui/material/Box";

// 日本全体が収まる中心座標とズームレベル
const JAPAN_CENTER: [number, number] = [36.2048, 138.2529];
const JAPAN_ZOOM = 5;

const COLLAPSED_SIZE = { width: 480, height: 360 };
const EXPANDED_SIZE = { width: 1000, height: 760 };
const TRANSITION_DURATION_MS = 300;

// Next.js/Webpack環境ではleafletのデフォルトアイコンの画像パス解決に失敗するため、CDN URLを明示的に指定する
const pinIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface GuessMarkerProps {
  onSelect?: (lat: number, lng: number) => void;
}

function GuessMarker({ onSelect }: GuessMarkerProps) {
  const [position, setPosition] = useState<LatLng | null>(null);

  useMapEvents({
    click(event) {
      setPosition(event.latlng);
      onSelect?.(event.latlng.lat, event.latlng.lng);
    },
  });

  if (!position) return null;

  return <Marker position={position} icon={pinIcon} />;
}

export interface GeoguesserMapProps {
  // 地図クリックで選択された緯度経度を親コンポーネントに通知する
  onGuessSelect?: (lat: number, lng: number) => void;
}

export default function GeoguesserMap({ onGuessSelect }: GeoguesserMapProps) {
  const [expanded, setExpanded] = useState(false);
  const mapRef = useRef<LeafletMap | null>(null);

  const size = expanded ? EXPANDED_SIZE : COLLAPSED_SIZE;

  // サイズのtransition完了後にLeafletへ再描画を促す
  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.propertyName !== "width" && event.propertyName !== "height") return;
    mapRef.current?.invalidateSize();
  };

  return (
    <Box
      onTransitionEnd={handleTransitionEnd}
      sx={{
        position: "fixed",
        right: 16,
        bottom: 16,
        width: size.width,
        height: size.height,
        borderRadius: 2,
        overflow: "hidden",
        boxShadow: 6,
        transition: `width ${TRANSITION_DURATION_MS}ms ease, height ${TRANSITION_DURATION_MS}ms ease`,
        zIndex: 1000,
      }}
    >
      {expanded && (
        <Box
          component="button"
          type="button"
          onClick={() => setExpanded(false)}
          aria-label="地図を縮小"
          sx={{
            position: "absolute",
            top: 6,
            right: 6,
            zIndex: 1,
            width: 28,
            height: 28,
            border: "none",
            borderRadius: "50%",
            bgcolor: "background.paper",
            boxShadow: 2,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            lineHeight: 1,
            "&:hover": { bgcolor: "grey.100" },
          }}
        >
          ×
        </Box>
      )}
      <MapContainer
        ref={mapRef}
        center={JAPAN_CENTER}
        zoom={JAPAN_ZOOM}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <GuessMarker onSelect={onGuessSelect} />
      </MapContainer>
      {!expanded && (
        <Box
          component="button"
          type="button"
          onClick={() => setExpanded(true)}
          aria-label="地図を拡大"
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            border: "none",
            padding: 0,
            bgcolor: "transparent",
            cursor: "pointer",
          }}
        />
      )}
    </Box>
  );
}

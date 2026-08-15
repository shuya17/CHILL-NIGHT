"use client";

import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap } from "leaflet";
import { useRef, useState, type TransitionEvent } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import Box from "@mui/material/Box";

// 日本全体が収まる中心座標とズームレベル
const JAPAN_CENTER: [number, number] = [36.2048, 138.2529];
const JAPAN_ZOOM = 5;

const COLLAPSED_SIZE = { width: 480, height: 360 };
const EXPANDED_SIZE = { width: 1000, height: 760 };
const TRANSITION_DURATION_MS = 300;

export default function GeoguesserMap() {
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

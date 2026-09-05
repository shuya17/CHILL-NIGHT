"use client";

import "leaflet/dist/leaflet.css";
import L, { type LatLngLiteral, type Map as LeafletMap } from "leaflet";
import {
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type TransitionEvent,
} from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Tooltip,
  useMapEvents,
} from "react-leaflet";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import MapIcon from "@mui/icons-material/Map";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

// 日本全体が収まる中心座標とズームレベル
const JAPAN_CENTER: [number, number] = [36.2048, 138.2529];
const JAPAN_ZOOM = 5;

const COLLAPSED_SIZE = { width: 480, height: 360 };
const EXPANDED_SIZE = { width: 1000, height: 760 };
const TRANSITION_DURATION_MS = 300;
// この距離を超えて動かしたら「クリック」ではなく「ドラッグ」とみなす
const DRAG_THRESHOLD_PX = 5;

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

// 正解ピンは推測ピンと見分けられるよう、CSSだけで描画する緑色のピンにする
const correctIcon = new L.DivIcon({
  className: "",
  html: '<div style="width:20px;height:20px;background:#2e7d32;border:2px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 1px 4px rgba(0,0,0,0.6);"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 20],
});

interface GuessMarkerProps {
  position: LatLngLiteral | null;
  onSelect: (lat: number, lng: number) => void;
  // 答え合わせ後はピンを動かせないようにロックする
  disabled: boolean;
}

function GuessMarker({ position, onSelect, disabled }: GuessMarkerProps) {
  useMapEvents({
    click(event) {
      if (disabled) return;
      onSelect(event.latlng.lat, event.latlng.lng);
    },
  });

  if (!position) return null;

  return <Marker position={position} icon={pinIcon} />;
}

export interface CorrectAnswer {
  lat: number;
  lng: number;
  name: string;
  description: string;
  distanceKm: number;
  score: number;
}

export interface GeoguesserMapProps {
  // 地図クリックで選択された緯度経度を親コンポーネントに通知する（クリックのたびに発火）
  onGuessSelect?: (lat: number, lng: number) => void;
  // 「この場所で決定」ボタンが押されたことを親コンポーネントに通知する
  onDecide?: () => void;
  // 答え合わせ後に正解ピンを表示するための情報（未回答時はnull）
  correctAnswer?: CorrectAnswer | null;
}

export default function GeoguesserMap({
  onGuessSelect,
  onDecide,
  correctAnswer = null,
}: GeoguesserMapProps) {
  const [expanded, setExpanded] = useState(false);
  const [mapVisible, setMapVisible] = useState(true);
  const [guessPosition, setGuessPosition] = useState<LatLngLiteral | null>(
    null,
  );
  const mapRef = useRef<LeafletMap | null>(null);
  const correctMarkerRef = useRef<L.Marker | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const dragInfoRef = useRef<{
    pointerId: number;
    startClientX: number;
    startClientY: number;
    startTop: number;
    startLeft: number;
  } | null>(null);
  const didDragRef = useRef(false);
  // ミニ地図をドラッグで動かした位置（未ドラッグ時はnullで右下固定のまま）
  const [dragPosition, setDragPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const size = expanded ? EXPANDED_SIZE : COLLAPSED_SIZE;

  const handleGuessSelect = (lat: number, lng: number) => {
    setGuessPosition({ lat, lng });
    onGuessSelect?.(lat, lng);
  };

  const handleDragPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    // 拡大時は写真を確認する目的が薄いため、ミニ地図の時だけドラッグ移動できるようにする
    if (expanded) return;
    const panel = panelRef.current;
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    dragInfoRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startTop: rect.top,
      startLeft: rect.left,
    };
    didDragRef.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleDragPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const info = dragInfoRef.current;
    if (!info || info.pointerId !== event.pointerId) return;

    const dx = event.clientX - info.startClientX;
    const dy = event.clientY - info.startClientY;
    if (!didDragRef.current && Math.hypot(dx, dy) > DRAG_THRESHOLD_PX) {
      didDragRef.current = true;
    }
    if (!didDragRef.current) return;

    // 画面外にはみ出さないようclamp
    const maxLeft = Math.max(window.innerWidth - COLLAPSED_SIZE.width, 0);
    const maxTop = Math.max(window.innerHeight - COLLAPSED_SIZE.height, 0);
    const newLeft = Math.min(Math.max(info.startLeft + dx, 0), maxLeft);
    const newTop = Math.min(Math.max(info.startTop + dy, 0), maxTop);
    setDragPosition({ top: newTop, left: newLeft });
  };

  const handleDragPointerUp = () => {
    dragInfoRef.current = null;
  };

  const handleExpandClick = () => {
    // ドラッグ操作の終了時はクリックとして扱わない
    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }
    setExpanded(true);
  };

  const handleHideMap = () => {
    // 隠している間に拡大状態が残ると再表示時に見た目が崩れるため、閉じてから隠す
    setExpanded(false);
    setMapVisible(false);
  };

  // サイズのtransition完了後にLeafletへ再描画を促す
  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.propertyName !== "width" && event.propertyName !== "height") return;
    mapRef.current?.invalidateSize();
  };

  if (!mapVisible) {
    return (
      <Button
        variant="contained"
        startIcon={<MapIcon />}
        onClick={() => setMapVisible(true)}
        sx={{
          position: "fixed",
          right: 16,
          bottom: 16,
          zIndex: 1000,
          boxShadow: 6,
        }}
      >
        地図を表示
      </Button>
    );
  }

  return (
    <>
      {expanded && (
        // 地図の外側（写真側）をクリックしたときにミニ地図へ戻すためのクリック検知用オーバーレイ
        <Box
          onClick={() => setExpanded(false)}
          sx={{ position: "fixed", inset: 0, zIndex: 999 }}
        />
      )}
      <Box
        ref={panelRef}
        sx={{
          position: "fixed",
          ...(dragPosition && !expanded
            ? { top: dragPosition.top, left: dragPosition.left }
            : { right: 16, bottom: 16 }),
          width: size.width,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          transition: `width ${TRANSITION_DURATION_MS}ms ease`,
          zIndex: 1000,
        }}
      >
        <Box
          onTransitionEnd={handleTransitionEnd}
          sx={{
            position: "relative",
            width: "100%",
            height: size.height,
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: 6,
            transition: `height ${TRANSITION_DURATION_MS}ms ease`,
          }}
        >
          {/* 写真の隠れた部分を確認できるよう、地図自体を隠せるボタン */}
          <Box
            component="button"
            type="button"
            onClick={handleHideMap}
            aria-label="地図を隠す"
            title="地図を隠す"
            sx={{
              position: "absolute",
              top: 6,
              left: 6,
              zIndex: 1,
              width: 32,
              height: 32,
              border: "none",
              borderRadius: "50%",
              bgcolor: "background.paper",
              boxShadow: 2,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              "&:hover": { bgcolor: "grey.100" },
            }}
          >
            <VisibilityOffIcon fontSize="small" />
          </Box>
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
            <GuessMarker
              position={guessPosition}
              onSelect={handleGuessSelect}
              disabled={Boolean(correctAnswer)}
            />
            {correctAnswer && (
              <Marker
                ref={correctMarkerRef}
                position={{ lat: correctAnswer.lat, lng: correctAnswer.lng }}
                icon={correctIcon}
                eventHandlers={{
                  // 地図に追加された直後（ポップアップと確実に紐づいたタイミング）で自動的に開く
                  add: (event) => event.target.openPopup(),
                }}
              >
                {/* 常時表示の吹き出し: 正解地点であることが一目でわかる。吹き出し自体を押しても説明ポップアップが開く */}
                <Tooltip
                  permanent
                  interactive
                  direction="top"
                  offset={[0, -20]}
                  eventHandlers={{
                    click: () => correctMarkerRef.current?.openPopup(),
                  }}
                >
                  {correctAnswer.name}
                </Tooltip>
                {/* ピン本体を押しても同じ説明ポップアップが開く（拡大時の地図の1/4程度のサイズ） */}
                <Popup maxWidth={500} minWidth={420}>
                  <Box sx={{ width: 460, p: 0.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                      {correctAnswer.name}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {correctAnswer.description}
                    </Typography>
                    <Typography variant="body1">
                      距離: {correctAnswer.distanceKm.toFixed(1)} km
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                      スコア: {correctAnswer.score} 点
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      onClick={() => window.location.reload()}
                    >
                      もう一度遊ぶ
                    </Button>
                  </Box>
                </Popup>
              </Marker>
            )}
          </MapContainer>
          {!expanded && (
            <Box
              component="button"
              type="button"
              onClick={handleExpandClick}
              onPointerDown={handleDragPointerDown}
              onPointerMove={handleDragPointerMove}
              onPointerUp={handleDragPointerUp}
              aria-label="地図を拡大（ドラッグで移動もできます）"
              sx={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                border: "none",
                padding: 0,
                bgcolor: "transparent",
                cursor: "grab",
                touchAction: "none",
                "&:active": { cursor: "grabbing" },
              }}
            />
          )}
        </Box>
        {expanded && (
          <Button
            variant="contained"
            fullWidth
            // 答え合わせ後は再決定できないようにする
            disabled={!guessPosition || Boolean(correctAnswer)}
            onClick={() => onDecide?.()}
            sx={{ boxShadow: 4 }}
          >
            この場所で決定
          </Button>
        )}
      </Box>
    </>
  );
}

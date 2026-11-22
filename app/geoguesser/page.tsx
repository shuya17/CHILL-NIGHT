"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import BrandHeader from "../components/BrandHeader";
import GeoguesserMap from "../components/GeoguesserMap";
import type { CorrectAnswer } from "../components/GeoguesserMapView";
import NightViewPhoto from "../components/NightViewPhoto";

// 出題・採点はサーバー（app/api/quiz）で行い、ブラウザには答え合わせまで正解を渡さない。
// こうしないと、検証ツールでJSやstateを見るだけでスポットが分かってしまう。
interface Quiz {
  token: string;
  imageUrl: string;
}

export default function GeoguesserPage() {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizError, setQuizError] = useState(false);
  const [guessCoordinate, setGuessCoordinate] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  // 答え合わせ後に一度だけセットするため、参照が安定し地図側のポップアップ自動オープンが再発火しない
  const [correctAnswer, setCorrectAnswer] = useState<CorrectAnswer | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/quiz/new", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<Quiz>;
      })
      .then((data) => {
        if (!cancelled) setQuiz(data);
      })
      .catch(() => {
        if (!cancelled) setQuizError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDecide = async () => {
    if (!quiz || !guessCoordinate || isSubmitting || correctAnswer) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/quiz/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: quiz.token, ...guessCoordinate }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setCorrectAnswer((await res.json()) as CorrectAnswer);
    } catch {
      alert("答え合わせに失敗しました。もう一度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      component="main"
      sx={{
        position: "relative",
        width: "100%",
        // アドレスバーの出没があるモバイルブラウザでも画面いっぱいに表示されるようdvhを使う
        height: "100dvh",
        overflow: "hidden",
        bgcolor: "common.black",
      }}
    >
      <NightViewPhoto src={quiz?.imageUrl ?? null} hasError={quizError} />

      <BrandHeader />

      <GeoguesserMap
        onGuessSelect={(lat, lng) => setGuessCoordinate({ lat, lng })}
        onDecide={handleDecide}
        correctAnswer={correctAnswer}
      />
    </Box>
  );
}

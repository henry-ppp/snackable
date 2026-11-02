"use client";

import { stageClearPanel } from "@kafastudio/game-ui";
import "@kafastudio/game-ui/style.css";
import { useEffect, useRef } from "react";

export function StageClear({
  title,
  stars,
  score,
  xp,
  onContinue,
}: {
  title: string;
  stars: number;
  score: number;
  xp: number;
  onContinue: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = host.current;
    if (!root) return;
    root.replaceChildren();
    root.append(
      stageClearPanel({
        title,
        subtitle: xp > 0 ? `+${xp} XP` : "Already cleared",
        stars,
        score,
        tone: "yellow",
        rewards: [{ id: "xp", icon: "star", label: "XP", amount: xp, highlighted: xp > 0 }],
        primary: { label: "Continue", onAction: onContinue },
      }),
    );
    return () => root.replaceChildren();
  }, [onContinue, score, stars, title, xp]);

  return (
    <div
      ref={host}
      className="k-ui"
      style={{ position: "relative", inset: "auto", pointerEvents: "auto" }}
    />
  );
}

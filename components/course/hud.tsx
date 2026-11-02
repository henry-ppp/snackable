"use client";

import { playCue } from "@/lib/course/sound";
import { Coin, CounterPill, GlossButton, ProgressBar } from "playglaze";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { View } from "react-native";

export function XpPill({ value }: { value: number }) {
  return (
    <CounterPill
      value={`${value} XP`}
      width={148}
      icon={
        <View style={{ marginTop: 4 }}>
          <Coin size={34} />
        </View>
      }
    />
  );
}

export function Hud({
  backHref,
  backLabel,
  title,
  progress,
  trailing,
}: {
  backHref?: string;
  backLabel?: string;
  title?: string;
  progress?: number;
  trailing?: ReactNode;
}) {
  const router = useRouter();

  return (
    <div className="grid gap-3">
      {backHref && backLabel ? (
        <div className="flex items-center justify-between gap-3">
          <GlossButton
            size="sm"
            color="blue"
            title={backLabel}
            width={backLabel.length > 6 ? 132 : 96}
            onPress={() => {
              playCue("ui");
              router.push(backHref);
            }}
          />
          {trailing}
        </div>
      ) : trailing ? (
        <div className="flex justify-end">{trailing}</div>
      ) : null}
      {title ? <p className="text-lg font-semibold text-[#6a3d12]">{title}</p> : null}
      {progress !== undefined ? <ProgressBar value={progress} color="blue" /> : null}
    </div>
  );
}

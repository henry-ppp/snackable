"use client";

import { ThemeProvider, bright } from "playglaze";
import { useEffect, useState, type ReactNode } from "react";

export function PlayFrame({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  if (!ready) {
    return <div className="fixed inset-0 z-20 bg-[#d7ecff]" />;
  }

  return (
    <div className="fixed inset-0 z-20 overflow-auto bg-[#d7ecff] text-[#1c2430]">
      <ThemeProvider theme={bright}>
        <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-4 px-4 py-5">{children}</div>
      </ThemeProvider>
    </div>
  );
}

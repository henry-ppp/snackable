"use client";

import katex from "katex";
import "katex/dist/katex.min.css";
import type { ReactNode } from "react";

const FORMULA = /\$\$([\s\S]+?)\$\$|\$(.+?)\$/g;

/**
 * Renders a round's text. `$...$` is inline math and `$$...$$` is a display
 * formula. Anything outside those markers stays as words. A broken formula
 * shows KaTeX's own error, it does not throw.
 */
export function MathText({
  text,
  tone = "ink",
}: {
  text: string;
  tone?: "ink" | "light";
}) {
  const parts: ReactNode[] = [];
  let cursor = 0;
  let key = 0;

  for (const match of text.matchAll(FORMULA)) {
    const index = match.index ?? 0;
    if (index > cursor) parts.push(text.slice(cursor, index));
    const display = match[1] !== undefined;
    const tex = (display ? match[1] : match[2]).trim();
    const html = katex.renderToString(tex, {
      displayMode: display,
      throwOnError: false,
      output: "html",
    });
    parts.push(
      <span
        key={key++}
        className={display ? "my-2 block overflow-x-auto text-center" : undefined}
        dangerouslySetInnerHTML={{ __html: html }}
      />,
    );
    cursor = index + match[0].length;
  }

  if (cursor < text.length) parts.push(text.slice(cursor));

  return <span className={tone === "light" ? "math-on-button" : "math-ink"}>{parts}</span>;
}

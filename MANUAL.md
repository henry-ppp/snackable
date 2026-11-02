# Snackable

Snackable is a study course. A person picks a subject, walks a path of topics and levels, and clears each level by reading a short lesson and answering questions. Hearts, XP, stars, sound, formulas, and figures are already built. A new study is a content file. Leave `app/`, `components/course/`, and `lib/course/` alone.

## How a course is shaped

A **subject** is one card on the home screen. It contains **topics**. A topic is a named stretch of the path and contains **levels** in order. A level is one sitting: a few concept screens, then questions.

```text
subject
  topic
    level
      concept or question
      question
      ...
```

Ids are kebab-case. Level ids are unique across the whole subject, because the URL is `/<subject id>/<level id>`.

## How a run works

The shell enforces this. Content does not reimplement it.

- The first level of every topic is open. A later topic does not wait on an earlier topic.
- Inside a topic, the next level opens only after the previous level in that same topic is cleared.
- Each level starts with its `hearts`. A wrong answer spends one. At 0 hearts the level stays uncleared and has to be played again.
- A perfect clear pays the level's `xp`. Each missing heart pays a smaller share: `xp` times hearts left, divided by hearts at the start, rounded. Clearing a level that was already cleared pays nothing. A later clear can still improve the stored hearts and the stars.
- Stars are 3 when every heart remains, 2 when at least half remain, 1 when any remain, and 0 when the level is not cleared.
- Progress is stored in the browser under `snackable-course`. Refreshing in the middle of a level starts that attempt over. A failed attempt and a clear both count as an attempt.

Routes:

- `/` lists subjects.
- `/<subject id>` is that subject's path.
- `/<subject id>/<level id>` plays the level.

## Add a subject

1. Add `content/subjects/<id>.ts` that exports a `Subject`.
2. Import it in `content/subjects/index.ts` and append it to `SUBJECTS`.
3. Put any figure in `public/` and point `image.src` at that public path.

`SUBJECTS` checks every subject on startup. A broken subject throws and names the problem. Fix the content. The check requires an id and a title, at least one topic, at least one level per topic, unique level ids, at least one heart, at least one question per level, an `answerId` that is one of that question's choices, and a `src` plus `alt` on any image.

```ts
import type { Subject } from "@/lib/course/types";

export const example: Subject = {
  id: "example",
  title: "Example",
  blurb: "One sentence on the subject card.",
  topics: [
    {
      id: "opening",
      title: "Opening",
      summary: "Shown beside this topic on the path.",
      levels: [
        {
          id: "first",
          title: "First idea",
          hearts: 3,
          xp: 20,
          rounds: [
            {
              kind: "concept",
              id: "idea",
              title: "Short title",
              body: "Teach one idea.",
            },
            {
              kind: "question",
              id: "check",
              prompt: "Ask one thing.",
              choices: [
                { id: "yes", text: "The right idea" },
                { id: "no", text: "A plausible miss" },
                { id: "other", text: "Another miss" },
              ],
              answerId: "yes",
              explain: "Why the right idea is right.",
            },
          ],
        },
      ],
    },
  ],
};
```

Give a level about **5 to 10 questions**. That is the length that serves the learning: enough to practice the idea, short enough to finish in one sitting. One or two questions only demonstrate the shell. Three choices is the usual count. Write `explain` so it teaches the idea, whichever choice was picked. A topic title is drawn on the path plaque and can run to a few words.

The sample above is the shape, shortened so it fits on a page. A level you ship should keep going until it has about 5 to 10 questions. A concept may come first, or between questions, whenever a new idea needs a screen of its own.

## Formulas and figures

In `body`, `prompt`, `choices[].text`, and `explain`:

- `$...$` renders inline.
- `$$...$$` renders on its own line.

Write the formula in the text. Escape backslashes in the TypeScript string (`\\eta`, `\\theta`).

A concept or a question may include `image: { src: "/course/name.svg", alt: "What the figure shows" }`. `src` is a path under `public/` or a URL. The shell shows the figure above the text, contained so the whole picture stays visible.

## Remove the demo when you add your own content

`content/subjects/models.ts` is a sample subject, registered as `models` in `content/subjects/index.ts`. It exists so the empty shell can be played. When customized content is added, remove that demo:

1. Delete `content/subjects/models.ts`.
2. Remove its import and its entry from `SUBJECTS` in `content/subjects/index.ts`.
3. Delete `public/course/stationary.svg` if your own subjects do not use that figure.

Leave `SUBJECTS` containing only the subjects you intend to ship. The home screen lists whatever is in that array.

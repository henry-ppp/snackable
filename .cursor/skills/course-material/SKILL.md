---
name: course-material
description: >-
  Add or edit Snackable study subjects, topics, and levels on the existing
  course shell. Use when creating a subject, topic, level, lesson, quiz, or
  study material, or when the user mentions hearts, XP, formulas, figures,
  or the play map.
---

# Course material

Study content is data. The map, hearts, XP, sound, and formula rendering already exist. Add a subject by writing one file and registering it. Do not rebuild the shell in `components/course`, `lib/course`, or `app`.

## Add a subject

1. Add `content/subjects/<id>.ts` that exports a `Subject` from `lib/course/types.ts`.
2. Import it in `content/subjects/index.ts` and append it to `SUBJECTS`.
3. If a round needs a figure, put the file in `public/` and point `image.src` at that path.

`SUBJECTS` runs `problemsIn` on import. A broken subject throws at startup. Fix the message; do not weaken the check.

Copy the shape of `content/subjects/models.ts`. Ids are kebab-case. Level ids are unique across the whole subject.

## Shape

```ts
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
            { kind: "concept", id: "idea", title: "Short title", body: "Teach one idea." },
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

A subject is a list of topics. A topic is an ordered list of levels. A level is an ordered list of rounds, each a `concept` or a `question`. A level needs `hearts` of at least 1 and at least one question whose `answerId` is one of its choice ids.

## How a run behaves

The shell enforces this. Do not reimplement it in content.

- The first level of every topic is open. Later topics do not wait on earlier topics.
- Inside a topic, a level opens only after the previous level in that topic is cleared.
- A wrong answer spends one heart. At 0 hearts the level stays uncleared and must be replayed.
- Clearing pays `xp` when no heart was lost, and a proportional share otherwise. A second clear pays nothing.
- Stars are 3, 2, or 1 from the hearts left. The shell draws them.

Prefer a short concept, then two or three questions. Three choices is the usual count. Write the explanation so it teaches, not only labels the answer.

## Formulas and figures

In `body`, `prompt`, `choices[].text`, and `explain`:

- `$...$` renders inline.
- `$$...$$` renders on its own line.

Write the formula, not a picture of the source. Escape backslashes in the TypeScript string (`\\eta`, `\\theta`).

A round may include `image: { src: "/course/name.svg", alt: "What the figure shows" }`. `src` is a public path or a URL. The shell shows it above the text.

## Where it shows up

- `/` lists subjects.
- `/<subject id>` is that subject's path.
- `/<subject id>/<level id>` plays the level.

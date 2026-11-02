"use client";

import {
  applyAttempt,
  findLevel,
  isUnlocked,
  playCue,
  saveCourse,
  starsFor,
  type RoundImage,
  type Subject,
} from "@/lib/course";
import { GlossButton, Hearts, Panel } from "playglaze";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Hud } from "@/components/course/hud";
import { MathText } from "@/components/course/math-text";
import { PlayFrame } from "@/components/course/play-frame";
import { StageClear } from "@/components/course/stage-clear";
import { useCourse } from "@/components/course/use-course";

function RoundPicture({ image }: { image?: RoundImage }) {
  if (!image) return null;
  return (
    <img
      src={image.src}
      alt={image.alt}
      className="mb-4 max-h-56 w-full rounded-2xl object-contain"
    />
  );
}

type Phase =
  | { kind: "play"; index: number; hearts: number; picked: string | null }
  | { kind: "failed"; explain: string }
  | { kind: "cleared"; hearts: number; gained: number };

export function LevelRun({ subject, levelId }: { subject: Subject; levelId: string }) {
  const place = findLevel(subject, levelId);
  const course = useCourse();
  const router = useRouter();
  const open = place ? isUnlocked(subject, course, levelId) : false;
  const [phase, setPhase] = useState<Phase | null>(null);
  const leave = useCallback(() => {
    playCue("ui");
    router.push(`/${subject.id}`);
  }, [router, subject.id]);

  if (!place) {
    return (
      <PlayFrame>
        <p>This level is not in {subject.title}.</p>
        <Link href={`/${subject.id}`}>Back to the map</Link>
      </PlayFrame>
    );
  }

  if (!open) {
    return (
      <PlayFrame>
        <p>Clear the previous level in this topic first.</p>
        <Link href={`/${subject.id}`}>Back to the map</Link>
      </PlayFrame>
    );
  }

  const level = place.level;
  const run = phase ?? { kind: "play" as const, index: 0, hearts: level.hearts, picked: null };
  const round = level.rounds[run.kind === "play" ? run.index : 0];
  const doneCount = run.kind === "play" ? run.index : level.rounds.length;

  function finish(heartsLeft: number) {
    const outcome = applyAttempt(course, subject.id, level, heartsLeft);
    saveCourse(outcome.progress);
    playCue("clear");
    setPhase({ kind: "cleared", hearts: heartsLeft, gained: outcome.gained });
  }

  function advance(hearts: number) {
    const next = run.kind === "play" ? run.index + 1 : 0;
    if (next >= level.rounds.length) {
      finish(hearts);
      return;
    }
    playCue("ui");
    setPhase({ kind: "play", index: next, hearts, picked: null });
  }

  function pick(choiceId: string) {
    if (run.kind !== "play" || run.picked || round.kind !== "question") {
      return;
    }
    const correct = choiceId === round.answerId;
    const hearts = correct ? run.hearts : run.hearts - 1;
    if (!correct && hearts <= 0) {
      const outcome = applyAttempt(course, subject.id, level, 0);
      saveCourse(outcome.progress);
      playCue("fail");
      setPhase({ kind: "failed", explain: round.explain });
      return;
    }
    playCue(correct ? "correct" : "wrong");
    setPhase({ kind: "play", index: run.index, hearts, picked: choiceId });
  }

  if (run.kind === "cleared") {
    return (
      <PlayFrame>
        <StageClear
          title="Level clear"
          stars={starsFor(level, run.hearts, true)}
          score={run.hearts}
          xp={run.gained}
          onContinue={leave}
        />
      </PlayFrame>
    );
  }

  if (run.kind === "failed") {
    return (
      <PlayFrame>
        <Hud
          backHref={`/${subject.id}`}
          backLabel="Map"
          title={`${subject.topics[place.topicIndex].title} · ${level.title}`}
          trailing={<Hearts count={0} max={level.hearts} />}
        />
        <Panel title="Out of hearts" padding={18}>
          <MathText text={run.explain} />
          <p className="mt-3 text-lg leading-relaxed text-[#3f2a14]">
            {level.title} is not cleared. The next level stays shut until you finish this one with a heart left.
          </p>
          <div className="mt-4 max-w-xs">
            <GlossButton
              title="Try again"
              color="red"
              size="md"
              onPress={() => {
                playCue("ui");
                setPhase({ kind: "play", index: 0, hearts: level.hearts, picked: null });
              }}
            />
          </div>
        </Panel>
      </PlayFrame>
    );
  }

  const progress = level.rounds.length === 0 ? 0 : doneCount / level.rounds.length;

  return (
    <PlayFrame>
      <Hud
        backHref={`/${subject.id}`}
        backLabel="Map"
        title={`${subject.topics[place.topicIndex].title} · ${level.title}`}
        progress={progress}
        trailing={<Hearts count={run.hearts} max={level.hearts} />}
      />

      {round.kind === "concept" ? (
        <Panel title={round.title} padding={18}>
          <RoundPicture image={round.image} />
          <MathText text={round.body} />
          <div className="mt-4 max-w-xs">
            <GlossButton title="Continue" color="blue" size="md" onPress={() => advance(run.hearts)} />
          </div>
        </Panel>
      ) : (
        <Panel title="Question" padding={18}>
          <RoundPicture image={round.image} />
          <MathText text={round.prompt} />
          <div className="mt-4 grid gap-2">
            {round.choices.map((choice) => {
              const picked = run.picked;
              const color = !picked
                ? "orange"
                : choice.id === round.answerId
                  ? "green"
                  : choice.id === picked
                    ? "red"
                    : "gray";
              return (
                <GlossButton key={choice.id} color={color} size="lg" onPress={() => pick(choice.id)}>
                  <MathText text={choice.text} tone="light" />
                </GlossButton>
              );
            })}
          </div>
          {run.picked ? (
            <div className="mt-4">
              <MathText text={round.explain} />
              {run.hearts > 0 ? (
                <div className="mt-4 max-w-xs">
                  <GlossButton title="Next" color="blue" size="md" onPress={() => advance(run.hearts)} />
                </div>
              ) : null}
            </div>
          ) : null}
        </Panel>
      )}
    </PlayFrame>
  );
}

"use client";

import { isUnlocked, playCue, starsFor, subjectRecord, type Level, type Subject, type Topic } from "@/lib/course";
import { LevelSlot, Ribbon } from "playglaze";
import { useRouter } from "next/navigation";
import { Hud, XpPill } from "@/components/course/hud";
import { PlayFrame } from "@/components/course/play-frame";
import { useCourse } from "@/components/course/use-course";

const WIDTH = 360;
const SLOT = 88;
const LEFT = 20;
const RIGHT = WIDTH - LEFT - SLOT;
const RIBBON_W = 148;

type Stop = {
  topic: Topic;
  level: Level;
  number: number;
  slotX: number;
  slotY: number;
  ribbonX: number | null;
  ribbonY: number | null;
};

function layTrack(subject: Subject): { stops: Stop[]; height: number } {
  const stops: Stop[] = [];
  let y = 8;
  let step = 0;

  for (const topic of subject.topics) {
    topic.levels.forEach((level, index) => {
      const onLeft = step % 2 === 0;
      const slotX = onLeft ? LEFT : RIGHT;
      const ribbonX = index === 0 ? (onLeft ? slotX + SLOT + 10 : slotX - RIBBON_W - 10) : null;
      stops.push({
        topic,
        level,
        number: index + 1,
        slotX,
        slotY: y,
        ribbonX,
        ribbonY: ribbonX === null ? null : y + 18,
      });
      y += 124;
      step += 1;
    });
  }

  return { stops, height: y };
}

function road(stops: Stop[]): string {
  if (stops.length === 0) return "";
  const centers = stops.map((stop) => ({
    x: stop.slotX + SLOT / 2,
    y: stop.slotY + SLOT / 2,
  }));
  let d = `M ${centers[0].x} ${centers[0].y}`;
  for (let i = 1; i < centers.length; i++) {
    const prev = centers[i - 1];
    const next = centers[i];
    const mid = (prev.y + next.y) / 2;
    d += ` C ${prev.x} ${mid}, ${next.x} ${mid}, ${next.x} ${next.y}`;
  }
  return d;
}

export function TopicMap({ subject }: { subject: Subject }) {
  const course = useCourse();
  const router = useRouter();
  const record = subjectRecord(course, subject.id);
  const { stops, height } = layTrack(subject);
  const d = road(stops);

  return (
    <PlayFrame>
      <Hud
        backHref="/"
        backLabel="Subjects"
        trailing={<XpPill value={record.xp} />}
      />
      <div>
        <h1 className="text-2xl font-semibold text-[#3f2a14]">{subject.title}</h1>
        <p className="mt-1 text-base leading-relaxed text-[#3f2a14]/80">
          The path runs through every topic. You can start at the first level of any topic. Inside a topic, clear a level to open the next.
        </p>
      </div>
      <div className="relative mx-auto" style={{ width: WIDTH, height }}>
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0"
          width={WIDTH}
          height={height}
          viewBox={`0 0 ${WIDTH} ${height}`}
        >
          <path d={d} stroke="#a86410" strokeWidth="22" fill="none" strokeLinecap="round" />
          <path d={d} stroke="#f6c24a" strokeWidth="16" fill="none" strokeLinecap="round" />
          <path d={d} stroke="rgba(255,255,255,0.45)" strokeWidth="4" fill="none" strokeLinecap="round" />
        </svg>
        {stops.map((stop) => {
          const saved = record.levels[stop.level.id];
          const open = isUnlocked(subject, course, stop.level.id);
          const cleared = saved?.cleared ?? false;
          const state = !open ? "locked" : cleared ? "done" : "current";
          return (
            <div key={stop.level.id}>
              {stop.ribbonX !== null && stop.ribbonY !== null ? (
                <div className="absolute" style={{ left: stop.ribbonX, top: stop.ribbonY }}>
                  <Ribbon width={RIBBON_W} height={42} title={stop.topic.title} tilt={0} />
                </div>
              ) : null}
              <div className="absolute" style={{ left: stop.slotX, top: stop.slotY }}>
                <LevelSlot
                  level={stop.number}
                  stars={starsFor(stop.level, saved?.heartsLeft ?? 0, cleared)}
                  state={state}
                  disabled={!open}
                  onPress={() => {
                    if (open) {
                      playCue("ui");
                      router.push(`/${subject.id}/${stop.level.id}`);
                    }
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </PlayFrame>
  );
}

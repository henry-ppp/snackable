"use client";

import { isUnlocked, playCue, starsFor, subjectRecord, type Level, type Subject, type Topic } from "@/lib/course";
import { darken, Label, LevelSlot, Ribbon } from "playglaze";
import { useRouter } from "next/navigation";
import { Hud, XpPill } from "@/components/course/hud";
import { PlayFrame } from "@/components/course/play-frame";
import { useCourse } from "@/components/course/use-course";

const WIDTH = 360;
const SLOT = 88;
const LEFT = 16;
const RIGHT = WIDTH - LEFT - SLOT;
const RIBBON_W = 200;
const COOKIE = "#9A5A2C";

type Stop = {
  topic: Topic;
  level: Level;
  number: number;
  slotX: number;
  slotY: number;
  ribbonX: number | null;
  ribbonY: number | null;
};

/** How many lines a chunky title needs inside the plaque. */
function titleLines(title: string, font: number): number {
  const usable = RIBBON_W - 48;
  const char = font * 0.66;
  let lines = 1;
  let used = 0;
  for (const word of title.trim().split(/\s+/)) {
    const wordW = word.length * char;
    const gap = used > 0 ? char * 0.4 : 0;
    if (used > 0 && used + gap + wordW > usable) {
      lines += 1;
      used = wordW;
    } else {
      used += gap + wordW;
    }
  }
  return Math.max(1, lines);
}

/** A short name stays one line. A longer name shrinks slightly and the plaque grows to hold it. */
function ribbonFor(title: string): { height: number; font: number } {
  const words = title.trim().split(/\s+/);
  const longest = words.reduce((max, word) => Math.max(max, word.length), 1);
  let font = 16;
  while (font > 12 && longest * font * 0.66 > RIBBON_W - 48) font -= 1;
  let lines = titleLines(title, font);
  while (lines > 2 && font > 12) {
    font -= 1;
    lines = titleLines(title, font);
  }
  const height = Math.round(Math.min(lines, 3) * font * 1.28 + 26);
  return { height: Math.max(46, height), font };
}

function layTrack(subject: Subject): { stops: Stop[]; height: number } {
  const stops: Stop[] = [];
  let y = 8;
  let step = 0;

  for (const topic of subject.topics) {
    topic.levels.forEach((level, index) => {
      const onLeft = step % 2 === 0;
      const slotX = onLeft ? LEFT : RIGHT;
      const ribbon = index === 0 ? ribbonFor(topic.title) : null;
      const ribbonX = ribbon ? (onLeft ? slotX + SLOT + 8 : slotX - RIBBON_W - 8) : null;
      const outer = ribbon ? ribbon.height * 1.12 : 0;
      stops.push({
        topic,
        level,
        number: index + 1,
        slotX,
        slotY: y,
        ribbonX,
        ribbonY: ribbon ? y + (SLOT - outer) / 2 : null,
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

function TopicRibbon({ title, left, top }: { title: string; left: number; top: number }) {
  const { height, font } = ribbonFor(title);
  return (
    <div className="absolute" style={{ left, top }}>
      <Ribbon width={RIBBON_W} height={height} tilt={0}>
        <Label
          size={font}
          color="#F4FAFF"
          edge={darken(COOKIE, 0.45)}
          numberOfLines={3}
          style={{ width: RIBBON_W - 48, lineHeight: Math.round(font * 1.28) }}
        >
          {title}
        </Label>
      </Ribbon>
    </div>
  );
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
                <TopicRibbon title={stop.topic.title} left={stop.ribbonX} top={stop.ribbonY} />
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

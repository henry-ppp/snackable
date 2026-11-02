import type { Level, Subject } from "@/lib/course/types";

export type LevelRecord = {
  cleared: boolean;
  /** Hearts remaining on the best clear. Zero when the level has never been cleared. */
  heartsLeft: number;
  attempts: number;
};

export type SubjectRecord = {
  xp: number;
  levels: Record<string, LevelRecord>;
};

export type CourseProgress = {
  subjects: Record<string, SubjectRecord>;
};

const STORAGE_KEY = "snackable-course";

export function emptyCourse(): CourseProgress {
  return { subjects: {} };
}

export function subjectRecord(progress: CourseProgress, subjectId: string): SubjectRecord {
  return progress.subjects[subjectId] ?? { xp: 0, levels: {} };
}

export function levelRecord(progress: CourseProgress, subjectId: string, levelId: string): LevelRecord {
  return (
    subjectRecord(progress, subjectId).levels[levelId] ?? {
      cleared: false,
      heartsLeft: 0,
      attempts: 0,
    }
  );
}

export function loadCourse(): CourseProgress {
  if (typeof window === "undefined") return emptyCourse();
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return emptyCourse();
  try {
    const parsed = JSON.parse(raw) as CourseProgress;
    return { subjects: parsed.subjects ?? {} };
  } catch {
    return emptyCourse();
  }
}

export function saveCourse(progress: CourseProgress): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  window.dispatchEvent(new Event(STORAGE_KEY));
}

export function subscribeCourse(onStoreChange: () => void): () => void {
  window.addEventListener(STORAGE_KEY, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(STORAGE_KEY, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

export function readCourseRaw(): string {
  return window.localStorage.getItem(STORAGE_KEY) ?? "";
}

export type LevelPlace = {
  topicIndex: number;
  index: number;
  level: Level;
};

export function findLevel(subject: Subject, levelId: string): LevelPlace | null {
  for (let topicIndex = 0; topicIndex < subject.topics.length; topicIndex += 1) {
    const topic = subject.topics[topicIndex];
    const index = topic.levels.findIndex((level) => level.id === levelId);
    if (index >= 0) return { topicIndex, index, level: topic.levels[index] };
  }
  return null;
}

/** The first level of a topic is open. Later levels wait on the one before them. */
export function isUnlocked(subject: Subject, progress: CourseProgress, levelId: string): boolean {
  const place = findLevel(subject, levelId);
  if (!place) return false;
  if (place.index === 0) return true;
  const previous = subject.topics[place.topicIndex].levels[place.index - 1];
  return levelRecord(progress, subject.id, previous.id).cleared;
}

/** A perfect clear pays the full XP. Each missing heart cuts the payout in proportion. */
export function xpForClear(level: Level, heartsLeft: number): number {
  if (heartsLeft <= 0) return 0;
  return Math.round((level.xp * heartsLeft) / level.hearts);
}

export function starsFor(level: Level, heartsLeft: number, cleared: boolean): number {
  if (!cleared || heartsLeft <= 0) return 0;
  if (heartsLeft >= level.hearts) return 3;
  if (heartsLeft * 2 >= level.hearts) return 2;
  return 1;
}

export function applyAttempt(
  progress: CourseProgress,
  subjectId: string,
  level: Level,
  heartsLeft: number,
): { progress: CourseProgress; gained: number } {
  const subject = subjectRecord(progress, subjectId);
  const previous = subject.levels[level.id] ?? { cleared: false, heartsLeft: 0, attempts: 0 };
  const cleared = heartsLeft > 0;
  const gained = cleared && !previous.cleared ? xpForClear(level, heartsLeft) : 0;
  const next: SubjectRecord = {
    xp: subject.xp + gained,
    levels: {
      ...subject.levels,
      [level.id]: {
        cleared: previous.cleared || cleared,
        heartsLeft: cleared ? Math.max(previous.heartsLeft, heartsLeft) : previous.heartsLeft,
        attempts: previous.attempts + 1,
      },
    },
  };
  return {
    gained,
    progress: { subjects: { ...progress.subjects, [subjectId]: next } },
  };
}

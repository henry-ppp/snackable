"use client";

import { emptyCourse, loadCourse, readCourseRaw, subscribeCourse, type CourseProgress } from "@/lib/course/engine";
import { useMemo, useSyncExternalStore } from "react";

export function useCourse(): CourseProgress {
  const raw = useSyncExternalStore(subscribeCourse, readCourseRaw, () => "");
  return useMemo(() => (raw ? loadCourse() : emptyCourse()), [raw]);
}

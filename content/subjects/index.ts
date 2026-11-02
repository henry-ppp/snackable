import { models } from "@/content/subjects/models";
import { problemsIn, type Subject } from "@/lib/course/types";

/** One line per subject file in this folder. */
export const SUBJECTS: Subject[] = [models];

for (const subject of SUBJECTS) {
  const problems = problemsIn(subject);
  if (problems.length > 0) {
    throw new Error(`Subject "${subject.id}" is not playable.\n${problems.join("\n")}`);
  }
}

export function subjectById(id: string): Subject | undefined {
  return SUBJECTS.find((subject) => subject.id === id);
}

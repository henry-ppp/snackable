"use client";

import { SUBJECTS } from "@/content/subjects";
import { playCue, subjectRecord } from "@/lib/course";
import { GlossButton, Panel } from "playglaze";
import { useRouter } from "next/navigation";
import { PlayFrame } from "@/components/course/play-frame";
import { useCourse } from "@/components/course/use-course";

export function SubjectBoard() {
  const course = useCourse();
  const router = useRouter();

  return (
    <PlayFrame>
      <div>
        <h1 className="text-2xl font-semibold text-[#3f2a14]">Choose a subject</h1>
        <p className="mt-1 text-base leading-relaxed text-[#3f2a14]/80">
          Each subject is its own run. Inside it, topics are groups of levels. You can start any topic. Inside a topic, you clear a level to open the next.
        </p>
      </div>
      <div className="grid gap-4">
        {SUBJECTS.map((subject) => {
          const record = subjectRecord(course, subject.id);
          const cleared = Object.values(record.levels).filter((level) => level.cleared).length;
          const total = subject.topics.reduce((sum, topic) => sum + topic.levels.length, 0);
          return (
            <Panel key={subject.id} title={subject.title} padding={16}>
              <p className="text-base leading-relaxed text-[#3f2a14]">{subject.blurb}</p>
              <p className="mt-2 text-base text-[#3f2a14]/75">
                {subject.topics.length} topics · {cleared} of {total} levels cleared
                {record.xp > 0 ? ` · ${record.xp} XP` : ""}
              </p>
              <div className="mt-3 max-w-xs">
                <GlossButton
                  title="Enter"
                  color="blue"
                  size="md"
                  onPress={() => {
                    playCue("ui");
                    router.push(`/${subject.id}`);
                  }}
                />
              </div>
            </Panel>
          );
        })}
      </div>
    </PlayFrame>
  );
}

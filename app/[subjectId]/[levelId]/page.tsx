import { CourseSuspense, subjectFrom, UnknownSubject } from "@/components/course/gate";
import { LevelRun } from "@/components/course/level-run";

export default function Page({
  params,
}: {
  params: Promise<{ subjectId: string; levelId: string }>;
}) {
  return (
    <CourseSuspense>
      <LevelFromParams params={params} />
    </CourseSuspense>
  );
}

async function LevelFromParams({
  params,
}: {
  params: Promise<{ subjectId: string; levelId: string }>;
}) {
  const { levelId } = await params;
  const subject = await subjectFrom(params);
  if (!subject) return <UnknownSubject />;
  return <LevelRun subject={subject} levelId={levelId} />;
}

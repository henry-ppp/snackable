import { CourseSuspense, subjectFrom, UnknownSubject } from "@/components/course/gate";
import { TopicMap } from "@/components/course/topic-map";

export default function Page({ params }: { params: Promise<{ subjectId: string }> }) {
  return (
    <CourseSuspense>
      <MapFromParams params={params} />
    </CourseSuspense>
  );
}

async function MapFromParams({ params }: { params: Promise<{ subjectId: string }> }) {
  const subject = await subjectFrom(params);
  if (!subject) return <UnknownSubject />;
  return <TopicMap subject={subject} />;
}

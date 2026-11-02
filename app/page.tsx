import { SubjectBoard } from "@/components/course/subject-board";
import { CourseSuspense } from "@/components/course/gate";

export default function Page() {
  return (
    <CourseSuspense>
      <SubjectBoard />
    </CourseSuspense>
  );
}

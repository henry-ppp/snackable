import { subjectById } from "@/content/subjects";
import type { Subject } from "@/lib/course/types";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";

export const courseFallback = <div className="fixed inset-0 z-20 bg-[#d7ecff]" />;

export function CourseSuspense({ children }: { children: ReactNode }) {
  return <Suspense fallback={courseFallback}>{children}</Suspense>;
}

export async function subjectFrom(params: Promise<{ subjectId: string }>): Promise<Subject | undefined> {
  const { subjectId } = await params;
  return subjectById(subjectId);
}

export function UnknownSubject() {
  return (
    <div className="fixed inset-0 z-20 bg-[#d7ecff] p-6 text-[#3f2a14]">
      <p>No subject with that id.</p>
      <Link href="/">Back to subjects</Link>
    </div>
  );
}

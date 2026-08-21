import { supabase } from "@/lib/supabase"
import TestClient from "./test-client"

export const dynamic = "force-dynamic";

export default async function TestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. Fetch test details
  const { data: testRecord } = await supabase
    .from("user_tests")
    .select("*")
    .eq("test_id", id)
    .single()

  if (!testRecord) {
    return <div className="p-8 text-center">Test not found.</div>
  }

  // 2. Fetch questions
  const questionIds = testRecord.configuration.question_ids || []
  
  const { data: questions } = await supabase
    .from("canonical_questions")
    .select("*")
    .in("question_id", questionIds)

  // Sort questions to match the original selected order if needed, but for now just pass them
  return (
    <div className="flex-1 flex flex-col h-full w-full">
      <TestClient testRecord={testRecord} questions={questions || []} />
    </div>
  )
}

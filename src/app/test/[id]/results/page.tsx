import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { Button, buttonVariants } from "@/components/ui/button"
import { CheckCircle2, XCircle, Clock, Target, AlertCircle } from "lucide-react"

export const dynamic = "force-dynamic";

export default async function TestResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: testRecord } = await supabase
    .from("user_tests")
    .select("*")
    .eq("test_id", id)
    .single()

  if (!testRecord || !testRecord.completed_at) {
    return <div className="p-8 text-center text-muted-foreground">Test results not available or test not completed.</div>
  }

  const { data: attempts } = await supabase
    .from("user_attempts")
    .select("*")
    .eq("test_id", id)

  const isPractice = testRecord.test_type === "practice"
  const totalAttempted = attempts?.length || 0
  const totalCorrect = attempts?.filter(a => a.is_correct).length || 0
  const totalWrong = totalAttempted - totalCorrect

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-10 space-y-3">
        <h1 className="text-3xl font-semibold">
          {isPractice ? "Practice Session Complete" : "Test Results"}
        </h1>
        <p className="text-muted-foreground">
          You completed the {testRecord.test_type} mode on {new Date(testRecord.completed_at).toLocaleDateString()}.
        </p>
      </div>

      <div className="w-full bg-[#f9f9f9] dark:bg-[#212121] rounded-3xl p-8 mb-8 border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-1"><Target className="w-4 h-4"/> Score</p>
            <p className="text-3xl font-semibold text-primary">{testRecord.score !== null ? testRecord.score : "-"}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500"/> Accuracy</p>
            <p className="text-3xl font-semibold">{testRecord.accuracy !== null ? `${testRecord.accuracy}%` : "-"}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-1"><CheckCircle2 className="w-4 h-4"/> Correct</p>
            <p className="text-3xl font-semibold text-green-600 dark:text-green-400">{totalCorrect}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-1"><XCircle className="w-4 h-4"/> Incorrect</p>
            <p className="text-3xl font-semibold text-red-600 dark:text-red-400">{totalWrong}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Link href={`/`} className={buttonVariants({ size: "lg", className: "rounded-xl px-8" })}>
          Take Another Test
        </Link>
        <Link href={`/mistakes`} className={buttonVariants({ variant: "outline", size: "lg", className: "rounded-xl px-8" })}>
          Review Mistakes
        </Link>
      </div>
    </div>
  )
}

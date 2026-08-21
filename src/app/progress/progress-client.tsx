"use client"

import { Target, CheckCircle2, AlertTriangle, HelpCircle, Activity } from "lucide-react"
import Link from "next/link"
import { Button, buttonVariants } from "@/components/ui/button"

export default function ProgressClient({ data }: { data: any }) {
  const { testHistory, overall, subjectPerformance } = data

  return (
    <div className="space-y-12 pb-12 w-full">
      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#212121] rounded-2xl border p-6 flex flex-col justify-between shadow-sm">
          <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Activity className="w-4 h-4" /> Total Attempts
          </span>
          <span className="text-3xl font-semibold mt-4">{overall.totalAttempts}</span>
        </div>
        <div className="bg-white dark:bg-[#212121] rounded-2xl border p-6 flex flex-col justify-between shadow-sm">
          <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" /> Overall Accuracy
          </span>
          <span className="text-3xl font-semibold mt-4">{overall.overallAccuracy}%</span>
        </div>
        <div className="bg-white dark:bg-[#212121] rounded-2xl border p-6 flex flex-col justify-between shadow-sm">
          <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Overconfidence
          </span>
          <span className="text-3xl font-semibold mt-4">{overall.highConfidenceMistakes}</span>
          <p className="text-xs text-muted-foreground mt-1">High confidence mistakes</p>
        </div>
        <div className="bg-white dark:bg-[#212121] rounded-2xl border p-6 flex flex-col justify-between shadow-sm">
          <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-purple-500" /> Lucky Guesses
          </span>
          <span className="text-3xl font-semibold mt-4">{overall.blindGuessSuccess}</span>
          <p className="text-xs text-muted-foreground mt-1">Correct blind guesses</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Subject Performance */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Subject Mastery</h3>
          {subjectPerformance.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4">No subjects attempted yet.</p>
          ) : (
            <div className="space-y-4">
              {subjectPerformance.map((subj: any) => (
                <div key={subj.subject} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{subj.subject}</span>
                    <span className="text-muted-foreground">{subj.accuracy}% ({subj.total} questions)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${subj.accuracy >= 80 ? 'bg-green-500' : subj.accuracy >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${subj.accuracy}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Test History */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Recent Tests</h3>
          {testHistory.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4">No tests taken yet.</p>
          ) : (
            <div className="space-y-3">
              {testHistory.slice(0, 5).map((test: any) => (
                <div key={test.test_id} className="flex items-center justify-between p-4 bg-[#f9f9f9] dark:bg-[#212121] rounded-xl border">
                  <div>
                    <div className="font-medium capitalize">{test.test_type} Mode</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(test.started_at).toLocaleDateString()} • {test.configuration.count || test.configuration.question_ids?.length} Questions
                    </div>
                  </div>
                  <div className="text-right">
                    {test.completed_at ? (
                      <>
                        <div className="font-semibold">{test.score !== null ? `${test.score} Marks` : `${test.accuracy}%`}</div>
                        <Link href={`/test/${test.test_id}/results`} className={buttonVariants({ variant: "link", size: "sm", className: "h-auto p-0 mt-1" })}>
                          View Results
                        </Link>
                      </>
                    ) : (
                      <Link href={`/test/${test.test_id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                        Resume
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

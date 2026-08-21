"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { QuestionCard } from "@/components/question-card"
import { Button } from "@/components/ui/button"

export default function MistakesClient({ mistakes, blindGuesses }: { mistakes: any[], blindGuesses: any[] }) {
  const [tab, setTab] = useState("mistakes")

  return (
    <div className="w-full pb-10">
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <div className="flex justify-center mb-8">
          <TabsList className="grid w-full max-w-sm grid-cols-2 rounded-full bg-black/5 dark:bg-white/5 p-1 h-12">
            <TabsTrigger value="mistakes" className="rounded-full data-[state=active]:shadow-sm">
              Mistakes Ledger ({mistakes.length})
            </TabsTrigger>
            <TabsTrigger value="blind" className="rounded-full data-[state=active]:shadow-sm">
              Blind Guesses ({blindGuesses.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="mistakes" className="space-y-6 outline-none">
          {mistakes.length > 0 && (
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const text = mistakes.map((m: any) => `Q: ${m.question.question}\nOptions: ${m.question.options}\nAnswer: ${m.question.answer}`).join('\n\n---\n\n');
                  navigator.clipboard.writeText(text);
                  alert("Copied all pending mistakes to clipboard!");
                }}
              >
                Copy All to Clipboard
              </Button>
            </div>
          )}

          {mistakes.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground border rounded-3xl bg-muted/10">
              You have no pending mistakes. Great job!
            </div>
          ) : (
            mistakes.map((m: any) => (
              <div key={m.question_id} className="relative bg-white dark:bg-[#212121] rounded-3xl border p-2 shadow-sm">
                <div className="absolute top-6 right-6 flex flex-col items-end">
                  <div className="text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-900">
                    {m.remainingToClear} correct answers needed to clear
                  </div>
                </div>
                <div className="pt-12 px-2 pb-2">
                  <QuestionCard question={m.question} mode="explore" initialBookmarked={m.is_bookmarked} />
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="blind" className="space-y-6 outline-none">
          {blindGuesses.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground border rounded-3xl bg-muted/10">
              No recent blind guesses to review.
            </div>
          ) : (
            blindGuesses.map((b: any) => (
              <div key={b.question_id} className="relative bg-white dark:bg-[#212121] rounded-3xl border p-2 shadow-sm">
                 <div className="absolute top-6 right-6 flex flex-col items-end">
                  <div className="text-xs font-semibold text-purple-600 bg-purple-50 dark:bg-purple-950/30 px-3 py-1.5 rounded-full border border-purple-200 dark:border-purple-900">
                    Last answered with Blind Guess
                  </div>
                </div>
                <div className="pt-12 px-2 pb-2">
                  <QuestionCard question={b.question} mode="explore" initialBookmarked={b.is_bookmarked} />
                </div>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

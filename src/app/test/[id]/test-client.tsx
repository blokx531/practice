"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { QuestionCard } from "@/components/question-card"
import { ChevronLeft, ChevronRight, Clock, Flag, LayoutGrid } from "lucide-react"

export default function TestClient({ testRecord, questions }: { testRecord: any, questions: any[] }) {
  const router = useRouter()
  const isPractice = testRecord.test_type === "practice"
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, { option: string, confidence: string }>>({})
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({})
  const [showPalette, setShowPalette] = useState(false)
  
  const currentQuestion = questions[currentIndex]

  const handleAnswer = (questionId: string, option: string, confidence: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { option, confidence }
    }))
  }

  const toggleReview = () => {
    setMarkedForReview(prev => ({
      ...prev,
      [currentQuestion.question_id]: !prev[currentQuestion.question_id]
    }))
  }

  const clearResponse = () => {
    setAnswers(prev => {
      const newAnswers = { ...prev }
      delete newAnswers[currentQuestion.question_id]
      return newAnswers
    })
  }

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (forceSubmit = false) => {
    // Validation: ensure every answered question has confidence selected
    const validAnswers: Record<string, { option: string, confidence: string }> = {}
    
    const incomplete = Object.entries(answers).find(([_, ans]) => ans.option && !ans.confidence)
    
    if (incomplete && !forceSubmit) {
      alert("You must select a confidence level for all attempted questions.")
      return
    }

    // If forceSubmit is true, we just drop the incomplete answers
    for (const [qId, ans] of Object.entries(answers)) {
      if (ans.option && ans.confidence) {
        validAnswers[qId] = ans
      }
    }

    setIsSubmitting(true)
    try {
      const { submitTest } = await import("@/actions/submit-actions")
      await submitTest(testRecord.test_id, validAnswers)
      router.push(`/test/${testRecord.test_id}/results`)
    } catch (e) {
      console.error(e)
      alert("Failed to submit test. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const [timeLeft, setTimeLeft] = useState(() => Math.round(questions.length * 1.2 * 60))

  const hasTimer = testRecord.test_type === "simulation" ? (testRecord.configuration?.timerEnabled !== false) : !!testRecord.configuration?.timerEnabled;

  useEffect(() => {
    if (!hasTimer || timeLeft <= 0 || isSubmitting) return
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmit(true) // Auto submit when time is up, dropping incomplete answers
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [hasTimer, timeLeft, isSubmitting])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3 bg-white dark:bg-[#171717] sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-4">
          <span className="font-semibold">{isPractice ? 'Practice Session' : 'UPSC Simulation'}</span>
          {hasTimer && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${timeLeft < 300 ? 'text-red-600 bg-red-50 dark:bg-red-950/30' : 'text-amber-600 bg-amber-50 dark:bg-amber-950/30'}`}>
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowPalette(!showPalette)} className="flex md:hidden">
            <LayoutGrid className="w-4 h-4 mr-2" />
            Palette
          </Button>
          <Button size="sm" onClick={() => handleSubmit(false)} disabled={isSubmitting} variant={isPractice ? "secondary" : "default"}>
            {isSubmitting ? "Submitting..." : (isPractice ? 'Finish Practice' : 'Submit Test')}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex justify-between items-center text-sm font-medium text-muted-foreground border-b pb-4">
              <span>Question {currentIndex + 1} of {questions.length}</span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={toggleReview} className={markedForReview[currentQuestion.question_id] ? "text-purple-600 bg-purple-50 dark:bg-purple-900/20" : ""}>
                  <Flag className="w-4 h-4 mr-2" />
                  Review
                </Button>
                <Button variant="ghost" size="sm" onClick={clearResponse}>Clear</Button>
              </div>
            </div>

            <QuestionCard 
              key={currentQuestion.question_id}
              question={currentQuestion} 
              mode={isPractice ? "practice" : "test"} 
              initialOption={answers[currentQuestion.question_id]?.option || ""}
              initialConfidence={answers[currentQuestion.question_id]?.confidence || ""}
              onAnswer={handleAnswer} 
            />

            <div className="flex justify-between pt-8">
              <Button 
                variant="outline" 
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-2" /> Previous
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                disabled={currentIndex === questions.length - 1}
              >
                Next <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* Question Palette Sidebar */}
        <div className={`w-64 border-l bg-[#f9f9f9] dark:bg-[#171717] overflow-y-auto shrink-0 ${showPalette ? 'block absolute right-0 top-[60px] bottom-0 z-20 shadow-2xl md:static md:shadow-none border-t md:border-t-0' : 'hidden md:block'}`}>
          <div className="p-4 space-y-4">
              <h3 className="font-semibold text-sm">Question Palette</h3>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, i) => {
                  const ans = answers[q.question_id]
                  const isMarked = markedForReview[q.question_id]
                  const isAnswered = ans && (isPractice || ans.confidence) // In test, confidence is mandatory to be considered answered
                  
                  let bgColor = "bg-white dark:bg-[#212121] border-border text-foreground"
                  if (isAnswered) bgColor = "bg-green-100 dark:bg-green-900/30 border-green-200 text-green-700"
                  if (isMarked) bgColor = "bg-purple-100 dark:bg-purple-900/30 border-purple-200 text-purple-700"
                  if (isAnswered && isMarked) bgColor = "bg-blue-100 dark:bg-blue-900/30 border-blue-200 text-blue-700"
                  if (currentIndex === i) bgColor = "ring-2 ring-primary border-primary bg-primary/5"

                  return (
                    <button
                      key={q.question_id}
                      onClick={() => {
                        setCurrentIndex(i)
                        setShowPalette(false)
                      }}
                      className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-medium border transition-colors ${bgColor}`}
                    >
                      {i + 1}
                    </button>
                  )
                })}
              </div>
              <div className="pt-4 border-t space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-green-100 border border-green-200"></div> Answered</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-white border border-border"></div> Not Answered</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-purple-100 border border-purple-200"></div> Marked for Review</div>
              </div>
            </div>
          </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Bookmark, BookmarkCheck, CheckCircle2, XCircle } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { toggleBookmark } from "@/actions/bookmark-actions"

interface QuestionProps {
  question: any
  mode: "explore" | "practice" | "test"
  initialOption?: string
  initialConfidence?: string
  initialBookmarked?: boolean
  onAnswer?: (questionId: string, selectedOption: string, confidence: string) => void
}

export function QuestionCard({ question, mode, initialOption = "", initialConfidence = "", initialBookmarked = false, onAnswer }: QuestionProps) {
  const [showAnswer, setShowAnswer] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked)
  const [selectedOption, setSelectedOption] = useState(initialOption)
  const [confidence, setConfidence] = useState(initialConfidence)

  useEffect(() => {
    setSelectedOption(initialOption)
    setConfidence(initialConfidence)
  }, [initialOption, initialConfidence])

  const handleBookmarkToggle = async () => {
    const newState = !isBookmarked;
    setIsBookmarked(newState);
    try {
      await toggleBookmark(question.question_id, newState);
    } catch (e) {
      // revert if failed
      setIsBookmarked(!newState);
      console.error(e);
    }
  }

  const options = typeof question.options === 'string' ? JSON.parse(question.options) : question.options

  // Clean options if they start with A. B. etc
  const cleanOptions = options.map((opt: string) => opt.replace(/^[A-D]\.\s*/, ''))
  const optionLetters = ['A', 'B', 'C', 'D']

  const handleOptionSelect = (val: string) => {
    setSelectedOption(val)
    onAnswer?.(question.question_id, val, confidence)
  }

  const handleConfidenceSelect = (val: string) => {
    setConfidence(val)
    onAnswer?.(question.question_id, selectedOption, val)
  }

  return (
    <div className="py-6 border-b last:border-b-0 space-y-6">
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-3">
            <span className="bg-secondary px-2 py-1 rounded-md">{question.year}</span>
            <span className="bg-secondary px-2 py-1 rounded-md">{question.subject}</span>
            <span className="bg-secondary px-2 py-1 rounded-md truncate max-w-[200px]">{question.topic_tag}</span>
          </div>
          <div className="text-lg leading-relaxed text-foreground whitespace-pre-wrap">
            {question.question}
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleBookmarkToggle}
          className="shrink-0"
        >
          {isBookmarked ? <BookmarkCheck className="h-5 w-5 fill-primary text-primary" /> : <Bookmark className="h-5 w-5 text-muted-foreground" />}
        </Button>
      </div>

      <div className="pl-2 space-y-3">
        <RadioGroup value={selectedOption} onValueChange={handleOptionSelect} className="space-y-2">
          {cleanOptions.map((opt: string, idx: number) => {
            const letter = optionLetters[idx]
            const isCorrect = showAnswer && letter === question.answer
            const isWrongSelected = showAnswer && selectedOption === letter && letter !== question.answer

            return (
              <div 
                key={idx} 
                className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                  isCorrect ? 'bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-900' :
                  isWrongSelected ? 'bg-red-50/50 border-red-200 dark:bg-red-950/20 dark:border-red-900' :
                  selectedOption === letter ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-secondary/50'
                }`}
              >
                <RadioGroupItem value={letter} id={`${question.question_id}-${letter}`} className="mt-1" />
                <Label htmlFor={`${question.question_id}-${letter}`} className="text-base font-normal leading-snug cursor-pointer flex-1">
                  <span className="font-semibold mr-2">{letter}.</span> {opt}
                </Label>
                {isCorrect && <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />}
                {isWrongSelected && <XCircle className="h-5 w-5 text-red-600 shrink-0" />}
              </div>
            )
          })}
        </RadioGroup>
      </div>

      {(mode === "test" || mode === "practice") && (
        <div className="pt-4 border-t border-dashed">
          <div className="text-sm font-medium mb-3 text-muted-foreground">How confident are you?</div>
          <div className="flex gap-2">
            {['Confident', 'Conflicted', 'Blind Guess'].map((level) => (
              <Button
                key={level}
                variant={confidence === level ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => handleConfidenceSelect(level)}
              >
                {level}
              </Button>
            ))}
          </div>
        </div>
      )}

      {(mode === "explore" || mode === "practice") && (
        <div className="pt-2 flex items-center justify-between">
          <Button variant="secondary" onClick={() => setShowAnswer(!showAnswer)}>
            {showAnswer ? "Hide Answer" : "Show Answer"}
          </Button>
          
          {showAnswer && (
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium">
                Correct Answer: <span className="text-green-600 dark:text-green-400 font-bold">{question.answer}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  const prompt = `Act as a UPSC expert. Explain why option ${question.answer} is correct for the following question, and why the other options are wrong.\n\nQuestion: ${question.question}\nOptions: ${JSON.stringify(options, null, 2)}`;
                  navigator.clipboard.writeText(prompt);
                  alert("Prompt copied to clipboard! Paste it into ChatGPT or Claude.");
                }}
              >
                Explain via AI
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

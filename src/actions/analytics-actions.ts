"use server"

import { supabase } from "@/lib/supabase"
import { getUserId } from "@/utils/supabase/server"


export async function getAnalytics() {
  const [testsResponse, attemptsResponse] = await Promise.all([
    supabase
      .from("user_tests")
      .select("*")
      .eq("user_id", (await getUserId()))
      .order("started_at", { ascending: false }),
      
    supabase
      .from("user_attempts")
      .select("is_correct, confidence, canonical_questions(subject, topic_tag)")
      .eq("user_id", (await getUserId()))
  ])

  if (testsResponse.error) throw new Error(testsResponse.error.message)
  if (attemptsResponse.error) throw new Error(attemptsResponse.error.message)

  const tests = testsResponse.data || []
  const attempts = attemptsResponse.data || []

  // Subject Performance
  const subjectStats: Record<string, { total: number, correct: number }> = {}
  let highConfidenceMistakes = 0
  let blindGuessSuccess = 0
  
  attempts.forEach((attempt: any) => {
    const subject = attempt.canonical_questions?.subject || "Unknown"
    
    if (!subjectStats[subject]) {
      subjectStats[subject] = { total: 0, correct: 0 }
    }
    
    subjectStats[subject].total++
    if (attempt.is_correct) {
      subjectStats[subject].correct++
    }

    if (attempt.confidence === 'confident' && !attempt.is_correct) {
      highConfidenceMistakes++
    }
    if (attempt.confidence === 'blind_guess' && attempt.is_correct) {
      blindGuessSuccess++
    }
  })

  const subjectPerformance = Object.entries(subjectStats).map(([subject, stats]) => ({
    subject,
    accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
    total: stats.total
  })).sort((a, b) => b.total - a.total)

  return {
    testHistory: tests,
    overall: {
      totalAttempts: attempts.length,
      overallAccuracy: attempts.length > 0 ? Math.round((attempts.filter(a => a.is_correct).length / attempts.length) * 100) : 0,
      highConfidenceMistakes,
      blindGuessSuccess
    },
    subjectPerformance
  }
}

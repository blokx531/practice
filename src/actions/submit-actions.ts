"use server"

import { supabase } from "@/lib/supabase"

const MOCK_USER_ID = "00000000-0000-0000-0000-000000000000"

export async function submitTest(testId: string, answers: Record<string, { option: string, confidence: string }>) {
  // 1. Fetch test details and correct answers
  const { data: testRecord, error: testError } = await supabase
    .from("user_tests")
    .select("*")
    .eq("test_id", testId)
    .single()

  if (testError || !testRecord) {
    throw new Error("Test not found")
  }

  const questionIds = testRecord.configuration.question_ids || []
  
  const { data: questions } = await supabase
    .from("canonical_questions")
    .select("question_id, answer")
    .in("question_id", questionIds)

  if (!questions) throw new Error("Could not fetch questions")

  // Create a map of correct answers
  const correctAnswers = Object.fromEntries(questions.map(q => [q.question_id, q.answer]))

  // 2. Calculate Score
  let correctCount = 0
  let incorrectCount = 0
  let totalAttempted = 0

  const attemptRecords = []
  
  for (const qId of questionIds) {
    const userAnswer = answers[qId]
    if (userAnswer) {
      totalAttempted++
      const isCorrect = userAnswer.option === correctAnswers[qId]
      
      if (isCorrect) correctCount++
      else incorrectCount++

      attemptRecords.push({
        user_id: MOCK_USER_ID,
        question_id: qId,
        test_id: testId,
        selected_option: userAnswer.option,
        is_correct: isCorrect,
        confidence: userAnswer.confidence ? userAnswer.confidence.toLowerCase().replace(" ", "_") : null,
      })
    }
  }

  // Scoring: +2 for correct, -1/3 of assigned marks (2/3) for incorrect
  const rawScore = (correctCount * 2) - (incorrectCount * (2 / 3))
  const score = Math.round(rawScore * 100) / 100 // Round to 2 decimal places
  const accuracy = totalAttempted > 0 ? Math.round((correctCount / totalAttempted) * 100) : 0

  // 3. Update user_tests
  await supabase
    .from("user_tests")
    .update({
      score,
      accuracy,
      completed_at: new Date().toISOString()
    })
    .eq("test_id", testId)

  // 4. Insert into user_attempts
  if (attemptRecords.length > 0) {
    await supabase.from("user_attempts").insert(attemptRecords)
  }

  // 5. Update user_question_states using a stored procedure or just individual updates
  // Since individual updates are slow, and we don't have a stored proc, we'll fetch existing states, modify in memory, and upsert.
  const { data: existingStates } = await supabase
    .from("user_question_states")
    .select("*")
    .eq("user_id", MOCK_USER_ID)
    .in("question_id", attemptRecords.map(a => a.question_id))

  const existingStatesMap = Object.fromEntries((existingStates || []).map(s => [s.question_id, s]))
  
  const stateUpdates = attemptRecords.map(attempt => {
    const ex = existingStatesMap[attempt.question_id] || {
      attempt_count: 0,
      correct_count: 0,
      wrong_count: 0,
      confident_count: 0,
      conflicted_count: 0,
      blind_guess_count: 0,
    }

    const confField = attempt.confidence ? `${attempt.confidence}_count` : null

    return {
      user_id: MOCK_USER_ID,
      question_id: attempt.question_id,
      attempt_count: ex.attempt_count + 1,
      correct_count: ex.correct_count + (attempt.is_correct ? 1 : 0),
      wrong_count: ex.wrong_count + (attempt.is_correct ? 0 : 1),
      confident_count: ex.confident_count + (confField === 'confident_count' ? 1 : 0),
      conflicted_count: ex.conflicted_count + (confField === 'conflicted_count' ? 1 : 0),
      blind_guess_count: ex.blind_guess_count + (confField === 'blind_guess_count' ? 1 : 0),
      last_confidence: attempt.confidence,
      last_attempted_at: new Date().toISOString(),
      last_wrong_at: attempt.is_correct ? ex.last_wrong_at : new Date().toISOString(),
    }
  })

  if (stateUpdates.length > 0) {
    await supabase
      .from("user_question_states")
      .upsert(stateUpdates, { onConflict: 'user_id,question_id' })
  }

  return { testId, score, accuracy, totalAttempted }
}

"use server"

import { supabase } from "@/lib/supabase"

// Mock user ID for MVP
const MOCK_USER_ID = "00000000-0000-0000-0000-000000000000"

export async function checkAvailability(params: {
  mode: string;
  year?: string;
  subject?: string;
  topic?: string;
}) {
  let query = supabase.from("canonical_questions").select("question_id", { count: "exact" })

  if (params.year && params.year !== "all" && params.year !== "mixed" && params.year !== "recent") {
    query = query.eq("year", parseInt(params.year))
  } else if (params.year === "recent") {
    query = query.gte("year", new Date().getFullYear() - 10)
  }

  if (params.subject && params.subject !== "all") {
    query = query.eq("subject", params.subject)
  }

  if (params.topic && params.topic !== "all") {
    query = query.eq("topic_tag", params.topic)
  }

  const { count, error } = await query
  if (error) {
    console.error("checkAvailability error:", error.message)
    return 0
  }
  return count || 0
}

export async function generateTest(params: {
  mode: string;
  year?: string;
  subject?: string;
  topic?: string;
  count: number;
  timerEnabled?: boolean;
}) {
  // 1. Fetch eligible questions
  let query = supabase.from("canonical_questions").select("question_id")

  if (params.year && params.year !== "all" && params.year !== "mixed" && params.year !== "recent") {
    query = query.eq("year", parseInt(params.year))
  } else if (params.year === "recent") {
    query = query.gte("year", new Date().getFullYear() - 10)
  }

  if (params.subject && params.subject !== "all") {
    query = query.eq("subject", params.subject)
  }

  if (params.topic && params.topic !== "all") {
    query = query.eq("topic_tag", params.topic)
  }

  const { data: questions, error } = await query
  if (error) return { success: false, error: error.message }

  if (!questions || questions.length === 0) {
    return { success: false, error: "No questions available for the selected filters." }
  }

  // Shuffle and limit
  const shuffled = questions.sort(() => 0.5 - Math.random())
  const selected = shuffled.slice(0, Math.min(params.count, questions.length))
  const selectedIds = selected.map(q => q.question_id)

  // 2. Create test record
  const { data: testRecord, error: testError } = await supabase
    .from("user_tests")
    .insert({
      user_id: MOCK_USER_ID,
      test_type: params.mode,
      configuration: {
        ...params,
        question_ids: selectedIds
      }
    })
    .select("test_id")
    .single()

  if (testError) return { success: false, error: testError.message }

  return { success: true, testId: testRecord.test_id }
}

export async function getMetadata() {
  const { data } = await supabase.from("canonical_questions").select("subject, topic_tag, year")

  const subjects = new Set<string>()
  const topics = new Set<string>()
  const years = new Set<string>()
  const topicsBySubject: Record<string, Set<string>> = {}

  if (data) {
    for (const row of data) {
      if (row.subject) subjects.add(row.subject)
      if (row.topic_tag) topics.add(row.topic_tag)
      if (row.year) years.add(row.year.toString())
      
      if (row.subject && row.topic_tag) {
        if (!topicsBySubject[row.subject]) topicsBySubject[row.subject] = new Set()
        topicsBySubject[row.subject].add(row.topic_tag)
      }
    }
  }

  const topicsBySubjectArray: Record<string, string[]> = {}
  for (const [subj, tops] of Object.entries(topicsBySubject)) {
    topicsBySubjectArray[subj] = Array.from(tops)
  }

  return {
    subjects: Array.from(subjects),
    topics: Array.from(topics),
    years: Array.from(years).sort((a, b) => Number(b) - Number(a)),
    topicsBySubject: topicsBySubjectArray
  }
}

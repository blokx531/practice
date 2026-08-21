"use server"

import { supabase } from "@/lib/supabase"

const MOCK_USER_ID = "00000000-0000-0000-0000-000000000000"

export async function toggleBookmark(questionId: string, setBookmarked: boolean) {
  const { error } = await supabase
    .from("user_question_states")
    .upsert(
      { 
        user_id: MOCK_USER_ID, 
        question_id: questionId, 
        is_bookmarked: setBookmarked,
        latest_bookmark_date: setBookmarked ? new Date().toISOString() : null
      },
      { onConflict: 'user_id,question_id' }
    )

  if (error) {
    console.error("Bookmark Error:", error)
    throw new Error(error.message)
  }
}

export async function getUserBookmarks() {
  const { data, error } = await supabase
    .from("user_question_states")
    .select("question_id, is_bookmarked")
    .eq("user_id", MOCK_USER_ID)
    .eq("is_bookmarked", true)

  if (error) throw new Error(error.message)
  
  return data.map(d => d.question_id)
}

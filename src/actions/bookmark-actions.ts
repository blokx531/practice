"use server"

import { supabase } from "@/lib/supabase"
import { getUserId } from "@/utils/supabase/server"


export async function toggleBookmark(questionId: string, setBookmarked: boolean) {
  const { error } = await supabase
    .from("user_question_states")
    .upsert(
      { 
        user_id: (await getUserId()), 
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
    .eq("user_id", (await getUserId()))
    .eq("is_bookmarked", true)

  if (error) throw new Error(error.message)
  
  return data.map(d => d.question_id)
}

"use server"

import { supabase } from "@/lib/supabase"

const MOCK_USER_ID = "00000000-0000-0000-0000-000000000000"

export async function clearUserData() {
  // Clear bookmarks
  await supabase.from("user_bookmarks").delete().eq("user_id", MOCK_USER_ID)
  
  // Clear states (Mistakes)
  await supabase.from("user_question_states").delete().eq("user_id", MOCK_USER_ID)
  
  // Clear attempts
  await supabase.from("user_attempts").delete().eq("user_id", MOCK_USER_ID)
  
  // Clear tests
  await supabase.from("user_tests").delete().eq("user_id", MOCK_USER_ID)
}

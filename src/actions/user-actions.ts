"use server"

import { supabase } from "@/lib/supabase"
import { getUserId } from "@/utils/supabase/server"


export async function clearUserData() {
  // Clear bookmarks
  await supabase.from("user_bookmarks").delete().eq("user_id", (await getUserId()))
  
  // Clear states (Mistakes)
  await supabase.from("user_question_states").delete().eq("user_id", (await getUserId()))
  
  // Clear attempts
  await supabase.from("user_attempts").delete().eq("user_id", (await getUserId()))
  
  // Clear tests
  await supabase.from("user_tests").delete().eq("user_id", (await getUserId()))
}

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const MOCK_USER_ID = "00000000-0000-0000-0000-000000000000";

async function run() {
  const { data: tests, error: err1 } = await supabase.from("user_tests").select("*").eq("user_id", MOCK_USER_ID).order("started_at", { ascending: false });
  const { data: attempts, error: err2 } = await supabase.from("user_attempts").select("is_correct, confidence, canonical_questions(subject, topic_tag)").eq("user_id", MOCK_USER_ID);
  
  console.log("Tests:", tests?.length);
  console.log("Attempts:", attempts?.length);
  if (err1) console.error(err1);
  if (err2) console.error(err2);
  
  if (attempts && attempts.length > 0) {
    console.log("Sample attempt:", JSON.stringify(attempts[0], null, 2));
  }
}
run();

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data, error } = await supabase.from('user_attempts').select('is_correct, confidence, canonical_questions(subject, topic_tag)').limit(1);
  console.log('Data:', JSON.stringify(data, null, 2));
  console.log('Error:', error);
}
run();

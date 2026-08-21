const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { error } = await supabase.rpc('run_sql', { sql: 'ALTER TABLE user_question_states ADD COLUMN IF NOT EXISTS consecutive_correct INTEGER DEFAULT 0;' });
  console.log('Error from RPC:', error);
}
run();

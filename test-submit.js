const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const MOCK_USER_ID = "00000000-0000-0000-0000-000000000000";
  // check count of attempts for mock user
  const { count, error } = await supabase.from('user_attempts').select('*', { count: 'exact' }).eq('user_id', MOCK_USER_ID);
  console.log("Attempts count:", count);
  console.log("Error:", error);
}
run();

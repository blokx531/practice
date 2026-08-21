const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://odjctiaelhagzqyiphhw.supabase.co';
const supabaseKey = 'sb_secret_jdi0lfN7hSIWCW8Kc1Peow_Gh1ZVpY3';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('canonical_questions').select('count', { count: 'exact' });
  console.log(error || data);
}
test();

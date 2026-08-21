const fs = require('fs');
const path = require('path');

const files = [
  'src/actions/user-actions.ts',
  'src/actions/analytics-actions.ts',
  'src/actions/submit-actions.ts',
  'src/actions/test-actions.ts',
  'src/actions/bookmark-actions.ts',
  'src/app/mistakes/page.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace import
  content = content.replace(
    'import { supabase } from "@/lib/supabase"',
    `import { getSupabase, getUserId } from "@/lib/supabase"`
  );
  
  // Remove MOCK_USER_ID
  content = content.replace(/const MOCK_USER_ID = "[^"]+"\n?/g, '');
  
  // Replace MOCK_USER_ID usages with (await getUserId())
  content = content.replace(/MOCK_USER_ID/g, '(await getUserId())');
  
  // Replace supabase.from with (await getSupabase()).from
  // We have to be careful not to replace it if it's already awaited? 
  // supabase is an object, so supabase.from -> (await getSupabase()).from
  content = content.replace(/supabase\.from/g, '(await getSupabase()).from');
  content = content.replace(/supabase\.rpc/g, '(await getSupabase()).rpc');
  
  fs.writeFileSync(file, content);
}
console.log("Rewrote files!");

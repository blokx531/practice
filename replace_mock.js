const fs = require('fs');

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
  
  // Remove the const MOCK_USER_ID line
  content = content.replace(/const MOCK_USER_ID = "00000000-0000-0000-0000-000000000000"\n?/g, '');
  
  // Add import for getUserId
  content = content.replace(
    'import { supabase } from "@/lib/supabase"',
    'import { supabase } from "@/lib/supabase"\nimport { getUserId } from "@/utils/supabase/server"'
  );
  
  // Replace MOCK_USER_ID with (await getUserId())
  content = content.replace(/MOCK_USER_ID/g, '(await getUserId())');
  
  fs.writeFileSync(file, content);
}
console.log("Replaced MOCK_USER_ID!");

// Fix submitTest to use a single userId variable to avoid await inside map
let submitCode = fs.readFileSync('src/actions/submit-actions.ts', 'utf8');
submitCode = submitCode.replace(/export async function submitTest\(testId: string\) \{/, 'export async function submitTest(testId: string) {\n  const userId = await getUserId();');
submitCode = submitCode.replace(/\(await getUserId\(\)\)/g, 'userId');
// Wait, for other functions in submit-actions.ts (like getMistakes), they also used `(await getUserId())` which is fine.
// But we just replaced ALL `(await getUserId())` with `userId`! That will break them!
// Let's restore submit-actions.ts and do it specifically.

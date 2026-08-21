const fs = require('fs');

// 1. Fix submit-actions.ts
let submitCode = fs.readFileSync('src/actions/submit-actions.ts', 'utf8');
submitCode = submitCode.replace(/export async function submitTest\(testId: string\) \{/, 'export async function submitTest(testId: string) {\n  const userId = await getUserId();');
submitCode = submitCode.replace(/\(await getUserId\(\)\)/g, 'userId');
fs.writeFileSync('src/actions/submit-actions.ts', submitCode);

// 2. Fix page imports
const pageFiles = [
  'src/app/bookmarks/page.tsx',
  'src/app/explore/page.tsx',
  'src/app/test/[id]/page.tsx',
  'src/app/test/[id]/results/page.tsx'
];

for (const file of pageFiles) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    'import { supabase } from "@/lib/supabase"',
    'import { getSupabase } from "@/lib/supabase"'
  );
  content = content.replace(/supabase\.from/g, '(await getSupabase()).from');
  content = content.replace(/supabase\.rpc/g, '(await getSupabase()).rpc');
  fs.writeFileSync(file, content);
}
console.log("Fixed!");

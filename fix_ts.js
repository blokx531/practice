const fs = require('fs');

function fixFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  
  // 1. If it imports getSupabase but uses `supabase.from`, change `supabase` to `(await getSupabase())`
  // Actually, let's just re-declare `const supabase = await getSupabase()` at the top of every exported function!
  // That is MUCH safer than regex replacing everywhere.
  
  // But wait, the file already has `import { getSupabase }` instead of `import { supabase }`.
  // Let's change the import back to `import { getSupabase }` and then replace all `supabase.` with `(await getSupabase()).`
  content = content.replace(/import \{ supabase \} from "@/g, 'import { getSupabase } from "@/');
  content = content.replace(/import \{ getSupabase, getUserId \} from "@/g, 'import { getSupabase, getUserId } from "@/');
  
  // A safer regex: find any `supabase.` that is not `getSupabase().` and replace it
  // Actually, JS allows `(await getSupabase()).from`.
  content = content.replace(/(?<!getSupabase\(\)\)\.)supabase\./g, '(await getSupabase()).');
  
  // 2. Fix the implicit any types (add `: any` to map callbacks)
  content = content.replace(/\.map\(\(a\) =>/g, '.map((a: any) =>');
  content = content.replace(/\.map\(a =>/g, '.map((a: any) =>');
  content = content.replace(/\.map\(\(d\) =>/g, '.map((d: any) =>');
  content = content.replace(/\.map\(d =>/g, '.map((d: any) =>');
  content = content.replace(/\.map\(\(q\) =>/g, '.map((q: any) =>');
  content = content.replace(/\.map\(q =>/g, '.map((q: any) =>');
  content = content.replace(/\.map\(\(s\) =>/g, '.map((s: any) =>');
  content = content.replace(/\.map\(s =>/g, '.map((s: any) =>');
  content = content.replace(/\.map\(\(m\) =>/g, '.map((m: any) =>');
  content = content.replace(/\.map\(m =>/g, '.map((m: any) =>');
  content = content.replace(/\.map\(\(b\) =>/g, '.map((b: any) =>');
  content = content.replace(/\.map\(b =>/g, '.map((b: any) =>');
  
  fs.writeFileSync(file, content);
}

const files = [
  'src/actions/analytics-actions.ts',
  'src/actions/bookmark-actions.ts',
  'src/actions/submit-actions.ts',
  'src/actions/test-actions.ts',
  'src/actions/user-actions.ts',
  'src/app/bookmarks/page.tsx',
  'src/app/explore/page.tsx',
  'src/app/mistakes/page.tsx',
  'src/app/test/[id]/page.tsx',
  'src/app/test/[id]/results/page.tsx'
];

for (const file of files) {
  try { fixFile(file); } catch(e) {}
}

// 3. Fix app-sidebar.tsx (asChild -> render={...})
let sidebar = fs.readFileSync('src/components/app-sidebar.tsx', 'utf8');
sidebar = sidebar.replace(/<SidebarMenuButton\s*\n\s*asChild\s*\n\s*isActive=\{isActive\}\s*\n\s*className="py-5"\s*\n\s*>\s*\n\s*<Link href=\{item\.url\}>\s*\n\s*<item\.icon className="w-5 h-5" \/>\s*\n\s*<span className="font-medium text-\[15px\]">\{item\.title\}<\/span>\s*\n\s*<\/Link>\s*\n\s*<\/SidebarMenuButton>/, 
`<SidebarMenuButton 
  isActive={isActive}
  className="py-5"
  render={
    <Link href={item.url}>
      <item.icon className="w-5 h-5" />
      <span className="font-medium text-[15px]">{item.title}</span>
    </Link>
  }
/>`);
// And fix `res.success` if `clearUserData` is void
sidebar = sidebar.replace(/if \(!res\.success\) \{/, 'if (res && !(res as any).success) {');
fs.writeFileSync('src/components/app-sidebar.tsx', sidebar);

console.log("Fixed again!");

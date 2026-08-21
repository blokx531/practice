const fs = require('fs');

// Fix actions.ts
let actions = fs.readFileSync('src/app/login/actions.ts', 'utf8');
actions = actions.replace(/import \{ redirect \} from 'next\/navigation'/g, '');
actions = actions.replace(/redirect\('\/'\)/g, 'return { success: true }');
fs.writeFileSync('src/app/login/actions.ts', actions);

// Fix page.tsx
let page = fs.readFileSync('src/app/login/page.tsx', 'utf8');
page = page.replace('import { useState } from "react"', 'import { useState } from "react"\nimport { useRouter } from "next/navigation"');
page = page.replace('export default function LoginPage() {', 'export default function LoginPage() {\n  const router = useRouter()');
page = page.replace(/if \(result\?\.error\) \{\n\s*setError\(result\.error\)\n\s*\}/, `if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        router.push('/')
      }`);
// Also ignore NEXT_REDIRECT just in case
page = page.replace(/} catch \(e: any\) {/, `} catch (e: any) {
      if (e.message === 'NEXT_REDIRECT') throw e;`);
fs.writeFileSync('src/app/login/page.tsx', page);
console.log("Fixed redirect!");

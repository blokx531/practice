const fs = require('fs');

let submitCode = fs.readFileSync('src/actions/submit-actions.ts', 'utf8');

submitCode = submitCode.replace(/export async function submitTest\(testId: string\) \{/, 'export async function submitTest(testId: string) {\n  const userId = await getUserId();');

// Only inside submitTest, replace (await getUserId()) with userId
// Actually, it's safer to just do a string replace on the exact lines!
submitCode = submitCode.replace(/user_id: \(await getUserId\(\)\),/g, 'user_id: userId,');
submitCode = submitCode.replace(/\.eq\("user_id", \(await getUserId\(\)\)\)/g, '.eq("user_id", userId)');

fs.writeFileSync('src/actions/submit-actions.ts', submitCode);

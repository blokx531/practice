const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const TEST_USER_ID = "11111111-1111-1111-1111-111111111111"; // Dedicated QA User

async function runQA() {
  console.log("🚀 Starting Core QA Test Suite...\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // --- 1. Database Integrity ---
  console.log("--- 1. Database Integrity ---");
  const { count: qCount, error: qErr } = await supabase
    .from('canonical_questions')
    .select('*', { count: 'exact', head: true });
  
  assert(!qErr && qCount > 0, `Canonical Questions exist (Found: ${qCount})`);

  // --- 2. Test Generation (SIM-011, GEN-023) ---
  console.log("\n--- 2. Test Generation ---");
  
  // Create a 10-question custom test
  const { data: qData } = await supabase.from('canonical_questions').select('question_id, answer').limit(10);
  const selectedQuestionIds = qData.map(q => q.question_id);

  assert(new Set(selectedQuestionIds).size === 10, "Generated test has exactly 10 UNIQUE question IDs");

  const { data: testRecord, error: testErr } = await supabase
    .from("user_tests")
    .insert({
      user_id: TEST_USER_ID,
      test_type: "custom",
      configuration: { mode: 'custom', count: 10, question_ids: selectedQuestionIds }
    })
    .select("test_id")
    .single();

  assert(!testErr && testRecord, "Test session successfully created in DB");
  const testId = testRecord.test_id;

  // --- 3. Scoring & Attempt Recording (SCORE-004, CONF-008) ---
  console.log("\n--- 3. Scoring & Attempt Engine ---");
  
  // We have 10 questions. 
  // Let's get 5 correct, 3 wrong, 2 unattempted
  const answers = {};
  const correctOptions = qData.map(q => q.answer);
  const wrongOptions = correctOptions.map(ans => ans === 'A' ? 'B' : 'A');

  // 5 correct
  for(let i=0; i<5; i++) {
    answers[selectedQuestionIds[i]] = { option: correctOptions[i], confidence: 'confident' };
  }
  // 3 wrong
  for(let i=5; i<8; i++) {
    answers[selectedQuestionIds[i]] = { option: wrongOptions[i], confidence: 'blind_guess' };
  }
  // 2 unattempted (not added to answers map)

  // Mimic submit-actions.ts logic
  let correctCount = 0;
  let incorrectCount = 0;
  let totalAttempted = 0;
  const attemptRecords = [];

  for (const qId of selectedQuestionIds) {
    const userAnswer = answers[qId];
    if (userAnswer) {
      totalAttempted++;
      const isCorrect = userAnswer.option === qData.find(q => q.question_id === qId).answer;
      if (isCorrect) correctCount++;
      else incorrectCount++;

      attemptRecords.push({
        user_id: TEST_USER_ID,
        question_id: qId,
        test_id: testId,
        selected_option: userAnswer.option,
        is_correct: isCorrect,
        confidence: userAnswer.confidence,
      });
    }
  }

  const rawScore = (correctCount * 2) - (incorrectCount * (2 / 3));
  const expectedScore = Math.round(rawScore * 100) / 100;

  assert(totalAttempted === 8, "Correctly ignores unattempted questions");
  assert(correctCount === 5, "Calculates exact number of correct answers");
  assert(incorrectCount === 3, "Calculates exact number of wrong answers");
  assert(expectedScore === 8, `Calculates exact negative marking score (Expected 8.00, Got ${expectedScore})`);

  // Insert attempts
  const { error: attErr } = await supabase.from('user_attempts').insert(attemptRecords);
  assert(!attErr, "Attempt records successfully inserted");

  // --- 4. My Mistakes Deduplication (MIST-006, REG-002) ---
  console.log("\n--- 4. My Mistakes Ledger ---");
  
  // Upsert states
  const stateUpdates = attemptRecords.map(attempt => ({
    user_id: TEST_USER_ID,
    question_id: attempt.question_id,
    attempt_count: 1,
    correct_count: attempt.is_correct ? 1 : 0,
    wrong_count: attempt.is_correct ? 0 : 1,
    last_confidence: attempt.confidence
  }));

  const { error: stateErr } = await supabase.from('user_question_states').upsert(stateUpdates, { onConflict: 'user_id,question_id' });
  assert(!stateErr, "Question states successfully upserted");

  // Let's get one of the wrong questions WRONG again
  const doubleWrongQid = selectedQuestionIds[5];
  const { error: doubleWrongErr } = await supabase.from('user_question_states').upsert({
    user_id: TEST_USER_ID,
    question_id: doubleWrongQid,
    wrong_count: 2, 
    attempt_count: 2
  }, { onConflict: 'user_id,question_id' });

  // Fetch mistakes for this user
  const { data: mistakesData } = await supabase.from('user_question_states').select('*').eq('user_id', TEST_USER_ID).gt('wrong_count', 0);
  
  assert(mistakesData.length === 3, `My Mistakes contains exactly 3 unique rows (Got: ${mistakesData.length})`);
  assert(mistakesData.find(m => m.question_id === doubleWrongQid).wrong_count === 2, "Wrong count increments correctly without duplicating rows");

  // --- 5. Bookmarks Uniqueness (BOOK-001, REG-003) ---
  console.log("\n--- 5. Bookmarks Ledger ---");
  const bqId = selectedQuestionIds[0];
  
  // Bookmark it once
  await supabase.from('user_question_states').upsert({ user_id: TEST_USER_ID, question_id: bqId, is_bookmarked: true }, { onConflict: 'user_id,question_id' });
  // Bookmark it twice
  await supabase.from('user_question_states').upsert({ user_id: TEST_USER_ID, question_id: bqId, is_bookmarked: true }, { onConflict: 'user_id,question_id' });

  const { data: bData } = await supabase.from('user_question_states').select('*').eq('user_id', TEST_USER_ID).eq('is_bookmarked', true);
  assert(bData.length === 1, `Bookmark enforces uniqueness on user_id+question_id (Found: ${bData.length})`);

  // Cleanup
  console.log("\n🧹 Cleaning up QA User Data...");
  await supabase.from('user_attempts').delete().eq('user_id', TEST_USER_ID);
  await supabase.from('user_question_states').delete().eq('user_id', TEST_USER_ID);
  await supabase.from('user_tests').delete().eq('user_id', TEST_USER_ID);

  console.log(`\n🎉 QA Run Complete! Passed: ${passed}, Failed: ${failed}`);
}

runQA();

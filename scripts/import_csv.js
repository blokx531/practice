const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Need service role key for bypassing RLS during import

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function importData() {
  const results = [];
  const filePath = path.resolve(__dirname, '../data/questions.csv');

  console.log('Reading CSV file from:', filePath);
  
  // To keep track of sequential numbers for each year
  const yearCounts = {};

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => {
      // Clean up keys
      const row = {};
      for (const key in data) {
        row[key.trim()] = data[key].trim();
      }
      
      const year = parseInt(row['year'], 10);
      if (!year) return; // Skip invalid rows

      // Generate question_id
      if (!yearCounts[year]) yearCounts[year] = 0;
      yearCounts[year]++;
      const sequenceStr = yearCounts[year].toString().padStart(3, '0');
      const question_id = `CSE_GS1_${year}_Q${sequenceStr}`;

      // Process options
      let optionsArray = [];
      if (row['options']) {
        optionsArray = row['options'].split('\n').map(o => o.trim()).filter(o => o);
      }

      results.push({
        question_id: question_id,
        question: row['question'],
        options: JSON.stringify(optionsArray),
        answer: row['answer'],
        subject: row['subject'],
        topic_tag: row['topic tag'] || row['topic_tag'] || row['topic'],
        year: year
      });
    })
    .on('end', async () => {
      console.log(`Parsed ${results.length} questions. Starting import to Supabase...`);
      
      let successCount = 0;
      let errorCount = 0;
      const BATCH_SIZE = 100;

      for (let i = 0; i < results.length; i += BATCH_SIZE) {
        const batch = results.slice(i, i + BATCH_SIZE);
        const { error } = await supabase
          .from('canonical_questions')
          .upsert(batch, { onConflict: 'question_id' });

        if (error) {
          console.error(`Error inserting batch ${i}:`, error.message);
          errorCount += batch.length;
        } else {
          successCount += batch.length;
        }
        console.log(`Processed ${i + batch.length} / ${results.length}`);
      }

      console.log(`Import complete! Success: ${successCount}, Errors: ${errorCount}`);
    });
}

importData();

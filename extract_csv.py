import json
import sys

transcript_path = '/Users/nitinsangwan/.gemini/antigravity/brain/637cc45d-4bc0-49db-b06a-9d87757aeb5c/.system_generated/logs/transcript_full.jsonl'
with open(transcript_path, 'r') as f:
    lines = f.readlines()

for line in reversed(lines):
    data = json.loads(line)
    if data.get('type') == 'USER_INPUT' and 'question,options,answer' in data.get('content', ''):
        content = data['content']
        start_idx = content.find('question,options,answer')
        end_idx = content.rfind('Error: Your previous response was cut off')
        if end_idx == -1:
            end_idx = len(content)
        csv_data = content[start_idx:end_idx].strip()
        
        import os
        os.makedirs('/Users/nitinsangwan/.gemini/antigravity/scratch/upsc-pyq-app/data', exist_ok=True)
        with open('/Users/nitinsangwan/.gemini/antigravity/scratch/upsc-pyq-app/data/raw_questions.csv', 'w') as out:
            out.write(csv_data)
        print("CSV extracted successfully.")
        sys.exit(0)
print("CSV not found in transcript.")
sys.exit(1)

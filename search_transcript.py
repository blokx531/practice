import json
import sys
transcript_path = '/Users/nitinsangwan/.gemini/antigravity/brain/637cc45d-4bc0-49db-b06a-9d87757aeb5c/.system_generated/logs/transcript_full.jsonl'
with open(transcript_path, 'r') as f:
    for i, line in enumerate(f):
        data = json.loads(line)
        content = data.get('content', '')
        if 'question,options,answer' in content:
            print(f"Found in step {data.get('step_index')}, type: {data.get('type')}")
            # Write to raw_questions.csv
            start_idx = content.find('question,options,answer')
            end_idx = content.rfind('Error: Your previous response was cut off')
            if end_idx == -1:
                end_idx = len(content)
            csv_data = content[start_idx:end_idx].strip()
            
            with open('/Users/nitinsangwan/.gemini/antigravity/scratch/upsc-pyq-app/data/raw_questions.csv', 'w') as out:
                out.write(csv_data)
            print("CSV written.")
            sys.exit(0)
print("Not found.")

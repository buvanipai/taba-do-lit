const API_URL = 'https://taba-claude-proxy.taba-proxy.workers.dev';

async function callClaude(messages, temperature = 0.2) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      temperature,
      messages,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Claude error ${response.status}: ${err?.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text || '';
  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

export async function prioritizeTodos(todos) {
  const todoList = todos
    .map((t, i) => `${i + 1}. "${t.text}" | priority: ${t.priority} | estimated: ${t.timeEstimate || 'unknown'} | due: ${t.dueDate || 'none'}`)
    .join('\n');

  const prompt = `You are a productivity assistant. Given this to-do list, return a JSON array of the same items reordered by what the user should tackle first. Consider urgency (due dates), priority level, and time required.

To-do list:
${todoList}

Return ONLY valid JSON — an array of objects with fields: { originalIndex: number, reason: string }
Indexes are 1-based matching the list above.
Example: [{"originalIndex": 2, "reason": "Due soon and high priority"}, ...]
No markdown, no explanation outside the JSON.`;

  return callClaude([{ role: 'user', content: prompt }], 0.2);
}

export async function extractTasksFromImage(imageBlob) {
  const base64 = await blobToBase64(imageBlob);
  const mediaType = 'image/jpeg';

  const messages = [{
    role: 'user',
    content: [
      {
        type: 'image',
        source: { type: 'base64', media_type: mediaType, data: base64 },
      },
      {
        type: 'text',
        text: `This is a photo of a handwritten to-do list. Extract every task you can read. Ignore numbering, checkmarks, crossed-out items, and background noise.

Return ONLY a valid JSON array of objects: { text: string, priority: "high"|"medium"|"low", timeEstimate: string|null }

No markdown. JSON only.`,
      },
    ],
  }];

  return callClaude(messages, 0.1);
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

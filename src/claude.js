const API_URL = 'https://taba-claude-proxy.taba-proxy.workers.dev';

async function callClaude(prompt, temperature = 0.2) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      temperature,
      messages: [{ role: 'user', content: prompt }],
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

  return callClaude(prompt, 0.2);
}

export async function extractTasksFromText(rawText) {
  const prompt = `Extract to-do items from this scanned/OCR text. The text may have OCR errors — clean them up using context. Each numbered or bulleted item is a task. Ignore background text, page numbers, or noise.

Return ONLY a valid JSON array of objects with { text: string, priority: "high"|"medium"|"low", timeEstimate: string|null }.

Scanned text:
${rawText}

No markdown. JSON only. If no tasks found, return [].`;

  try {
    const result = await callClaude(prompt, 0.1);
    if (Array.isArray(result) && result.length > 0) return result;
  } catch (e) {
    console.warn('Claude extraction failed, falling back to line split:', e.message);
  }

  // Fallback: split by lines, strip numbering
  return rawText
    .split('\n')
    .map(l => l.replace(/^\s*\d+[\.\)]\s*/, '').trim())
    .filter(l => l.length > 2)
    .map(text => ({ text, priority: 'medium', timeEstimate: null }));
}

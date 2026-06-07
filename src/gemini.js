const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function prioritizeTodos(todos) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key') {
    throw new Error('Gemini API key not configured');
  }

  const todoList = todos
    .map((t, i) => `${i + 1}. "${t.text}" | priority: ${t.priority} | estimated: ${t.timeEstimate || 'unknown'} | due: ${t.dueDate || 'none'}`)
    .join('\n');

  const prompt = `You are a productivity assistant. Given this to-do list, return a JSON array of the same items reordered by what the user should tackle first. Consider urgency (due dates), priority level, and time required.

To-do list:
${todoList}

Return ONLY valid JSON — an array of objects with fields: { originalIndex: number, reason: string }
Example: [{"originalIndex": 2, "reason": "Due soon and high priority"}, ...]
No markdown, no explanation outside the JSON.`;

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 1024 },
    }),
  });

  if (!response.ok) throw new Error(`Gemini error: ${response.status}`);

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

export async function extractTasksFromText(rawText) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key') {
    return rawText.split('\n').filter(l => l.trim()).map(l => ({ text: l.trim() }));
  }

  const prompt = `Extract to-do items from this scanned text. Return ONLY valid JSON array of objects with { text: string, priority: "high"|"medium"|"low", timeEstimate: string|null }.

Scanned text:
${rawText}

No markdown. JSON only.`;

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 1024 },
    }),
  });

  if (!response.ok) throw new Error(`Gemini error: ${response.status}`);

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

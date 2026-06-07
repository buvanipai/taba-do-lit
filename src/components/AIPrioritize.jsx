import { useState } from 'react';
import { prioritizeTodos } from '../gemini';

export default function AIPrioritize({ todos, onReorder }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastReason, setLastReason] = useState(null);

  async function handlePrioritize() {
    const active = todos.filter(t => !t.completed);
    if (active.length < 2) return;
    setLoading(true);
    setError(null);
    try {
      const order = await prioritizeTodos(active);
      const reordered = order.map(o => active[o.originalIndex - 1]).filter(Boolean);
      const done = todos.filter(t => t.completed);
      setLastReason(order[0]?.reason || null);
      await onReorder([...reordered, ...done]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ai-prioritize">
      <button
        className="btn-ai"
        onClick={handlePrioritize}
        disabled={loading || todos.filter(t => !t.completed).length < 2}
        title="AI auto-sort by priority & time"
      >
        {loading ? '⏳' : '✨'} {loading ? 'Sorting...' : 'AI Sort'}
      </button>
      {lastReason && !error && (
        <span className="ai-reason" title={lastReason}>ⓘ</span>
      )}
      {error && <span className="ai-error" title={error}>⚠️ {error}</span>}
    </div>
  );
}

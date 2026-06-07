import { useState } from 'react';

export default function TodoForm({ onAdd }) {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState('medium');
  const [timeEstimate, setTimeEstimate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [expanded, setExpanded] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd({ text: text.trim(), priority, timeEstimate: timeEstimate || null, dueDate: dueDate || null });
    setText('');
    setTimeEstimate('');
    setDueDate('');
    setExpanded(false);
  }

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <div className="todo-form-row">
        <input
          className="todo-input"
          type="text"
          placeholder="Add a to-do..."
          value={text}
          onChange={e => setText(e.target.value)}
          onFocus={() => setExpanded(true)}
        />
        <button type="submit" className="btn-add">+</button>
      </div>

      {expanded && (
        <div className="todo-form-extra">
          <div className="priority-group">
            {['low', 'medium', 'high'].map(p => (
              <button
                key={p}
                type="button"
                className={`priority-btn priority-${p} ${priority === p ? 'selected' : ''}`}
                onClick={() => setPriority(p)}
              >
                {p}
              </button>
            ))}
          </div>
          <input
            className="todo-input-small"
            type="text"
            placeholder="Time estimate (e.g. 30min, 2h)"
            value={timeEstimate}
            onChange={e => setTimeEstimate(e.target.value)}
          />
          <input
            className="todo-input-small"
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
          />
        </div>
      )}
    </form>
  );
}

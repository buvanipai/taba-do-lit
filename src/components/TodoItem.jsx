import { useState } from 'react';

const PRIORITIES = ['low', 'medium', 'high'];

export default function TodoItem({ todo, onUpdate, onDelete, onDragStart, onDragEnter, onDragEnd, isDragging }) {
  const [expanded, setExpanded] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [editPriority, setEditPriority] = useState(todo.priority);
  const [editTime, setEditTime] = useState(todo.timeEstimate || '');
  const [editDue, setEditDue] = useState(todo.dueDate || '');
  const [editNotes, setEditNotes] = useState(todo.notes || '');
  const [newStep, setNewStep] = useState('');

  const steps = todo.steps || [];

  function saveAll() {
    onUpdate({
      text: editText.trim() || todo.text,
      priority: editPriority,
      timeEstimate: editTime || null,
      dueDate: editDue || null,
      notes: editNotes || null,
    });
  }

  function handleTextKeyDown(e) {
    if (e.key === 'Enter') { saveAll(); setExpanded(false); }
    if (e.key === 'Escape') { setExpanded(false); }
  }

  function addStep(e) {
    e.preventDefault();
    if (!newStep.trim()) return;
    const updated = [...steps, { text: newStep.trim(), done: false }];
    onUpdate({ steps: updated });
    setNewStep('');
  }

  function toggleStep(i) {
    const updated = steps.map((s, idx) => idx === i ? { ...s, done: !s.done } : s);
    onUpdate({ steps: updated });
  }

  function deleteStep(i) {
    onUpdate({ steps: steps.filter((_, idx) => idx !== i) });
  }

  const doneSteps = steps.filter(s => s.done).length;

  return (
    <li
      className={`todo-item priority-border-${editPriority} ${todo.completed ? 'completed' : ''} ${isDragging ? 'dragging' : ''} ${expanded ? 'expanded' : ''}`}
      draggable={!expanded}
      onDragStart={!expanded ? onDragStart : undefined}
      onDragEnter={onDragEnter}
      onDragEnd={onDragEnd}
      onDragOver={e => e.preventDefault()}
    >
      {/* Main row */}
      <span className="drag-handle">⠿</span>

      <input
        type="checkbox"
        className="todo-checkbox"
        checked={todo.completed}
        onChange={() => onUpdate({ completed: !todo.completed })}
      />

      <div className="todo-content">
        {expanded ? (
          <input
            className="todo-edit-input"
            value={editText}
            autoFocus
            onChange={e => setEditText(e.target.value)}
            onKeyDown={handleTextKeyDown}
            onBlur={saveAll}
          />
        ) : (
          <span className="todo-text" onDoubleClick={() => setExpanded(true)}>{todo.text}</span>
        )}

        <div className="todo-meta">
          {todo.timeEstimate && <span className="meta-tag">⏱ {todo.timeEstimate}</span>}
          {todo.dueDate && <span className="meta-tag">📅 {todo.dueDate}</span>}
          <span className={`meta-tag priority-tag ${todo.priority}`}>{todo.priority}</span>
          {steps.length > 0 && (
            <span className="meta-tag">✓ {doneSteps}/{steps.length}</span>
          )}
        </div>
      </div>

      <div className="todo-actions">
        <button className="btn-icon-sm" onClick={() => setExpanded(e => !e)} title="Expand">
          {expanded ? '▲' : '▼'}
        </button>
        <button className="btn-icon-sm" onClick={onDelete} title="Delete">🗑</button>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div className="todo-expand-panel">
          {/* Priority */}
          <div className="expand-row">
            <span className="expand-label">Priority</span>
            <div className="priority-group">
              {PRIORITIES.map(p => (
                <button
                  key={p}
                  type="button"
                  className={`priority-btn priority-${p} ${editPriority === p ? 'selected' : ''}`}
                  onClick={() => { setEditPriority(p); onUpdate({ priority: p }); }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Time + Due */}
          <div className="expand-row">
            <input
              className="todo-input-small"
              placeholder="Time estimate (e.g. 30min)"
              value={editTime}
              onChange={e => setEditTime(e.target.value)}
              onBlur={saveAll}
            />
            <input
              className="todo-input-small"
              type="date"
              value={editDue}
              onChange={e => setEditDue(e.target.value)}
              onBlur={saveAll}
            />
          </div>

          {/* Notes */}
          <textarea
            className="todo-notes"
            placeholder="Notes…"
            value={editNotes}
            onChange={e => setEditNotes(e.target.value)}
            onBlur={saveAll}
            rows={2}
          />

          {/* Steps */}
          <div className="steps-section">
            <span className="expand-label">Steps</span>
            {steps.map((step, i) => (
              <div key={i} className={`step-row ${step.done ? 'step-done' : ''}`}>
                <input type="checkbox" checked={step.done} onChange={() => toggleStep(i)} />
                <span className="step-text">{step.text}</span>
                <button className="btn-icon-sm" onClick={() => deleteStep(i)}>🗑</button>
              </div>
            ))}
            <form onSubmit={addStep} className="step-add-row">
              <input
                className="todo-input-small"
                placeholder="Add step…"
                value={newStep}
                onChange={e => setNewStep(e.target.value)}
              />
              <button type="submit" className="btn-add-step">+</button>
            </form>
          </div>
        </div>
      )}
    </li>
  );
}

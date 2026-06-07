import { useState } from 'react';

export default function TodoItem({ todo, onUpdate, onDelete, onDragStart, onDragEnter, onDragEnd, isDragging }) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  function handleCheck() {
    onUpdate({ completed: !todo.completed });
  }

  function handleEdit() {
    if (!editing) { setEditing(true); return; }
    if (editText.trim()) onUpdate({ text: editText.trim() });
    setEditing(false);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleEdit();
    if (e.key === 'Escape') { setEditing(false); setEditText(todo.text); }
  }

  return (
    <li
      className={`todo-item priority-border-${todo.priority} ${todo.completed ? 'completed' : ''} ${isDragging ? 'dragging' : ''}`}
      draggable
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDragEnd={onDragEnd}
      onDragOver={e => e.preventDefault()}
    >
      <span className="drag-handle">⠿</span>

      <input
        type="checkbox"
        className="todo-checkbox"
        checked={todo.completed}
        onChange={handleCheck}
      />

      <div className="todo-content">
        {editing ? (
          <input
            className="todo-edit-input"
            value={editText}
            autoFocus
            onChange={e => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleEdit}
          />
        ) : (
          <span className="todo-text" onDoubleClick={() => setEditing(true)}>{todo.text}</span>
        )}
        <div className="todo-meta">
          {todo.timeEstimate && <span className="meta-tag">⏱ {todo.timeEstimate}</span>}
          {todo.dueDate && <span className="meta-tag">📅 {todo.dueDate}</span>}
          <span className={`meta-tag priority-tag ${todo.priority}`}>
            {todo.priority}
          </span>
        </div>
      </div>

      <div className="todo-actions">
        <button className="btn-icon-sm" onClick={handleEdit} title="Edit">✏️</button>
        <button className="btn-icon-sm" onClick={onDelete} title="Delete">🗑</button>
      </div>
    </li>
  );
}

import TodoItem from './TodoItem';

const COLUMNS = [
  { id: 'todo',        label: 'To Do',       filter: t => !t.completed && t.status !== 'doing' },
  { id: 'doing',       label: 'Doing',       filter: t => !t.completed && t.status === 'doing' },
  { id: 'done',        label: 'Done',        filter: t => t.completed },
];

export default function KanbanBoard({ todos, onUpdate, onDelete }) {
  function moveToColumn(todo, colId) {
    if (colId === 'done') {
      onUpdate(todo.id, { completed: true, status: 'done' });
    } else {
      onUpdate(todo.id, { completed: false, status: colId });
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDrop(e, colId) {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const todo = todos.find(t => t.id === id);
    if (todo) moveToColumn(todo, colId);
  }

  return (
    <div className="kanban-board">
      {COLUMNS.map(col => {
        const items = todos.filter(col.filter);
        return (
          <div
            key={col.id}
            className="kanban-col"
            onDragOver={handleDragOver}
            onDrop={e => handleDrop(e, col.id)}
          >
            <div className="kanban-col-header">
              <span className="kanban-col-title">{col.label}</span>
              <span className="kanban-col-count">{items.length}</span>
            </div>
            <ul className="kanban-list">
              {items.map(todo => (
                <KanbanCard
                  key={todo.id}
                  todo={todo}
                  onUpdate={fields => onUpdate(todo.id, fields)}
                  onDelete={() => onDelete(todo.id)}
                  onMove={colId => moveToColumn(todo, colId)}
                />
              ))}
              {items.length === 0 && (
                <li className="kanban-empty">Drop here</li>
              )}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function KanbanCard({ todo, onUpdate, onDelete, onMove }) {
  function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', todo.id);
    e.dataTransfer.effectAllowed = 'move';
  }

  const isActive = !todo.completed && todo.status === 'doing';
  const isDone = todo.completed;

  return (
    <li
      className={`kanban-card priority-border-${todo.priority} ${isDone ? 'completed' : ''}`}
      draggable
      onDragStart={handleDragStart}
    >
      <div className="kanban-card-top">
        <span className="kanban-card-text">{todo.text}</span>
        <button className="btn-icon-sm" onClick={onDelete} title="Delete">🗑</button>
      </div>
      <div className="todo-meta">
        {todo.timeEstimate && <span className="meta-tag">⏱ {todo.timeEstimate}</span>}
        {todo.dueDate && <span className="meta-tag">📅 {todo.dueDate}</span>}
        <span className={`meta-tag priority-tag ${todo.priority}`}>{todo.priority}</span>
        {todo.steps?.length > 0 && (
          <span className="meta-tag">✓ {todo.steps.filter(s => s.done).length}/{todo.steps.length}</span>
        )}
      </div>
      <div className="kanban-card-actions">
        {!isActive && !isDone && (
          <button className="kanban-move-btn" onClick={() => onMove('doing')}>▶ Start</button>
        )}
        {isActive && (
          <button className="kanban-move-btn" onClick={() => onMove('todo')}>⏸ Pause</button>
        )}
        {!isDone && (
          <button className="kanban-move-btn done-btn" onClick={() => onMove('done')}>✓ Done</button>
        )}
        {isDone && (
          <button className="kanban-move-btn" onClick={() => onMove('todo')}>↩ Reopen</button>
        )}
      </div>
    </li>
  );
}

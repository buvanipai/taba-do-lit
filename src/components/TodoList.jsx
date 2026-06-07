import { useState, useRef } from 'react';
import TodoItem from './TodoItem';

export default function TodoList({ todos, onUpdate, onDelete, onReorder }) {
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);
  const [dragging, setDragging] = useState(null);

  function handleDragStart(e, index) {
    dragItem.current = index;
    setDragging(index);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragEnter(e, index) {
    dragOverItem.current = index;
    e.preventDefault();
  }

  function handleDragEnd() {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const reordered = [...todos];
    const [removed] = reordered.splice(dragItem.current, 1);
    reordered.splice(dragOverItem.current, 0, removed);
    onReorder(reordered);
    dragItem.current = null;
    dragOverItem.current = null;
    setDragging(null);
  }

  if (todos.length === 0) {
    return <div className="empty-state">No tasks. Add one above or scan a page.</div>;
  }

  return (
    <ul className="todo-list">
      {todos.map((todo, index) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          index={index}
          isDragging={dragging === index}
          onUpdate={(data) => onUpdate(todo.id, data)}
          onDelete={() => onDelete(todo.id)}
          onDragStart={(e) => handleDragStart(e, index)}
          onDragEnter={(e) => handleDragEnter(e, index)}
          onDragEnd={handleDragEnd}
        />
      ))}
    </ul>
  );
}

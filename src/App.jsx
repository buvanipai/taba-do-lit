import { useState, useEffect } from 'react';
import { useTodos } from './useTodos';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import ScanModal from './components/ScanModal';
import AIPrioritize from './components/AIPrioritize';
import BgCanvas from './components/BgCanvas';
import InstallPrompt from './components/InstallPrompt';
import './App.css';

export default function App() {
  const { todos, loading, addTodo, updateTodo, deleteTodo, reorderTodos } = useTodos();
  const [showScan, setShowScan] = useState(false);
  const [filter, setFilter] = useState('all');
  const [theme, setTheme] = useState(() => localStorage.getItem('taba-theme') || 'glass');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('taba-theme', theme);
  }, [theme]);

  const filtered = todos.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'done') return t.completed;
    return true;
  });

  return (
    <>
    <BgCanvas theme={theme} />
    <InstallPrompt />
    <div className="app">
      <header className="app-header">
        <h1>taba</h1>
        <p className="tagline">your to-do list, anywhere</p>
        <div className="theme-switcher">
          <button
            className={`theme-btn ${theme === 'glass' ? 'active' : ''}`}
            onClick={() => setTheme('glass')}
            title="Liquid Glass"
          >💎</button>
          <button
            className={`theme-btn ${theme === 'neu' ? 'active' : ''}`}
            onClick={() => setTheme('neu')}
            title="Neumorphism"
          >🪨</button>
        </div>
      </header>

      <main className="app-main">
        <TodoForm onAdd={addTodo} />

        <div className="toolbar">
          <div className="filter-tabs">
            {['all', 'active', 'done'].map(f => (
              <button
                key={f}
                className={`filter-tab ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="toolbar-actions">
            <button className="btn-icon" onClick={() => setShowScan(true)} title="Scan a page">
              📷
            </button>
            <AIPrioritize todos={filtered} onReorder={reorderTodos} />
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <TodoList
            todos={filtered}
            onUpdate={updateTodo}
            onDelete={deleteTodo}
            onReorder={reorderTodos}
          />
        )}
      </main>

      {showScan && (
        <ScanModal
          onClose={() => setShowScan(false)}
          onAddTodos={(items) => {
            items.forEach(item => addTodo(item));
            setShowScan(false);
          }}
        />
      )}
    </div>
    </>
  );
}

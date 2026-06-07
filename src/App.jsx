import { useState, useEffect } from 'react';
import { useTodos } from './useTodos';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import KanbanBoard from './components/KanbanBoard';
import ScanModal from './components/ScanModal';
import AIPrioritize from './components/AIPrioritize';
import InstallPrompt from './components/InstallPrompt';
import Login from './components/Login';
import ProfilePanel from './components/ProfilePanel';
import './App.css';

export default function App() {
  const { todos, loading, userId, addTodo, updateTodo, deleteTodo, reorderTodos } = useTodos();
  const [showScan, setShowScan] = useState(false);
  const [filter, setFilter] = useState('active');
  const [view, setView] = useState('list');

  const filtered = todos.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'done') return t.completed;
    return true;
  });

  if (!userId && !loading) {
    return <Login />;
  }

  return (
    <>
      <InstallPrompt />
      <div className="app">
        <header className="app-header">
          <div className="header-left" />
          <div className="header-center">
            <h1>taba</h1>
            <p className="tagline">your to-do list, anywhere</p>
          </div>
          <div className="header-right">
            <ProfilePanel />
          </div>
        </header>

        <main className="app-main">
          <TodoForm onAdd={addTodo} />

          <div className="toolbar">
            <div className="filter-tabs">
              {['active', 'all', 'done'].map(f => (
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
              <div className="view-toggle">
                <button
                  className={`btn-icon view-btn ${view === 'list' ? 'active' : ''}`}
                  onClick={() => setView('list')}
                  title="List view"
                >☰</button>
                <button
                  className={`btn-icon view-btn ${view === 'kanban' ? 'active' : ''}`}
                  onClick={() => setView('kanban')}
                  title="Kanban view"
                >⊞</button>
              </div>
              <button className="btn-icon" onClick={() => setShowScan(true)} title="Scan a page">
                📷
              </button>
              <AIPrioritize todos={filtered} onReorder={reorderTodos} />
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading...</div>
          ) : view === 'kanban' ? (
            <KanbanBoard
              todos={todos}
              onUpdate={updateTodo}
              onDelete={deleteTodo}
            />
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

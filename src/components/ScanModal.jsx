import { useState, useRef } from 'react';
import { extractTasksFromImage } from '../claude';

export default function ScanModal({ onClose, onAddTodos }) {
  const [stage, setStage] = useState('pick');
  const [preview, setPreview] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [error, setError] = useState(null);
  const [converting, setConverting] = useState(false);
  const cameraRef = useRef();
  const uploadRef = useRef();

  async function toJpeg(file) {
    const isHeic = file.type === 'image/heic' || file.type === 'image/heif'
      || file.name.toLowerCase().endsWith('.heic')
      || file.name.toLowerCase().endsWith('.heif');

    if (!isHeic) return file;

    setConverting(true);
    const heic2any = (await import('heic2any')).default;
    const blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 });
    setConverting(false);
    return Array.isArray(blob) ? blob[0] : blob;
  }

  async function handleFile(file) {
    if (!file) return;
    setError(null);
    try {
      const jpeg = await toJpeg(file);
      setPreview(URL.createObjectURL(jpeg));
      setStage('scanning');

      const extracted = await extractTasksFromImage(jpeg);
      setTasks(extracted);
      setSelected(new Set(extracted.map((_, i) => i)));
      setStage('review');
    } catch (err) {
      setError(err.message);
      setStage('pick');
    }
  }

  function toggleSelect(i) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  function handleAdd() {
    const toAdd = tasks.filter((_, i) => selected.has(i));
    onAddTodos(toAdd);
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>Scan a page</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        {stage === 'pick' && (
          <div className="scan-pick">
            <p>Scan a handwritten or printed to-do list.</p>
            {error && <p className="error">{error}</p>}
            {converting && <p className="scan-converting">Converting HEIC… one sec</p>}

            <input ref={cameraRef} type="file" accept="image/*" capture="environment"
              style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
            <input ref={uploadRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic"
              style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />

            <div className="scan-buttons">
              <button className="btn-secondary" onClick={() => uploadRef.current.click()}>📁 Upload</button>
              <button className="btn-primary" onClick={() => cameraRef.current.click()}>📷 Camera</button>
            </div>
          </div>
        )}

        {stage === 'scanning' && (
          <div className="scan-progress">
            {preview && <img src={preview} className="scan-preview" alt="Scanning..." />}
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '100%', animation: 'pulse 1.5s ease-in-out infinite' }} />
            </div>
            <p>Reading handwriting with AI…</p>
          </div>
        )}

        {stage === 'review' && (
          <div className="scan-review">
            <div className="scan-review-header">
              <p>Select tasks to add:</p>
              {tasks.length > 0 && (
                <button className="btn-select-all" onClick={() =>
                  setSelected(selected.size === tasks.length ? new Set() : new Set(tasks.map((_, i) => i)))
                }>
                  {selected.size === tasks.length ? 'Deselect all' : 'Select all'}
                </button>
              )}
            </div>
            {tasks.length === 0 && <p className="error">No tasks found — try a clearer photo.</p>}
            <ul className="scan-task-list">
              {tasks.map((task, i) => (
                <li key={i} className={`scan-task ${selected.has(i) ? 'selected' : ''}`} onClick={() => toggleSelect(i)}>
                  <input type="checkbox" checked={selected.has(i)} onChange={() => toggleSelect(i)} />
                  <span>{task.text}</span>
                  {task.priority && (
                    <span className={`priority-badge priority-${task.priority}`}>{task.priority}</span>
                  )}
                </li>
              ))}
            </ul>
            <div className="scan-buttons">
              <button className="btn-secondary" onClick={() => setStage('pick')}>Re-scan</button>
              <button className="btn-primary" onClick={handleAdd} disabled={selected.size === 0}>
                Add {selected.size} task{selected.size !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

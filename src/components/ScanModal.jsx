import { useState, useRef } from 'react';
import { createWorker } from 'tesseract.js';
import { extractTasksFromText } from '../claude';

export default function ScanModal({ onClose, onAddTodos }) {
  const [stage, setStage] = useState('pick'); // pick | scanning | review
  const [preview, setPreview] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileRef = useRef();

  async function normalizeToJpeg(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext('2d').drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Canvas conversion failed')), 'image/jpeg', 0.92);
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')); };
      img.src = url;
    });
  }

  async function handleFile(file) {
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setStage('scanning');
    setError(null);
    try {
      const jpeg = await normalizeToJpeg(file);
      const worker = await createWorker('eng', 1, {
        logger: m => { if (m.status === 'recognizing text') setProgress(Math.round(m.progress * 100)); }
      });
      const { data: { text } } = await worker.recognize(jpeg);
      await worker.terminate();

      const extracted = await extractTasksFromText(text);
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
            <p>Take a photo of a handwritten or printed to-do list.</p>
            {error && <p className="error">{error}</p>}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={e => handleFile(e.target.files[0])}
            />
            <div className="scan-buttons">
              <button className="btn-primary" onClick={() => fileRef.current.click()}>
                📷 Camera / Upload
              </button>
            </div>
          </div>
        )}

        {stage === 'scanning' && (
          <div className="scan-progress">
            {preview && <img src={preview} className="scan-preview" alt="Scanning..." />}
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <p>Reading text... {progress}%</p>
          </div>
        )}

        {stage === 'review' && (
          <div className="scan-review">
            <p>Select tasks to add:</p>
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

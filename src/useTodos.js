import { useState, useEffect, useCallback } from 'react';
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, onSnapshot, query, orderBy, serverTimestamp
} from 'firebase/firestore';
import { db, ensureAuth } from './firebase';

export function useTodos() {
  const [todos, setTodos] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ensureAuth().then(user => setUserId(user.uid));
  }, []);

  useEffect(() => {
    if (!userId) return;
    const q = query(
      collection(db, 'users', userId, 'todos'),
      orderBy('order', 'asc')
    );
    const unsub = onSnapshot(q, snap => {
      setTodos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [userId]);

  const addTodo = useCallback(async (data) => {
    if (!userId) return;
    await addDoc(collection(db, 'users', userId, 'todos'), {
      text: data.text,
      priority: data.priority || 'medium',
      timeEstimate: data.timeEstimate || null,
      dueDate: data.dueDate || null,
      completed: false,
      order: Date.now(),
      createdAt: serverTimestamp(),
    });
  }, [userId]);

  const updateTodo = useCallback(async (id, data) => {
    if (!userId) return;
    await updateDoc(doc(db, 'users', userId, 'todos', id), data);
  }, [userId]);

  const deleteTodo = useCallback(async (id) => {
    if (!userId) return;
    await deleteDoc(doc(db, 'users', userId, 'todos', id));
  }, [userId]);

  const reorderTodos = useCallback(async (reordered) => {
    if (!userId) return;
    const updates = reordered.map((todo, index) =>
      updateDoc(doc(db, 'users', userId, 'todos', todo.id), { order: index * 1000 })
    );
    await Promise.all(updates);
  }, [userId]);

  return { todos, loading, addTodo, updateTodo, deleteTodo, reorderTodos };
}

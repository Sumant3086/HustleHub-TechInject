'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import type { TaskResponse, CreateTaskDto, TaskStatus, TaskPriority } from '@alternative/core';
import styles from './dashboard.module.css';

const COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: 'todo', label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'done', label: 'Done' },
];

const PRIORITY_COLORS: Record<string, string> = {
  high: '#f44336',
  medium: '#ff9800',
  low: '#4caf50',
};

// Pending sync queue - fire and forget
const pendingOps = new Map<string, ReturnType<typeof setTimeout>>();

function syncTask(id: string, fn: () => Promise<unknown>) {
  const existing = pendingOps.get(id);
  if (existing) clearTimeout(existing);
  // Small debounce to batch rapid moves
  const t = setTimeout(() => {
    fn().finally(() => pendingOps.delete(id));
  }, 50);
  pendingOps.set(id, t);
}

export default function DashboardPage() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [showForm, setShowForm] = useState<TaskStatus | null>(null);
  const [newTask, setNewTask] = useState<CreateTaskDto>({ title: '', description: '', status: 'todo', priority: 'medium' });
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);
  const dragId = useRef<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) { router.push('/login'); return; }
    apiClient.get<TaskResponse[]>('/api/tasks')
      .then(setTasks)
      .finally(() => setLoadingTasks(false));
  }, [isAuthenticated, isLoading, router]);

  // Drag handlers
  const onDragStart = (e: React.DragEvent, id: string) => {
    dragId.current = id;
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: React.DragEvent, col: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCol(col);
  };

  const onDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    const id = dragId.current;
    if (!id) return;

    const task = tasks.find(t => t.id === id);
    if (!task || task.status === status) return;

    // Instant optimistic update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));

    // Background sync - never reverts
    syncTask(id, () => apiClient.patch(`/api/tasks/${id}`, { status }));
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const tempId = `temp_${Date.now()}`;
    const temp: TaskResponse = {
      id: tempId, title: newTask.title, description: newTask.description || null,
      status: newTask.status || 'todo', priority: newTask.priority || 'medium',
      position: 0, tenantId: '', userId: '',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    setTasks(prev => [...prev, temp]);
    setShowForm(null);
    setNewTask({ title: '', description: '', status: 'todo', priority: 'medium' });

    try {
      const task = await apiClient.post<TaskResponse>('/api/tasks', newTask);
      setTasks(prev => prev.map(t => t.id === tempId ? task : t));
    } catch {
      setTasks(prev => prev.filter(t => t.id !== tempId));
    }
  };

  const deleteTask = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    setTasks(prev => prev.filter(t => t.id !== id));
    try {
      await apiClient.delete(`/api/tasks/${id}`);
    } catch {
      // Reload on delete failure
      apiClient.get<TaskResponse[]>('/api/tasks').then(setTasks);
    }
  };

  if (isLoading || loadingTasks) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1>Task Board</h1>
        <button onClick={() => { logout(); router.push('/'); }} className={styles.logoutBtn}>Logout</button>
      </header>

      <div className={styles.board}>
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.key);
          return (
            <div
              key={col.key}
              className={`${styles.column} ${dragOverCol === col.key ? styles.dragOver : ''}`}
              onDragOver={(e) => onDragOver(e, col.key)}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={(e) => onDrop(e, col.key)}
            >
              <div className={styles.columnHeader}>
                <h3>{col.label}</h3>
                <span className={styles.count}>{colTasks.length}</span>
              </div>

              <div className={styles.tasks}>
                {colTasks.map(task => (
                  <div
                    key={task.id}
                    className={styles.card}
                    draggable
                    onDragStart={(e) => onDragStart(e, task.id)}
                    style={{ borderLeftColor: PRIORITY_COLORS[task.priority] || '#999' }}
                  >
                    <div className={styles.cardContent}>
                      <h4>{task.title}</h4>
                      {task.description && <p>{task.description}</p>}
                    </div>
                    <button onClick={() => deleteTask(task.id)} className={styles.deleteBtn}>×</button>
                  </div>
                ))}
              </div>

              <button onClick={() => { setShowForm(col.key); setNewTask(p => ({ ...p, status: col.key })); }} className={styles.addBtn}>
                + Add Task
              </button>
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className={styles.overlay} onClick={() => setShowForm(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3>New Task</h3>
            <form onSubmit={createTask}>
              <div className={styles.field}>
                <label>Title</label>
                <input type="text" value={newTask.title} onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))} required autoFocus />
              </div>
              <div className={styles.field}>
                <label>Description</label>
                <textarea value={newTask.description} onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))} rows={3} />
              </div>
              <div className={styles.field}>
                <label>Priority</label>
                <select value={newTask.priority} onChange={e => setNewTask(p => ({ ...p, priority: e.target.value as TaskPriority }))}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowForm(null)}>Cancel</button>
                <button type="submit">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

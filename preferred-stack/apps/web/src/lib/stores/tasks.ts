import { writable } from 'svelte/store';
import { apiClient } from '../api/client';
import type { TaskResponse, CreateTaskDto, UpdateTaskDto, MoveTaskDto } from '@preferred/core';

// Track the latest intended state per task id
// If the server responds with an older state, we ignore it
const latestIntent = new Map<string, UpdateTaskDto>();

function createTaskStore() {
  const { subscribe, set, update } = writable<TaskResponse[]>([]);

  function syncToApi(id: string, dto: UpdateTaskDto) {
    // Record what we intend this task to look like
    latestIntent.set(id, dto);

    apiClient.patch<TaskResponse>(`/api/tasks/${id}`, dto)
      .then(serverTask => {
        // Only apply server response if it matches our latest intent
        // This prevents a slow response from overwriting a newer drag
        const intent = latestIntent.get(id);
        if (intent && intent.status === serverTask.status) {
          // Merge server data (real id, timestamps) but keep our status
          update(tasks => tasks.map(t => t.id === id ? { ...serverTask, status: intent.status! } : t));
          latestIntent.delete(id);
        }
        // If intent changed (user dragged again), ignore this response entirely
      })
      .catch(() => {
        // Silently ignore - optimistic state stays
        // Never revert on slow/failed API
      });
  }

  return {
    subscribe,

    async loadTasks() {
      const tasks = await apiClient.get<TaskResponse[]>('/api/tasks');
      set(tasks);
    },

    async createTask(dto: CreateTaskDto) {
      const tempId = `temp_${Date.now()}`;
      const tempTask: TaskResponse = {
        id: tempId,
        title: dto.title,
        description: dto.description || null,
        status: dto.status || 'todo',
        priority: dto.priority || 'medium',
        position: 0,
        tenantId: '',
        userId: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      update(tasks => [...tasks, tempTask]);

      try {
        const task = await apiClient.post<TaskResponse>('/api/tasks', dto);
        update(tasks => tasks.map(t => t.id === tempId ? task : t));
        return task;
      } catch (error) {
        update(tasks => tasks.filter(t => t.id !== tempId));
        throw error;
      }
    },

    updateTask(id: string, dto: UpdateTaskDto) {
      // Apply instantly - this is the source of truth now
      update(tasks => tasks.map(t => t.id === id ? { ...t, ...dto } : t));
      // Background sync - never blocks, never reverts
      syncToApi(id, dto);
    },

    moveTask(id: string, dto: MoveTaskDto) {
      update(tasks =>
        tasks.map(t => t.id === id ? { ...t, status: dto.status, position: dto.position } : t)
      );
      syncToApi(id, { status: dto.status });
    },

    async deleteTask(id: string) {
      let previousTasks: TaskResponse[] = [];
      update(tasks => {
        previousTasks = [...tasks];
        return tasks.filter(t => t.id !== id);
      });

      try {
        await apiClient.delete(`/api/tasks/${id}`);
      } catch {
        set(previousTasks);
      }
    },
  };
}

export const taskStore = createTaskStore();

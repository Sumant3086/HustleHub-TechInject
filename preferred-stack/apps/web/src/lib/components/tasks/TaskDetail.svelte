<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { taskStore } from '../../stores/tasks';
  import type { TaskResponse, TaskPriority, TaskStatus } from '@preferred/core';

  export let task: TaskResponse;

  const dispatch = createEventDispatcher<{ close: void }>();

  let title = task.title;
  let description = task.description ?? '';
  let priority: TaskPriority = task.priority;
  let status: TaskStatus = task.status;
  let saving = false;
  let error = '';

  async function handleSave() {
    if (!title.trim()) return;
    error = '';
    saving = true;

    try {
      taskStore.updateTask(task.id, { title, description, priority, status });
      dispatch('close');
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to save';
    } finally {
      saving = false;
    }
  }

  function handleBackdrop(e: MouseEvent) {
    if (e.target === e.currentTarget) dispatch('close');
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="backdrop" on:click={handleBackdrop} role="dialog" aria-modal="true" aria-label="Edit task">
  <div class="panel">
    <div class="panel-header">
      <h2>Edit Task</h2>
      <button class="close-btn" on:click={() => dispatch('close')} aria-label="Close">×</button>
    </div>

    {#if error}
      <div class="error">{error}</div>
    {/if}

    <form on:submit|preventDefault={handleSave}>
      <div class="field">
        <label for="detail-title">Title</label>
        <input
          id="detail-title"
          type="text"
          bind:value={title}
          required
          placeholder="Task title"
        />
      </div>

      <div class="field">
        <label for="detail-description">Description</label>
        <textarea
          id="detail-description"
          bind:value={description}
          rows={4}
          placeholder="Add a description..."
        />
      </div>

      <div class="row">
        <div class="field">
          <label for="detail-status">Status</label>
          <select id="detail-status" bind:value={status}>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div class="field">
          <label for="detail-priority">Priority</label>
          <select id="detail-priority" bind:value={priority}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div class="meta">
        <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
        <span>Updated: {new Date(task.updatedAt).toLocaleDateString()}</span>
      </div>

      <div class="actions">
        <button type="button" on:click={() => dispatch('close')}>Cancel</button>
        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  </div>
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .panel {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    width: 90%;
    max-width: 520px;
    max-height: 90vh;
    overflow-y: auto;
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
  }

  .panel-header h2 {
    margin: 0;
    font-size: 1.25rem;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #999;
    cursor: pointer;
    padding: 0;
    line-height: 1;
  }

  .close-btn:hover { color: #333; }

  .field {
    margin-bottom: 1rem;
    flex: 1;
  }

  label {
    display: block;
    margin-bottom: 0.35rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #444;
  }

  input, textarea, select {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.9rem;
    box-sizing: border-box;
  }

  input:focus, textarea:focus, select:focus {
    outline: none;
    border-color: #0066cc;
  }

  .row {
    display: flex;
    gap: 1rem;
  }

  .meta {
    display: flex;
    gap: 1.5rem;
    font-size: 0.75rem;
    color: #999;
    margin-bottom: 1.25rem;
  }

  .actions {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
  }

  button {
    padding: 0.5rem 1.25rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
  }

  button[type='button'] { background: #f5f5f5; color: #333; }
  button[type='submit'] { background: #0066cc; color: white; }
  button:disabled { opacity: 0.6; cursor: not-allowed; }

  .error {
    padding: 0.75rem;
    background: #fee;
    color: #c00;
    border-radius: 4px;
    margin-bottom: 1rem;
    font-size: 0.875rem;
  }
</style>

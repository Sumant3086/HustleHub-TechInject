<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { taskStore } from '../../stores/tasks';
  import type { TaskStatus, TaskPriority } from '@preferred/core';

  export let status: TaskStatus;

  const dispatch = createEventDispatcher();

  let title = '';
  let description = '';
  let priority: TaskPriority = 'medium';
  let loading = false;
  let error = '';

  async function handleSubmit() {
    error = '';
    loading = true;

    try {
      await taskStore.createTask({ title, description, status, priority });
      dispatch('close');
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to create task';
    } finally {
      loading = false;
    }
  }
</script>

<div class="modal">
  <div class="modal-content">
    <h3>New Task</h3>

    {#if error}
      <div class="error">{error}</div>
    {/if}

    <form on:submit|preventDefault={handleSubmit}>
      <div>
        <label for="title">Title</label>
        <input
          id="title"
          type="text"
          bind:value={title}
          placeholder="Task title"
          required
        />
      </div>

      <div>
        <label for="description">Description</label>
        <textarea
          id="description"
          bind:value={description}
          placeholder="Task description (optional)"
          rows="3"
        />
      </div>

      <div>
        <label for="priority">Priority</label>
        <select id="priority" bind:value={priority}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div class="actions">
        <button type="button" on:click={() => dispatch('close')}>Cancel</button>
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create'}
        </button>
      </div>
    </form>
  </div>
</div>

<style>
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    width: 90%;
    max-width: 500px;
  }

  h3 {
    margin: 0 0 1.5rem 0;
  }

  div {
    margin-bottom: 1rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  input,
  textarea,
  select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 1.5rem;
  }

  button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  button[type="button"] {
    background: #f5f5f5;
    color: #333;
  }

  button[type="submit"] {
    background: #0066cc;
    color: white;
  }

  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .error {
    padding: 0.75rem;
    background: #fee;
    color: #c00;
    border-radius: 4px;
    margin-bottom: 1rem;
  }
</style>

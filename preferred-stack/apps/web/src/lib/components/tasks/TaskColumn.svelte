<script lang="ts">
  import { taskStore } from '../../stores/tasks';
  import TaskCard from './TaskCard.svelte';
  import TaskForm from './TaskForm.svelte';
  import type { TaskResponse, TaskStatus } from '@preferred/core';

  export let title: string;
  export let status: TaskStatus;
  export let tasks: TaskResponse[];

  let showForm = false;
  let isDragOver = false;

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
    isDragOver = true;
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    isDragOver = false;
  }

  async function handleDrop(e: DragEvent) {
    e.preventDefault();
    isDragOver = false;

    const taskId = e.dataTransfer?.getData('taskId');
    if (!taskId) return;

    // If task is already in this column, do nothing
    const task = tasks.find(t => t.id === taskId);
    if (task) return;

    // Instant update - no await, no spinner, no revert
    taskStore.updateTask(taskId, { status });
  }
</script>

<div 
  class="column" 
  class:drag-over={isDragOver}
  on:dragover={handleDragOver}
  on:dragleave={handleDragLeave}
  on:drop={handleDrop}
  role="region"
  aria-label="{title} column"
>
  <div class="header">
    <h3>{title}</h3>
    <span class="count">{tasks.length}</span>
  </div>

  <div class="tasks">
    {#each tasks as task (task.id)}
      <TaskCard {task} />
    {/each}
  </div>

  <button class="add-btn" on:click={() => (showForm = !showForm)}>
    + Add Task
  </button>

  {#if showForm}
    <TaskForm {status} on:close={() => (showForm = false)} />
  {/if}
</div>

<style>
  .column {
    background: #f5f5f5;
    border-radius: 8px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    transition: background-color 0.2s;
  }

  .column.drag-over {
    background: #e3f2fd;
    border: 2px dashed #2196f3;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  h3 {
    margin: 0;
    font-size: 1.1rem;
  }

  .count {
    background: #ddd;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.875rem;
  }

  .tasks {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    min-height: 200px;
    padding: 0.5rem;
    border-radius: 4px;
    transition: background-color 0.2s;
  }

  .column.drag-over .tasks {
    background: rgba(33, 150, 243, 0.1);
  }

  .add-btn {
    margin-top: 1rem;
    padding: 0.5rem;
    background: white;
    border: 2px dashed #ccc;
    border-radius: 4px;
    cursor: pointer;
    color: #666;
  }

  .add-btn:hover {
    border-color: #0066cc;
    color: #0066cc;
  }
</style>

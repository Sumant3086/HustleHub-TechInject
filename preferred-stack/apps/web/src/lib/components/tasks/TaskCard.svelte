<script lang="ts">
  import { taskStore } from '../../stores/tasks';
  import TaskDetail from './TaskDetail.svelte';
  import type { TaskResponse } from '@preferred/core';

  export let task: TaskResponse;

  let dragging = false;
  let showDetail = false;

  function handleDragStart(e: DragEvent) {
    dragging = true;
    e.dataTransfer!.effectAllowed = 'move';
    e.dataTransfer!.setData('taskId', task.id);
  }

  function handleDragEnd() {
    dragging = false;
  }

  function handleClick() {
    if (!dragging) showDetail = true;
  }

  async function handleDelete(e: MouseEvent) {
    e.stopPropagation();
    if (confirm('Delete this task?')) {
      try {
        await taskStore.deleteTask(task.id);
      } catch {
        alert('Failed to delete task');
      }
    }
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#999';
    }
  }
</script>

<div
  class="card"
  class:dragging
  draggable={true}
  role="button"
  tabindex="0"
  on:dragstart={handleDragStart}
  on:dragend={handleDragEnd}
  on:click={handleClick}
  on:keydown={(e) => { if (e.key === 'Enter') showDetail = true; }}
>
  <div class="priority" style="background: {getPriorityColor(task.priority)}" />

  <div class="content">
    <h4>{task.title}</h4>
    {#if task.description}
      <p>{task.description}</p>
    {/if}
  </div>

  <button class="delete-btn" on:click={handleDelete} aria-label="Delete task">×</button>
</div>

{#if showDetail}
  <TaskDetail {task} on:close={() => (showDetail = false)} />
{/if}

<style>
  .card {
    background: white;
    border-radius: 6px;
    padding: 1rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    cursor: grab;
    position: relative;
    border-left: 4px solid transparent;
    transition: transform 0.2s, box-shadow 0.2s;
    user-select: none;
  }

  .card:active {
    cursor: grabbing;
  }

  .card:hover {
    box-shadow: 0 2px 6px rgba(0,0,0,0.15);
    transform: translateY(-2px);
  }

  .card.dragging {
    opacity: 0.4;
    cursor: grabbing;
    transform: rotate(2deg);
  }

  .priority {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    border-radius: 6px 0 0 6px;
  }

  .content {
    padding-left: 0.5rem;
  }

  h4 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
  }

  p {
    margin: 0;
    font-size: 0.875rem;
    color: #666;
  }

  .delete-btn {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #999;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    line-height: 1;
  }

  .delete-btn:hover {
    color: #f44336;
  }
</style>

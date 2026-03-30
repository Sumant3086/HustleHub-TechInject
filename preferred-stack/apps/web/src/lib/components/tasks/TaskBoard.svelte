<script lang="ts">
  import { onMount } from 'svelte';
  import { taskStore } from '../../stores/tasks';
  import TaskColumn from './TaskColumn.svelte';
  import type { TaskResponse } from '@preferred/core';

  let tasks: TaskResponse[] = [];
  let loading = true;
  let error = '';

  taskStore.subscribe(value => {
    tasks = value;
  });

  onMount(async () => {
    try {
      await taskStore.loadTasks();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load tasks';
    } finally {
      loading = false;
    }
  });

  $: todoTasks = tasks.filter(t => t.status === 'todo');
  $: inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  $: doneTasks = tasks.filter(t => t.status === 'done');
</script>

<div class="board">
  {#if loading}
    <div class="loading">Loading tasks...</div>
  {:else if error}
    <div class="error">{error}</div>
  {:else}
    <TaskColumn title="To Do" status="todo" tasks={todoTasks} />
    <TaskColumn title="In Progress" status="in_progress" tasks={inProgressTasks} />
    <TaskColumn title="Done" status="done" tasks={doneTasks} />
  {/if}
</div>

<style>
  .board {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    padding: 2rem;
    height: calc(100vh - 100px);
  }

  .loading,
  .error {
    grid-column: 1 / -1;
    text-align: center;
    padding: 2rem;
  }

  .error {
    color: #c00;
  }

  @media (max-width: 768px) {
    .board {
      grid-template-columns: 1fr;
    }
  }
</style>

<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore, type AuthState } from '$lib/stores/auth';
  import TaskBoard from '$lib/components/tasks/TaskBoard.svelte';

  let isAuthenticated = false;
  let isLoading = true;

  authStore.subscribe((state: AuthState) => {
    isAuthenticated = state.isAuthenticated;
    isLoading = state.isLoading;
  });

  onMount(() => {
    // Synchronous - decodes JWT locally, no network call
    authStore.checkAuth();

    const unsubscribe = authStore.subscribe((state: AuthState) => {
      if (!state.isLoading && !state.isAuthenticated) {
        goto('/login');
      }
    });

    return () => unsubscribe();
  });

  function handleLogout() {
    authStore.logout();
    goto('/');
  }
</script>

{#if isLoading}
  <div class="loading-container">
    <div class="spinner"></div>
  </div>
{:else if isAuthenticated}
  <div class="dashboard">
    <header>
      <h1>Task Board</h1>
      <button on:click={handleLogout}>Logout</button>
    </header>
    <TaskBoard />
  </div>
{/if}

<style>
  .loading-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #0066cc;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .dashboard {
    min-height: 100vh;
  }

  header {
    background: white;
    padding: 1rem 2rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  h1 { margin: 0; font-size: 1.5rem; }

  button {
    padding: 0.5rem 1rem;
    background: #f44336;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  button:hover { opacity: 0.9; }
</style>

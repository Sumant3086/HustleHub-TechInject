<script lang="ts">
  import { goto } from '$app/navigation';
  import { authStore, type AuthState } from '$lib/stores/auth';

  let isAuthenticated = false;

  authStore.subscribe((state: AuthState) => {
    isAuthenticated = state.isAuthenticated;
  });

  function handleGetStarted() {
    goto('/register');
  }
</script>

<div class="container">
  <h1>Multi-Tenant Task Board</h1>
  <p>Organize your team's work with a simple, powerful task board</p>
  
  <div class="actions">
    {#if isAuthenticated}
      <a href="/dashboard" class="btn btn-primary">Go to Dashboard</a>
    {:else}
      <button class="btn btn-primary" on:click={handleGetStarted}>Get Started</button>
      <a href="/login" class="btn btn-secondary">Login</a>
    {/if}
  </div>
</div>

<style>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 4rem 2rem;
    text-align: center;
  }

  h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: #333;
  }

  p {
    font-size: 1.25rem;
    color: #666;
    margin-bottom: 2rem;
  }

  .actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .btn {
    padding: 0.75rem 2rem;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
    text-decoration: none;
    display: inline-block;
  }

  .btn-primary {
    background: #0066cc;
    color: white;
  }

  .btn-secondary {
    background: white;
    color: #0066cc;
    border: 2px solid #0066cc;
  }

  .btn:hover {
    opacity: 0.9;
  }
</style>

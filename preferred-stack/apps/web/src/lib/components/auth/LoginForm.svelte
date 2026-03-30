<script lang="ts">
  import { authStore } from '../../stores/auth';
  import { goto } from '$app/navigation';

  let email = '';
  let password = '';
  let tenantSlug = '';
  let error = '';
  let loading = false;

  async function handleSubmit() {
    error = '';
    loading = true;

    try {
      await authStore.login({ email, password }, tenantSlug);
      goto('/dashboard');
    } catch (err) {
      error = err instanceof Error ? err.message : 'Login failed';
    } finally {
      loading = false;
    }
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
  <h2>Login</h2>
  
  {#if error}
    <div class="error">{error}</div>
  {/if}

  <div>
    <label for="tenantSlug">Tenant</label>
    <input
      id="tenantSlug"
      type="text"
      bind:value={tenantSlug}
      placeholder="your-company"
      required
    />
  </div>

  <div>
    <label for="email">Email</label>
    <input
      id="email"
      type="email"
      bind:value={email}
      placeholder="you@example.com"
      required
    />
  </div>

  <div>
    <label for="password">Password</label>
    <input
      id="password"
      type="password"
      bind:value={password}
      placeholder="••••••••"
      required
    />
  </div>

  <button type="submit" disabled={loading}>
    {loading ? 'Logging in...' : 'Login'}
  </button>
</form>

<style>
  form {
    max-width: 400px;
    margin: 0 auto;
    padding: 2rem;
  }

  h2 {
    margin-bottom: 1.5rem;
  }

  div {
    margin-bottom: 1rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  button {
    width: 100%;
    padding: 0.75rem;
    background: #0066cc;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
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

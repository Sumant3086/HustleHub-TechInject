<script lang="ts">
  import LoginForm from '$lib/components/auth/LoginForm.svelte';
</script>

<div class="container">
  <LoginForm />
  <p class="link">
    Don't have an account? <a href="/register">Register</a>
  </p>
</div>

<style>
  .container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .link {
    text-align: center;
    margin-top: 1rem;
  }

  a {
    color: #0066cc;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
</style>

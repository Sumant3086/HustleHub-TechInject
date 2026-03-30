<script lang="ts">
  import RegisterForm from '$lib/components/auth/RegisterForm.svelte';
</script>

<div class="container">
  <RegisterForm />
  <p class="link">
    Already have an account? <a href="/login">Login</a>
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

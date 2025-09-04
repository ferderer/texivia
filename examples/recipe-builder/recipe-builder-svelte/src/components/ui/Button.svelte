<script lang="ts">
  let {
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    onclick,
    children,
    ...props
  } = $props();

  type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
  type Size = 'small' | 'medium' | 'large';
</script>

<button
  class="btn btn-{variant} btn-{size}"
  {disabled}
  onclick={onclick}
  {...props}
>
  {#if loading}
    <span class="spinner"></span>
  {/if}
  {@render children()}
</button>

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-weight: 600;
    border-radius: 0.5rem;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Sizes */
  .btn-small {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }

  .btn-medium {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }

  .btn-large {
    padding: 1rem 2rem;
    font-size: 1.125rem;
  }

  /* Variants */
  .btn-primary {
    background: #2563eb;
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: #1d4ed8;
  }

  .btn-secondary {
    background: white;
    color: #374151;
    border: 2px solid #e5e7eb;
  }

  .btn-secondary:hover:not(:disabled) {
    border-color: #d1d5db;
    background: #f9fafb;
  }

  .btn-danger {
    background: #dc2626;
    color: white;
  }

  .btn-danger:hover:not(:disabled) {
    background: #b91c1c;
  }

  .btn-ghost {
    background: transparent;
    color: #374151;
  }

  .btn-ghost:hover:not(:disabled) {
    background: #f3f4f6;
  }

  .spinner {
    width: 1rem;
    height: 1rem;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>

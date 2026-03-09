<script lang="ts">
  let {
    type = 'info',
    message,
    visible = false,
    duration = 5000,
    onClose
  } = $props();

  type ToastType = 'success' | 'error' | 'warning' | 'info';

  let timeout: number;

  $effect(() => {
    if (visible && duration > 0) {
      timeout = setTimeout(() => {
        onClose?.();
      }, duration);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  });

  function getIcon(type: ToastType) {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
    }
  }
</script>

{#if visible}
  <div class="toast toast-{type}">
    <span class="toast-icon">{getIcon(type)}</span>
    <span class="toast-message">{message}</span>
    <button class="toast-close" onclick={onClose}>✕</button>
  </div>
{/if}

<style>
  .toast {
    position: fixed;
    top: 2rem;
    right: 2rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.5rem;
    border-radius: 0.75rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1001;
    max-width: 400px;
    animation: toastIn 0.3s ease-out;
  }

  @keyframes toastIn {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .toast-success {
    background: #dcfce7;
    color: #16a34a;
    border: 1px solid #bbf7d0;
  }

  .toast-error {
    background: #fee2e2;
    color: #dc2626;
    border: 1px solid #fecaca;
  }

  .toast-warning {
    background: #fef3c7;
    color: #d97706;
    border: 1px solid #fde68a;
  }

  .toast-info {
    background: #dbeafe;
    color: #2563eb;
    border: 1px solid #bfdbfe;
  }

  .toast-message {
    flex: 1;
    font-weight: 500;
  }

  .toast-close {
    background: none;
    border: none;
    color: currentColor;
    cursor: pointer;
    padding: 0;
    opacity: 0.7;
  }

  .toast-close:hover {
    opacity: 1;
  }

  @media (max-width: 640px) {
    .toast {
      top: auto;
      bottom: 2rem;
      left: 1rem;
      right: 1rem;
      max-width: none;
    }
  }
</style>

<script lang="ts">
  import { onMount } from 'svelte';
  import { router } from './router';
  import Landing from './pages/Landing.svelte';

  let View = $state(Landing);
  let params = $state({ 'locale': 'en'});

  function navigate(event: CustomEvent) {
    View = event.detail.view;
    params = event.detail?.params || {};
  }

  onMount(() => {
    router.start();
    document.addEventListener('texivia', navigate as EventListener);

    return () => {
      router.stop();
      document.removeEventListener('texivia', navigate as EventListener);
    };
  });
</script>

<View {...params} />

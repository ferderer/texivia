<script lang="ts">
  import { onMount } from 'svelte';
  import { router } from './router';
  import Home from './pages/Home.svelte';

  let View = $state(Home);
  let params = $state({});

  function navigate(event: CustomEvent) {
    View = event.detail.view;
    params = event.detail?.params || {};
  }

  onMount(() => {
    document.addEventListener('texivia', navigate as EventListener);
    router.start();

    return () => {
      router.stop();
      document.removeEventListener('texivia', navigate as EventListener);
    };
  });
</script>

<View {...params} />

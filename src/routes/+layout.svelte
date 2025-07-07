<script lang="ts">
  import { page } from '$app/stores';
  import { derived } from 'svelte/store';
  import Navbar from '$lib/components/Navbar.svelte';
    import FAB from '$lib/components/FAB.svelte'; 


  const currentPath = derived(page, ($page) => $page.url.pathname);
</script>

<!-- Contenedor con padding-bottom para dejar espacio a la navbar fija -->
<div class="pb-16 min-h-screen">
  <slot />
</div>

<div class="fixed-bottom-right">
  <FAB />
</div>

<Navbar />

<style>
  nav a.active svg {
    stroke: #4f46e5; /* Indigo-600 */
  }
  .fixed-bottom-right {
    position: fixed;
    bottom: 5rem;
    right: 2.5rem;
    z-index: 1000; /* Asegura que esté por encima de otros elementos */
    display: flex;
    justify-content: flex-end;
    align-items: center;

  }
</style>

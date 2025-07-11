<script lang="ts">
  import { page } from '$app/stores';
  import { Home, Utensils, Dumbbell, Settings, UserRound } from 'lucide-svelte';
  import { derived } from 'svelte/store';

  const currentPath = derived(page, ($page) => $page.url.pathname);
</script>

<nav class="custom-navbar">
  <ul class="navbar-list">
    <li>
      <a href="/" class="navbar-link" class:active={$currentPath === '/'}>
        <Home class="w-6 h-6" />
      </a>
    </li>
    <li>
      <a href="/comida" class="navbar-link" class:active={$currentPath === '/comida'}>
        <Utensils class="w-6 h-6" />
      </a>
    </li>
    <li>
      <a href="/ejercicio" class="navbar-link" class:active={$currentPath === '/ejercicio'}>
        <Dumbbell class="w-6 h-6" />
      </a>
    </li>
    <li>
      <a href="/perfil" class="navbar-link" class:active={$currentPath === '/ajustes'}>
        <UserRound class="w-6 h-6" />
      </a>
    </li>
  </ul>
</nav>

<style>
  .custom-navbar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 50;
    background-color: white;
    border-top: 1px solid #e5e7eb; /* Tailwind gray-200 */
    box-shadow: 0 -1px 4px rgba(0, 0, 0, 0.05);
  }

  .navbar-list {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    height: 4rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .navbar-link {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .navbar-link.active svg {
    stroke: #4f46e5; /* Indigo-600 */
  }
</style>

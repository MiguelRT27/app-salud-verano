<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { goto } from '$app/navigation';

  const dispatch = createEventDispatcher();

  export let isOpen = false;

  function toggleFAB() {
    isOpen = !isOpen;
    dispatch('toggle', { isOpen });
  }

  function gotoAddMeal() {
    goto('/comidas/meal/new');
    isOpen = false;
    dispatch('toggle', { isOpen });
  }
</script>

<div class=" z-50 flex flex-col items-end space-y-2">
  {#if isOpen}
    <button
      on:click={gotoAddMeal}
      class="btn-text"
      aria-label="Añadir comida"
      type="button"
    >
      🍽 Añadir comida
    </button>
  {/if}

  <button
    class="btn-fab"
    on:click={toggleFAB}
    aria-label="Acciones rápidas"
    type="button"
  >
    {#if isOpen}
        ✕
    {:else}
        +
    {/if}
  </button>
</div>

<style>
  .btn-fab {
    user-select: none;
    width: 35px;          /* tamaño grande para el botón circular */
    height: 35px;
    font-size: 34px;      /* tamaño del símbolo + o ✕ */
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    background-color: #063372;
    color: white;
    transition: background-color 0.2s ease;
  }
  .btn-fab:hover {
    background-color: #1f2937;
  }

  .btn-text {
    background-color: #063372;
    color: white;
    padding: 8px 16px;
    font-size: 14px;     /* tamaño más pequeño para texto */
    border-radius: 9999px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    user-select: none;
    transition: background-color 0.2s ease;
  }
  .btn-text:hover {
    background-color: #1f2937;
  }
</style>

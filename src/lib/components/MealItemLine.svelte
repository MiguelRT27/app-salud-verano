<script lang="ts">
  import { getFoodItemById } from '$lib/db';
  import { onMount } from 'svelte';

  export let item: { foodId: number; quantityGrams: number };

  let name = '';
  let kcal = 0;

  onMount(async () => {
    const food = await getFoodItemById(item.foodId);
    if (food) {
      name = food.name;
      kcal = (food.macros.kcal * item.quantityGrams) / 100;
    }
  });
</script>

<li>{name} ({item.quantityGrams}g) → {Math.round(kcal)} kcal</li>

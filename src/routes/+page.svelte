<script lang="ts">
  import { onMount } from 'svelte';
  import { getDailyMacros, initDB } from '$lib/db';
  import { format } from 'date-fns';
  import { es } from 'date-fns/locale';
  import WeeklyKcalChart from '$lib/components/WeeklyKcalChart.svelte';
  import DailyMacroSummary from '$lib/components/DailyMacroSum.svelte';

  const dia = format(new Date(), "d 'de' MMMM", { locale: es });
  const today = format(new Date(), 'yyyy-MM-dd');

  let totalMacros = {
    kcal: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    salt: 0
  };

  const kcalGoal = 1800;
  const proteinGoal = kcalGoal * 0.3 / 4;
  const carbsGoal = kcalGoal * 0.4 / 4;
  const fatGoal = kcalGoal * 0.3 / 9;
  const fiberGoal = 30;
  const saltGoal = 5;

  onMount(async () => {
    initDB();
    totalMacros = await getDailyMacros(today);
  });
</script>

<section class="bg-black min-h-screen text-white font-sans flex flex-col items-center justify-start pt-8 space-y-8 ">
  <h1 class="text-lg text-gray-400">Hoy, {dia}</h1>

  <div class="summary-card w-full max-w-md px-2 py-2">
    <DailyMacroSummary
      {totalMacros}
      {kcalGoal}
      {proteinGoal}
      {carbsGoal}
      {fatGoal}
      {fiberGoal}
      {saltGoal}
    />
  </div>

  <div class="summary-card w-full max-w-md px-6 py-6 mt-8">
    <WeeklyKcalChart />
  </div>
</section>


<style>
  section {
    font-family: 'Inter', sans-serif;
  }

  .summary-card {
    background-color: #1f2937;
    border-radius: 12px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    padding: 24px 20px;
    max-width: 400px;
    width: 90vw;
    margin: 12px auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }

  /* Mantén aquí tus estilos de labels */
</style>

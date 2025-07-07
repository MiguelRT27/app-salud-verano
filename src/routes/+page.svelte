<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { getDailyMacros, initDB } from '$lib/db';
  import { format } from 'date-fns';
  import { es } from 'date-fns/locale';
  
  

  const dia = format(new Date(), "d 'de' MMMM", { locale: es });
  const today = format(new Date(), 'yyyy-MM-dd');

  let totalMacros = {
    kcal: 1000, 
    protein: 45,
    carbs: 90,
    fat: 30,
    fiber: 10,
    salt: 3
  };

  const kcalGoal = 1800;
  const proteinGoal = kcalGoal * 0.3 / 4;
  const carbsGoal = kcalGoal * 0.4 / 4;
  const fatGoal = kcalGoal * 0.3 / 9;
  const fiberGoal = 30; 
  const saltGoal = 5; 

  let kcalChart: any = null;
  let proteinChart: any = null;
  let carbsChart: any = null;
  let fatChart: any = null;
  let ApexCharts: any = null;
  let fiberChart: any = null;
  let saltChart: any = null;


 
  function createKcalOptions(consumed: number, goal: number) {
    return {
      chart: {
        type: 'radialBar',
        height: 240,
        sparkline: { enabled: true },
      },
      plotOptions: {
        radialBar: {
          hollow: { size: '50%' },
          dataLabels: {
            name: {
              show: true,
              offsetY: -4,
              formatter: () => `${Math.round(consumed)}`,
              color: '#60a5fa',
              fontSize: '20px',
            },
            value: {
              show: true,
              offsetY: 6,
              formatter: () => `de ${Math.round(goal)}`,
              color: '#9ca3af',
              fontSize: '15px',
            }
          }
        }
      },
      series: [Math.min((consumed / goal) * 100, 100)],
      labels: ['Calories'],
      colors: ['#60a5fa']
    };
  }

  function createMacroOptions(consumed: number, goal: number, color: string) {
    return {
      chart: {
        type: 'radialBar',
        height: 120,
        sparkline: { enabled: true },
      },
      plotOptions: {
        radialBar: {
          hollow: { size: '30%' },
          dataLabels: {
            name: { show: false },
            value: {
              fontSize: '15px',
              fontWeight: 600,
              color,
              offsetY: 4,
              formatter: () => `${Math.round(consumed)}g`
            }
          }
        }
      },
      series: [Math.min((consumed / goal) * 100, 100)],
      labels: [],
      colors: [color]
    };
  }

  function renderChart(chartRef: any, selector: string, options: any): any {
    const div = document.querySelector(selector);
    if (!div) return chartRef;

    if (chartRef) {
      chartRef.updateOptions(options);
      chartRef.updateSeries(options.series);
    } else {
      chartRef = new ApexCharts(div, options);
      chartRef.render();
    }
    return chartRef;
  }

  async function renderAllCharts() {
    await tick();
    kcalChart = renderChart(kcalChart, '.kcal-chart', createKcalOptions(totalMacros.kcal, kcalGoal));
    proteinChart = renderChart(proteinChart, '.protein-chart', createMacroOptions(totalMacros.protein, proteinGoal, '#e25822'));
    carbsChart = renderChart(carbsChart, '.carbs-chart', createMacroOptions(totalMacros.carbs, carbsGoal, '#fbbf24'));
    fatChart = renderChart(fatChart, '.fat-chart', createMacroOptions(totalMacros.fat, fatGoal, '#9d7dfc'));
    fiberChart = renderChart(fiberChart, '.fiber-chart', createMacroOptions(totalMacros.fiber, fiberGoal, '#6b8e23'));
    saltChart = renderChart(saltChart, '.salt-chart', createMacroOptions(totalMacros.salt, saltGoal, '#8baac9'));
  }

  onMount(async () => {
    initDB();
    const module = await import('apexcharts');
    ApexCharts = module.default || module;

    //totalMacros = await getDailyMacros(today);
    await renderAllCharts();
  });

  onDestroy(() => {
    kcalChart?.destroy();
    proteinChart?.destroy();
    carbsChart?.destroy();
    fatChart?.destroy();
    fiberChart?.destroy();
    saltChart?.destroy();
  });
</script>

<section class="bg-black min-h-screen text-white font-sans flex flex-col items-center justify-start pt-8 space-y-8">
  <h1 class="text-lg text-gray-400">Hoy, {dia}</h1>

  <div class="summary-card w-full max-w-md px-6 py-6">
    <div class="relative flex flex-col items-center gap-1">
      <span class="label-calories mb-1 select-none">Calorías</span>
      <div class="kcal-chart w-[160px] h-[160px]"></div>
    </div>

    <div class="grid grid-cols-3 gap-6 mt-8">
      <div class="flex flex-col items-center space-y-1">
        <span class="label-carbs select-none mb-1">Carbos</span>
        <div class="carbs-chart w-[80px] h-[80px]"></div>
      </div>
      <div class="flex flex-col items-center space-y-1">
        <span class="label-protein select-none mb-1">Proteína</span>
        <div class="protein-chart w-[80px] h-[80px]"></div>
      </div>
      <div class="flex flex-col items-center space-y-1">
        <span class="label-fat select-none mb-1">Grasas</span>
        <div class="fat-chart w-[80px] h-[80px]"></div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-6 mt-8">
      <div class="flex flex-col items-center space-y-1">
        <span class="label-fiber select-none mb-1">Fibra</span>
        <div class="fiber-chart w-[80px] h-[80px]"></div>
      </div>
      <div class="flex flex-col items-center space-y-1">
        <span class="label-salt select-none mb-1">Sal</span>
        <div class="salt-chart w-[80px] h-[80px]"></div>
      </div>
    </div>
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
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }

  .label-calories {
    color: #60a5fa;
    font-weight: 700;
    font-family: 'Poppins', sans-serif;
    font-style: italic;
    letter-spacing: 0.1em;
    text-shadow: 1px 1px 2px rgba(40, 130, 220, 0.8);
    user-select: none;
    font-size: 16px;
    margin-bottom: -15px;
  }

  .label-carbs {
    color: #fbbf24;
    font-weight: 700;
    font-family: 'Poppins', sans-serif;
    font-style: italic;
    letter-spacing: 0.1em;
    text-shadow: 1px 1px 2px rgba(20, 140, 90, 0.8);
    user-select: none;
    font-size: 13px;
    margin-bottom: -10px;

  }

  .label-protein {
    color: #e25822;
    font-weight: 700;
    font-family: 'Poppins', sans-serif;
    font-style: italic;
    letter-spacing: 0.1em;
    text-shadow: 1px 1px 2px rgba(180, 140, 20, 0.8);
    user-select: none;
    font-size: 13px;
    margin-bottom: -10px;
  }

  .label-fat {
    color: #9d7dfc;
    font-weight: 700;
    font-family: 'Poppins', sans-serif;
    font-style: italic;
    letter-spacing: 0.1em;
    text-shadow: 1px 1px 2px rgba(100, 80, 230, 0.8);
    user-select: none;
    font-size: 13px;
    margin-bottom: -10px;
  }

  .label-fiber {
    color: #6b8e23;
    font-weight: 700;
    font-family: 'Poppins', sans-serif;
    font-style: italic;
    letter-spacing: 0.1em;
    text-shadow: 1px 1px 2px rgba(80, 120, 30, 0.8);
    user-select: none;
    font-size: 13px;
    margin-bottom: -10px;
  }

  .label-salt {
    color: #8baac9;
    font-weight: 700;
    font-family: 'Poppins', sans-serif;
    font-style: italic;
    letter-spacing: 0.1em;
    text-shadow: 1px 1px 2px rgba(70, 90, 110, 0.8);
    user-select: none;
    font-size: 13px;
    margin-bottom: -10px;
  }
</style>

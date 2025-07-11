<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';

  export let kcalGoal: number;
  export let consumed: number;

  let kcalChart: any = null;
  let ApexCharts: any = null;

  function createKcalOptions(consumed: number, goal: number) {
    return {
      chart: {
        type: 'radialBar',
        height: 90,
        width: 90,
        sparkline: { enabled: true }
      },
      plotOptions: {
        radialBar: {
          hollow: { size: '30%' },
          dataLabels: {
            name: {
              show: false
            },
            value: {
              show: false,
              color: '#60a5fa',
              fontSize: '16px',
              fontWeight: 600,
              offsetY: 4
            }
          }
        }
      },
      series: [Math.min((consumed / goal) * 100, 100)],
      labels: [],
      colors: ['#60a5fa']
    };
  }

  function renderChart() {
    const el = document.querySelector('.kcal-chart-small');
    if (!el) return;
    const options = createKcalOptions(consumed, kcalGoal);

    if (kcalChart) {
      kcalChart.updateOptions(options);
      kcalChart.updateSeries(options.series);
    } else {
      kcalChart = new ApexCharts(el, options);
      kcalChart.render();
    }
  }

  onMount(async () => {
    const module = await import('apexcharts');
    ApexCharts = module.default || module;
    await tick();
    renderChart();
  });

  onDestroy(() => {
    kcalChart?.destroy();
  });

  // Reactivo a cambios
  $: if (ApexCharts) {
    renderChart();
  }
</script>

<div class="kcal-chart-small w-[90px] h-[90px]"></div>

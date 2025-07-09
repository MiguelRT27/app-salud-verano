<script lang="ts">
	import { onMount } from 'svelte';
	import { getCurrentWeekMacros } from '$lib/db';

	let ApexCharts: any;
	let chart: any = null;

	let series: number[] = [];
	let categories: string[] = [];

	let average = 0;

	async function loadData() {
		const data = await getCurrentWeekMacros();
		series = data.map((d) => d.kcal);
		categories = data.map((d) => d.day);

		const total = series.reduce((sum, val) => sum + val, 0);
		average = series.length > 0 ? Math.round(total / series.length) : 0;

		renderChart();
	}

	function renderChart() {
		const options = {
			chart: {
				type: 'bar',
				height: 250,
				toolbar: { show: false },
				animations: { enabled: false }
			},
			plotOptions: {
				bar: {
					borderRadius: 4,
					columnWidth: '40%'
				}
			},
			dataLabels: { enabled: false },
			xaxis: {
				categories,
				labels: {
					style: {
						colors: '#9ca3af',
						fontSize: '14px'
					}
				}
			},
			yaxis: {
				labels: {
					style: {
						colors: '#9ca3af',
						fontSize: '12px'
					}
				}
			},
			series: [
				{
					name: 'Kcal',
					data: series
				}
			],
			colors: ['#60a5fa'],
			grid: {
				borderColor: '#374151',
				strokeDashArray: 4
			},
			tooltip: {
				y: {
					formatter: (val: number) => `${val} kcal`
				}
			}
		};

		const el = document.querySelector('#weekly-kcal-chart');
		if (!el) return;
		if (chart) {
			chart.updateOptions(options);
			chart.updateSeries(options.series);
		} else {
			chart = new ApexCharts(el, options);
			chart.render();
		}
	}

	onMount(async () => {
		const module = await import('apexcharts');
		ApexCharts = module.default || module;
		await loadData();
	});
</script>

<div class="summary-card w-full max-w-md px-6 py-6">
	<h2 class="mb-4 text-lg font-semibold text-white">Resumen semanal (kcal)</h2>
	<div id="weekly-kcal-chart" class="h-[250px] w-full"></div>
	<div class="text-slight-white mt-4 text-center text-sm">
		Media semanal: <span class="text-slight-white font-semibold">{average}</span> kcal
	</div>
</div>

<style>
	h2 {
		color: #ededed;
		font-size: 1.35rem;
		font-weight: 600;
		margin-bottom: 1rem;
		margin-top: auto;
	}

	.text-slight-white {
		color: #ededed;
	}
</style>

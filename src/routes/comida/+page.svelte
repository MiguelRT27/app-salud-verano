<script lang="ts">
	import { onMount } from 'svelte';
	import {
		getDailyMacros,
		searchMealsByDate,
		initDB
	} from '$lib/db';
	import type { Meal } from '$lib/db';
	import { format } from 'date-fns';
	import { es } from 'date-fns/locale';
	import MealItemLine from '$lib/components/MealItemLine.svelte';
	import { getMealEmoji, capitalize } from '$lib/utils';
	import { Plus } from 'lucide-svelte';
	import DailyMacroSummary from '$lib/components/DailyMacroSum.svelte';
	import { goto } from '$app/navigation';

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

	let meals: Meal[] = [];

	const mealTypes = ['desayuno', 'comida', 'cena', 'otros'];

	onMount(async () => {
		initDB();
		totalMacros = await getDailyMacros(today);
		meals = await searchMealsByDate(today);
	});

	function getMealByType(type: string) {
		return meals.find((meal) => meal.mealType === type);
	}

	$: mealsByType = mealTypes.map(type => ({ type, meal: getMealByType(type) }));

	function handleAddFood(type: string) {
		goto(`/comida/meal/add?type=${type}`);
	}

	function handleAddNewMeal() {
        goto('/comida/meal/add');
    }

</script>

<section class="flex min-h-screen flex-col items-center space-y-8 bg-black pt-8 font-sans text-white">
	<h1 class="text-lg text-gray-400">Hoy, {dia}</h1>

	<div class="summary-card w-full max-w-md px-6 py-6">
		<DailyMacroSummary
			{totalMacros}
			{kcalGoal}
			{proteinGoal}
			{carbsGoal}
			{fatGoal}
			{fiberGoal}
			{saltGoal}
			showTitle={false}
		/>
	</div>

	
    <div class="add-meal-wrapper">
        <button class="add-meal-button" on:click={handleAddNewMeal}>
            <Plus size={22} /> Añadir nueva comida
        </button>
    </div>

	{#each mealsByType as entry}
		<div class="summary-card w-full max-w-md px-4 py-4">
			<h2 class="h2-text flex items-center gap-2">
				{getMealEmoji(entry.type)}
				{capitalize(entry.type)}
			</h2>

			{#if entry.meal && entry.meal.items.length > 0}
				<ul class="w-full space-y-1 text-sm">
					{#each entry.meal.items as item}
						<MealItemLine {item} />
					{/each}
				</ul>
			{:else}
				<p class="text-sm text-gray-400 italic">(vacío)</p>
			{/if}

			<button
				class="mt-2 text-sm text-blue-400 underline"
				on:click={() => handleAddFood(entry.type)}
			>
				[+] Añadir alimento
			</button>
		</div>
	{/each}
</section>

<style>
	section {
		font-family: 'Inter', sans-serif;
	}
	.summary-card {
		background-color: #1f2937;
		border-radius: 12px;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
		padding: 24px 20px;
		max-width: 400px;
		width: 90vw;
		margin: 12px auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
	}
	.h2-text {
		color: #ededed;
		font-size: 1.25rem;
		font-weight: 600;
		white-space: nowrap;
	}
	.add-meal-wrapper {
		max-width: 400px;
		width: 90vw;
		margin: 0 auto 2rem auto;
		display: flex;
		justify-content: center;
	}
	.add-meal-button {
		background-color: #4f46e5;
		color: white;
		font-size: 1rem;
		font-weight: 600;
		padding: 0.85rem 1.5rem;
		border-radius: 0.75rem;
		box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
		transition: background-color 0.2s ease, transform 0.1s ease;
	}
	.add-meal-button:hover {
		background-color: #6366f1;
		transform: translateY(-1px);
	}
</style>

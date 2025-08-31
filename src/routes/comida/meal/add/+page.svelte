<script lang="ts">
	import { onMount } from 'svelte';
	import { format } from 'date-fns';
	import { goto } from '$app/navigation';
	import {
		addMeal,
		getFoodItems,
		searchFoodItemsByName,
		type MealItem,
		type FoodItem,
		type Meal,
		MealType
	} from '$lib/db';

	let foodItems: FoodItem[] = [];
	let query = '';
	let searchResults: FoodItem[] = [];
	let selectedFoodId: number | null = null;
	let quantity = 100;

	 let addedItems: MealItem[] = [];
    export let data: { mealType: string | null };
    let mealTypeParam = data.mealType;

    // Variable editable para el select del tipo de comida. Puede ser null.
    let selectedMealType: MealType | null = null;
	

	onMount(async () => {
		foodItems = await getFoodItems();
		searchResults = foodItems;

		// Inicializamos el select con el valor que viene de la URL (si válido)
		if (mealTypeParam && Object.values(MealType).includes(mealTypeParam as MealType)) {
			selectedMealType = mealTypeParam as MealType;
		}
	});

	// Buscar en tiempo real
	$: if (query.trim().length > 0) {
		searchFoodItemsByName(query.trim().toLowerCase()).then(results => {
			searchResults = results;
		});
	} else {
		searchResults = foodItems;
	}

	function addItem() {
		if (selectedFoodId != null && quantity > 0) {
			addedItems.push({
				foodId: selectedFoodId,
				quantityGrams: quantity
			});
			// Reset
			selectedFoodId = null;
			query = '';
			quantity = 100;
		}
	}

	async function saveMeal() {
		if (addedItems.length === 0) {
			alert('No puedes guardar una comida vacía.');
			return;
		}
		
        if (!selectedMealType) {
            alert('Por favor, selecciona un tipo de comida.');
            return;
        }

		const newMeal: Meal = {
			datetime: new Date().toISOString(),
			mealType: selectedMealType,
			items: addedItems
		};

		await addMeal(newMeal);
		goto('/comida'); // volver al resumen diario
	}
</script>

<section class="bg-black min-h-screen text-white font-sans flex flex-col items-center pt-8 space-y-6">
	<h1 class="text-lg text-gray-400">Nueva comida: {selectedMealType}</h1>

	<div class="summary-card w-full max-w-md">
		<label for="mealType" class="text-white text-base font-semibold mb-2 block">Tipo de comida</label>
		<select
			id="mealType"
			bind:value={selectedMealType}
			class="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 mb-4"
		>
			<option value={MealType.Desayuno}>Desayuno</option>
			<option value={MealType.Comida}>Comida</option>
			<option value={MealType.Cena}>Cena</option>
			<option value={MealType.Otros}>Otros</option>
		</select>

		<h2 class="text-white text-base font-semibold mb-2">Buscar alimento</h2>
		
		<input
			type="text"
			bind:value={query}
			placeholder="Buscar alimento..."
			class="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none mb-2"
		/>

		<select bind:value={selectedFoodId} class="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 mb-4">
			<option disabled selected value="">Selecciona un alimento</option>
			{#each searchResults as food}
				<option value={food.id}>{food.name}</option>
			{/each}
		</select>

		<label for="quantityGrams" class="text-sm text-gray-300 mb-1 block mt-4">Cantidad (g):</label>
		<input
			id="quantityGrams"
			type="number"
			bind:value={quantity}
			min="1"
			class="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 mb-6"
		/>

		<div class="flex justify-between mt-4">

			<a href="/comida/fooditems/add" class="text-sm text-blue-400 underline self-center">+ Nuevo alimento</a>

			<button on:click={addItem} class="add-foodItem-button">
				Añadir alimento
			</button>

		
		</div>
	</div>

	<div class="summary-card w-full max-w-md">
		<h2 class="text-white text-base font-semibold mb-2">Alimentos añadidos</h2>
		{#if addedItems.length === 0}
			<p class="text-sm text-gray-400 italic">(vacío)</p>
		{:else}
			<ul class="text-sm text-white space-y-1">
				{#each addedItems as item, i}
					<li>
						{foodItems.find(f => f.id === item.foodId)?.name || '??'} - {item.quantityGrams}g
					</li>
				{/each}
			</ul>
		{/if}
	</div>

	<div class="mb-8">
		<button on:click={saveMeal} class="add-meal-button">
			Guardar comida
		</button>
	</div>
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
	.add-foodItem-button {
		background-color: #4f46e5;
		color: white;
		font-size: .9rem;
		font-weight: 600;
		padding: 0.65rem 1.5rem;
		border-radius: 0.75rem;
		box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
		transition: background-color 0.2s ease, transform 0.1s ease;
	}
	.add-meal-button:hover {
		background-color: #6366f1;
		transform: translateY(-1px);
	}
</style>

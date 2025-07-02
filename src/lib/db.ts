import { openDB, type DBSchema, type IDBPDatabase} from 'idb';

// Definición del enum con tipos de alimentos
export enum FoodType { 
  Fruta = 'fruta',
  Verdura = 'verdura',
  Carne = 'carne',
  Pescado = 'pescado',
  Suplemento = 'suplemento',
  Bebida = 'bebida',
  Otro = 'otro',
}

interface Macros {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  salt: number;
}


// Representa un alimento con sus propiedades nutricionales por 100 gramos
interface FoodItem { 
  id?: number;        // auto-incremental
  name: string;
  macros: Macros;
  type?: FoodType; // opcional 
}

// Representa un los gramos consumidos de un alimento de una comida
interface MealItem { 
  foodId: number;
  quantityGrams: number;
}

export enum MealType {
    Desayuno = 'desayuno',
    Almuerzo = 'almuerzo',
    Comida = 'comida',
    Merienda = 'merienda',
    Cena = 'cena',
    Snack = 'snack',
    Otro = 'otro',
    }

interface Meal {
  id?: number;            // auto-incremental
  userId?: number;        // opcional si hay usuarios en futuro
  datetime: string;       // ISO 8601 completo, ej: '2025-07-02T08:30:00Z'
  mealType: MealType;       
  items: MealItem[];      // lista de alimentos consumidos en la comida
  notes?: string;         // opcional, comentarios sobre la comida   

}

interface MyDB extends DBSchema {
  foodItems: {
    key: number;
    value: FoodItem;
    indexes: { 'by-name': string };
  };
  meals: {
    key: number;
    value: Meal;
    indexes: { 'by-date': string; 'by-mealType': string };
  };
}

let dbPromise: Promise<IDBPDatabase<MyDB>>;

export function initDB() {
  dbPromise = openDB<MyDB>('appSaludDB', 1, {
    upgrade(db) {
      const foodStore = db.createObjectStore('foodItems', {
        keyPath: 'id',
        autoIncrement: true,
      });
      foodStore.createIndex('by-name', 'name');

      const mealStore = db.createObjectStore('meals', {
        keyPath: 'id',
        autoIncrement: true,
      });
      mealStore.createIndex('by-date', 'datetime');
      mealStore.createIndex('by-mealType', 'mealType');
    },
  });
}

// FoodItem CRUD

export async function addFoodItem(food: FoodItem) {
  const db = await dbPromise;
  return db.add('foodItems', food);
}

export async function getFoodItems() {
  const db = await dbPromise;
  return db.getAll('foodItems');
}
export async function updateFoodItem(food: FoodItem) {
  const db = await dbPromise;
  if (!food.id) {
    throw new Error("El objeto FoodItem debe tener un id para actualizarse");
  }
  return db.put('foodItems', food);
}

export async function deleteFoodItem(id: number) {
  const db = await dbPromise;
  return db.delete('foodItems', id);
}


export async function getFoodItemById(id: number) {
  const db = await dbPromise;
  return db.get('foodItems', id);
}

export async function searchFoodItemsByName(query: string) {
  const db = await dbPromise;
  const tx = db.transaction('foodItems');
  const store = tx.objectStore('foodItems');
  const index = store.index('by-name');

  // Búsqueda por prefijo (los nombres que empiecen por query)
  const range = IDBKeyRange.bound(query, query + '\uffff');
  const results = [];
  let cursor = await index.openCursor(range);

  while (cursor) {
    results.push(cursor.value);
    cursor = await cursor.continue();
  }

  return results;
}



// Meal CRUD

export async function addMeal(meal: Meal) {
  const db = await dbPromise;
  return db.add('meals', meal);
}

export async function getMeals() {
  const db = await dbPromise;
  return db.getAll('meals');
}

export async function getMealById(id: number) {
  const db = await dbPromise;
  return db.get('meals', id);
}

// Actualizar un meal por id (reemplaza el objeto entero)
export async function updateMeal(id: number, updatedMeal: Meal) {
  const db = await dbPromise;
  // Asegúrate que updatedMeal.id = id para mantener consistencia
  updatedMeal.id = id;
  return db.put('meals', updatedMeal);
}

// Borrar un meal por id
export async function deleteMeal(id: number) {
  const db = await dbPromise;
  return db.delete('meals', id);
}

// Buscar meals por tipo (MealType) usando índice
export async function searchMealsByType(mealType: MealType) {
  const db = await dbPromise;
  const tx = db.transaction('meals');
  const store = tx.objectStore('meals');
  const index = store.index('by-mealType');
  const range = IDBKeyRange.only(mealType);
  return index.getAll(range);
}

// Buscar meals por fecha (sin tener en cuenta la hora) usando rango en índice
export async function searchMealsByDate(date: string) {
  const db = await dbPromise;
  const tx = db.transaction('meals');
  const store = tx.objectStore('meals');
  const index = store.index('by-date');
  const range = IDBKeyRange.bound(date, date + '\uffff');
  return index.getAll(range);
}


// MACROS


function calcMacros(food: FoodItem, grams: number): Macros {
  const factor = grams / 100;

  return {
    kcal: food.macros.kcal * factor,
    protein: food.macros.protein * factor,
    carbs: food.macros.carbs * factor,
    fat: food.macros.fat * factor,
    fiber: food.macros.fiber * factor,
    salt: food.macros.salt * factor,
  };
}


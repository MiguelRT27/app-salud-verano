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

export interface Macros {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  salt: number;
}


// Representa un alimento con sus propiedades nutricionales por 100 gramos
export interface FoodItem { 
  id?: number;        // auto-incremental
  name: string;
  macros: Macros;
  type?: FoodType; // opcional 
}

// Representa un los gramos consumidos de un alimento de una comida
export interface MealItem { 
  foodId: number;
  quantityGrams: number;
}

export enum MealType {
    Desayuno = 'desayuno',
    Comida = 'comida',
    Cena = 'cena',
    Otros = 'otros',
    }

export interface Meal {
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


export function calcMacros(food: FoodItem, grams: number): Macros {
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

// Calcular macros totales de una comida
export async function calcTotalMacrosForMeal(meal: Meal): Promise<Macros> {
  const db = await dbPromise;
  const total: Macros = {
    kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, salt: 0
  };

  for (const item of meal.items) {
    if (item.quantityGrams <= 0) continue; 

    const food = await db.get('foodItems', item.foodId);
    if (!food) continue;

    const macros = calcMacros(food, item.quantityGrams);

    total.kcal += macros.kcal;
    total.protein += macros.protein;
    total.carbs += macros.carbs;
    total.fat += macros.fat;
    total.fiber += macros.fiber;
    total.salt += macros.salt;
  }

  return total;
}

// Obtener macros diarios totales
export async function getDailyMacros(date: string): Promise<Macros> {
  const meals = await searchMealsByDate(date);
  const foodItems = await getFoodItems(); // Usamos esto para resolver los foodId

  const macros: Macros = {
    kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, salt: 0
  };

  for (const meal of meals) {
    for (const item of meal.items) {
      if (item.quantityGrams <= 0) continue;
      const food = foodItems.find(f => f.id === item.foodId);
      if (food) {
        const itemMacros = calcMacros(food, item.quantityGrams);
        macros.kcal += itemMacros.kcal;
        macros.protein += itemMacros.protein;
        macros.carbs += itemMacros.carbs;
        macros.fat += itemMacros.fat;
        macros.fiber += itemMacros.fiber;
        macros.salt += itemMacros.salt;
      }
    }
  }

  return macros;
}

// Obtener macros semanales totales
export async function getWeeklyMacros(endDate: string): Promise<Macros> {
  const end = new Date(endDate);
  const macrosTotal: Macros = {
    kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, salt: 0
  };

  for (let i = 6; i >= 0; i--) {
    const currentDate = new Date(end);
    currentDate.setDate(end.getDate() - i);
    const isoDate = currentDate.toISOString().slice(0, 10); // YYYY-MM-DD

    const dailyMacros = await getDailyMacros(isoDate);
    macrosTotal.kcal += dailyMacros.kcal;
    macrosTotal.protein += dailyMacros.protein;
    macrosTotal.carbs += dailyMacros.carbs;
    macrosTotal.fat += dailyMacros.fat;
    macrosTotal.fiber += dailyMacros.fiber;
    macrosTotal.salt += dailyMacros.salt;
  }

  return macrosTotal;
}

// Devuelve los macros diarios desde el lunes hasta el domingo de esta semana
export async function getCurrentWeekMacros(): Promise<
  { day: string; kcal: number }[]
> {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado

  // Día lunes de esta semana
  const monday = new Date(now);
  const diffToMonday = (dayOfWeek + 6) % 7; // convierte 0(D)→6, 1(L)→0...
  monday.setDate(now.getDate() - diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const dayLabels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const result: { day: string; kcal: number }[] = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const iso = date.toISOString().slice(0, 10);
    const macros = await getDailyMacros(iso);
    result.push({ day: dayLabels[i], kcal: macros.kcal });
  }

  return result;
}



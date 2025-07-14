// +page.ts
import type { PageLoad } from './$types';
import { MealType } from '$lib/db';

export const load: PageLoad = ({ url }) => {
  const tipoParam = url.searchParams.get('type')?.toLowerCase();
  const mealType = tipoParam && Object.values(MealType).includes(tipoParam as MealType)
    ? tipoParam
    : null;

  return {
    mealType,
  };
};

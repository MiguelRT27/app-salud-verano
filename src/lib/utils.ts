export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getMealEmoji(mealType: string): string {
  switch (mealType) {
    case 'desayuno': return '🍳';
    case 'almuerzo': return '🥪';
    case 'comida': return '🍽️';
    case 'merienda': return '🍪';
    case 'cena': return '🌙';
    case 'snack': return '🍫';
    default: return '🍴';
  }
}

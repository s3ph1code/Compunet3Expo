/**
 * Constantes compartidas de la capa de datos.
 * Cualquier cambio aquí afecta al resto del equipo (ver Contexto/DATA_MODEL.md).
 */

// Clave única de AsyncStorage bajo la que vive el array completo de transacciones.
export const STORAGE_KEY = 'transactions';

export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
};

export const EXPENSE_CATEGORIES = [
  'Comida',
  'Transporte',
  'Servicios',
  'Entretenimiento',
  'Salud',
  'Otros',
];

export const INCOME_CATEGORIES = ['Salario', 'Freelance', 'Regalo', 'Otros'];

/**
 * Devuelve las categorías válidas para un tipo de transacción.
 * @param {string} type "income" o "expense"
 * @returns {string[]} categorías permitidas; array vacío si el tipo no es válido
 */
export function getCategoriesForType(type) {
  if (type === TRANSACTION_TYPES.INCOME) return INCOME_CATEGORIES;
  if (type === TRANSACTION_TYPES.EXPENSE) return EXPENSE_CATEGORIES;
  return [];
}

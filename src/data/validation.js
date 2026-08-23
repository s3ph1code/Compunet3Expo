import { TRANSACTION_TYPES, getCategoriesForType } from './constants';

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Comprueba que la fecha tenga formato "YYYY-MM-DD" y que además exista en el calendario.
 * @param {string} value
 * @returns {boolean}
 */
function isValidIsoDate(value) {
  if (typeof value !== 'string' || !ISO_DATE_PATTERN.test(value)) return false;

  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return false;

  // Descarta fechas como "2026-02-31", que Date normalizaría en silencio a marzo.
  return date.toISOString().slice(0, 10) === value;
}

/**
 * Revisa los campos que puede enviar el usuario al crear o editar una transacción.
 * @param {Object} input objeto con type, amount, category, date y note opcional
 * @returns {string[]} lista de errores encontrados; vacía si la transacción es válida
 */
export function getValidationErrors(input) {
  if (!input || typeof input !== 'object') {
    return ['La transacción debe ser un objeto.'];
  }

  const errors = [];
  const { type, amount, category, date, note } = input;

  const validTypes = Object.values(TRANSACTION_TYPES);
  if (!validTypes.includes(type)) {
    errors.push(`type debe ser uno de: ${validTypes.join(', ')}.`);
  }

  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
    errors.push('amount debe ser un número positivo.');
  }

  // Solo validamos la categoría si el tipo es válido; si no, ya reportamos ese error.
  const allowedCategories = getCategoriesForType(type);
  if (allowedCategories.length > 0 && !allowedCategories.includes(category)) {
    errors.push(
      `category "${category}" no es válida para type "${type}". Válidas: ${allowedCategories.join(', ')}.`
    );
  }

  if (!isValidIsoDate(date)) {
    errors.push('date debe tener formato ISO "YYYY-MM-DD" y ser una fecha real.');
  }

  if (note !== undefined && note !== null && typeof note !== 'string') {
    errors.push('note debe ser un string (puede ir vacío).');
  }

  return errors;
}

/**
 * Igual que getValidationErrors, pero lanza si algo está mal.
 * @param {Object} input
 * @returns {void}
 * @throws {Error} con todos los problemas encontrados en un solo mensaje
 */
export function assertValidTransaction(input) {
  const errors = getValidationErrors(input);
  if (errors.length > 0) {
    throw new Error(`Transacción inválida: ${errors.join(' ')}`);
  }
}

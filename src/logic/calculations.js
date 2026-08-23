import { TRANSACTION_TYPES } from '../data/constants';

/**
 * Todas las funciones de este archivo son puras y síncronas: reciben el array de
 * transacciones y devuelven un resultado, sin tocar AsyncStorage ni React.
 * Eso las hace triviales de probar y de reutilizar desde cualquier pantalla.
 */

/**
 * Extrae la clave de mes "YYYY-MM" a partir de una fecha "YYYY-MM-DD".
 * @param {string} date
 * @returns {string} el mes, o "" si la fecha no es un string
 */
export function getMonthKey(date) {
  return typeof date === 'string' ? date.slice(0, 7) : '';
}

/**
 * Suma los ingresos y los gastos de un conjunto de transacciones.
 * @param {Array} transactions
 * @returns {{income: number, expense: number, balance: number}}
 */
export function getTotals(transactions = []) {
  let income = 0;
  let expense = 0;

  for (const transaction of transactions) {
    if (transaction.type === TRANSACTION_TYPES.INCOME) {
      income += transaction.amount;
    } else if (transaction.type === TRANSACTION_TYPES.EXPENSE) {
      expense += transaction.amount;
    }
  }

  return { income, expense, balance: income - expense };
}

/**
 * Balance actual: total de ingresos menos total de gastos.
 * @param {Array} transactions
 * @returns {number} puede ser negativo si se gastó más de lo que se ingresó
 */
export function getBalance(transactions = []) {
  return getTotals(transactions).balance;
}

/**
 * Total acumulado por categoría, de mayor a menor.
 * Por defecto suma gastos, que es lo que usa la gráfica de estadísticas.
 * @param {Array} transactions
 * @param {string|null} [month] mes "YYYY-MM" para filtrar; null o ausente = todos los meses
 * @param {string} [type] "expense" (por defecto) o "income"
 * @returns {Array<{category: string, total: number}>} solo categorías con movimientos
 */
export function getTotalsByCategory(
  transactions = [],
  month = null,
  type = TRANSACTION_TYPES.EXPENSE
) {
  const totals = new Map();

  for (const transaction of transactions) {
    if (transaction.type !== type) continue;
    if (month && getMonthKey(transaction.date) !== month) continue;

    const previous = totals.get(transaction.category) ?? 0;
    totals.set(transaction.category, previous + transaction.amount);
  }

  return [...totals.entries()]
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}

/**
 * Totales agrupados por mes, del mes más antiguo al más reciente.
 * Pensado para la gráfica de tendencia mensual.
 * @param {Array} transactions
 * @returns {Array<{month: string, income: number, expense: number, balance: number}>}
 */
export function getMonthlyTotals(transactions = []) {
  const months = new Map();

  for (const transaction of transactions) {
    const month = getMonthKey(transaction.date);
    if (!month) continue;

    if (!months.has(month)) {
      months.set(month, { month, income: 0, expense: 0, balance: 0 });
    }

    const entry = months.get(month);
    if (transaction.type === TRANSACTION_TYPES.INCOME) {
      entry.income += transaction.amount;
    } else if (transaction.type === TRANSACTION_TYPES.EXPENSE) {
      entry.expense += transaction.amount;
    }
    entry.balance = entry.income - entry.expense;
  }

  return [...months.values()].sort((a, b) => (a.month < b.month ? -1 : 1));
}

/**
 * Filtra transacciones por mes, categoría y/o tipo.
 * Los filtros que no se indiquen simplemente no se aplican.
 * @param {Array} transactions
 * @param {{month?: string, category?: string, type?: string}} [filters]
 * @returns {Array} array nuevo con las transacciones que pasan todos los filtros
 */
export function filterTransactions(transactions = [], filters = {}) {
  const { month, category, type } = filters;

  return transactions.filter((transaction) => {
    if (month && getMonthKey(transaction.date) !== month) return false;
    if (category && transaction.category !== category) return false;
    if (type && transaction.type !== type) return false;
    return true;
  });
}

/**
 * Lista de meses con movimientos, del más reciente al más antiguo.
 * Útil para llenar el selector de mes del historial.
 * @param {Array} transactions
 * @returns {string[]} meses en formato "YYYY-MM", sin repetidos
 */
export function getAvailableMonths(transactions = []) {
  const months = new Set();

  for (const transaction of transactions) {
    const month = getMonthKey(transaction.date);
    if (month) months.add(month);
  }

  return [...months].sort((a, b) => (a < b ? 1 : -1));
}

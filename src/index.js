/**
 * Punto de entrada único de la capa de datos y lógica.
 *
 * Las pantallas y los componentes deberían importar SOLO desde aquí:
 *   import { useTransactions, EXPENSE_CATEGORIES } from '../src';
 *
 * Así el resto del equipo no depende de la estructura interna de src/data/
 * ni de src/logic/, y podemos reorganizar por dentro sin romperles nada.
 */

// Lo que usa la UI en el 90% de los casos.
export { useTransactions } from './hooks/useTransactions';

// Categorías y tipos, para llenar selectores y formularios.
export {
  TRANSACTION_TYPES,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  getCategoriesForType,
} from './data/constants';

// CRUD directo, por si hace falta usarlo fuera de un componente de React.
export {
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getAllTransactions,
  getTransactionById,
  clearAllTransactions,
} from './data/transactionsRepository';

// Cálculos puros, por si se quieren aplicar a una lista ya filtrada.
export {
  getBalance,
  getTotals,
  getTotalsByCategory,
  getMonthlyTotals,
  filterTransactions,
  getAvailableMonths,
  getMonthKey,
} from './logic/calculations';

// Datos de prueba (solo desarrollo).
export { MOCK_TRANSACTIONS, seedMockData } from './data/mockData';

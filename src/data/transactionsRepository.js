import { loadTransactions, saveTransactions, clearStorage } from './storage';
import { assertValidTransaction } from './validation';

/**
 * Genera un id único para una transacción.
 * El sufijo aleatorio evita colisiones cuando se crean dos en el mismo milisegundo.
 * @returns {string} por ejemplo "1692720000000-a3f9k2"
 */
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Ordena de la fecha más reciente a la más antigua.
 * Si dos transacciones son del mismo día, va primero la registrada después.
 * @param {Array} transactions
 * @returns {Array} un array nuevo, sin mutar el original
 */
function sortByDateDesc(transactions) {
  return [...transactions].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    if (a.createdAt === b.createdAt) return 0;
    return a.createdAt < b.createdAt ? 1 : -1;
  });
}

/**
 * Devuelve todas las transacciones guardadas, de la más reciente a la más antigua.
 * @returns {Promise<Array>} array de transacciones (vacío si no hay ninguna)
 */
export async function getAllTransactions() {
  const transactions = await loadTransactions();
  return sortByDateDesc(transactions);
}

/**
 * Busca una transacción por su id.
 * @param {string} id
 * @returns {Promise<Object|null>} la transacción, o null si no existe
 */
export async function getTransactionById(id) {
  const transactions = await loadTransactions();
  return transactions.find((transaction) => transaction.id === id) ?? null;
}

/**
 * Crea una transacción nueva. El id y el createdAt se generan automáticamente.
 * @param {{type: string, amount: number, category: string, date: string, note?: string}} input
 * @returns {Promise<Object>} la transacción creada, ya con id y createdAt
 * @throws {Error} si algún campo es inválido
 */
export async function addTransaction(input) {
  assertValidTransaction(input);

  const transactions = await loadTransactions();
  const transaction = {
    id: generateId(),
    type: input.type,
    // amount llega ya validado como positivo: el signo lo determina type, no el número.
    amount: input.amount,
    category: input.category,
    date: input.date,
    note: input.note ?? '',
    createdAt: new Date().toISOString(),
  };

  await saveTransactions([...transactions, transaction]);
  return transaction;
}

/**
 * Actualiza los campos indicados de una transacción existente.
 * Los campos id y createdAt se ignoran: no se pueden cambiar.
 * @param {string} id
 * @param {Object} changes campos a modificar (type, amount, category, date, note)
 * @returns {Promise<Object>} la transacción ya actualizada
 * @throws {Error} si la transacción no existe o si el resultado sería inválido
 */
export async function updateTransaction(id, changes = {}) {
  const transactions = await loadTransactions();
  const index = transactions.findIndex((transaction) => transaction.id === id);
  if (index === -1) {
    throw new Error(`No existe una transacción con id "${id}".`);
  }

  const { id: ignoredId, createdAt: ignoredCreatedAt, ...safeChanges } = changes;
  const updated = { ...transactions[index], ...safeChanges };
  assertValidTransaction(updated);
  updated.note = updated.note ?? '';

  const next = [...transactions];
  next[index] = updated;
  await saveTransactions(next);
  return updated;
}

/**
 * Elimina una transacción por su id.
 * @param {string} id
 * @returns {Promise<void>}
 * @throws {Error} si la transacción no existe
 */
export async function deleteTransaction(id) {
  const transactions = await loadTransactions();
  const next = transactions.filter((transaction) => transaction.id !== id);

  if (next.length === transactions.length) {
    throw new Error(`No existe una transacción con id "${id}".`);
  }

  await saveTransactions(next);
}

/**
 * Borra todas las transacciones del dispositivo.
 * Pensado para desarrollo y tests.
 * @returns {Promise<void>}
 */
export async function clearAllTransactions() {
  await clearStorage();
}

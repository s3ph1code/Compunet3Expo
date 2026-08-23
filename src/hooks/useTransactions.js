import { useCallback, useEffect, useMemo, useState } from 'react';

import * as repository from '../data/transactionsRepository';
import {
  filterTransactions,
  getAvailableMonths,
  getMonthlyTotals,
  getTotals,
  getTotalsByCategory,
} from '../logic/calculations';

/**
 * Única puerta de entrada para las pantallas.
 *
 * Carga las transacciones al montar, las mantiene en memoria y recalcula los
 * totales cada vez que cambian. Quien lo use no necesita saber que por debajo
 * hay AsyncStorage.
 *
 * @returns {Object} estado y operaciones:
 *   - transactions: array ordenado de la más reciente a la más antigua
 *   - loading: true mientras se lee del dispositivo
 *   - error: el último Error ocurrido, o null
 *   - balance / totals / monthlyTotals / availableMonths: cálculos ya listos
 *   - totalsByCategory(month?, type?) y filter(filtros): consultas sobre lo cargado
 *   - addTransaction / updateTransaction / deleteTransaction / refresh: operaciones async
 */
export function useTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await repository.getAllTransactions();
      setTransactions(data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /**
   * Ejecuta una operación del repositorio, recarga la lista y deja el error a la vista.
   * Vuelve a lanzar para que la pantalla pueda mostrar un mensaje si quiere.
   */
  const run = useCallback(
    async (operation) => {
      try {
        const result = await operation();
        await refresh();
        return result;
      } catch (err) {
        setError(err);
        throw err;
      }
    },
    [refresh]
  );

  const addTransaction = useCallback(
    (input) => run(() => repository.addTransaction(input)),
    [run]
  );

  const updateTransaction = useCallback(
    (id, changes) => run(() => repository.updateTransaction(id, changes)),
    [run]
  );

  const deleteTransaction = useCallback(
    (id) => run(() => repository.deleteTransaction(id)),
    [run]
  );

  const totals = useMemo(() => getTotals(transactions), [transactions]);
  const monthlyTotals = useMemo(() => getMonthlyTotals(transactions), [transactions]);
  const availableMonths = useMemo(() => getAvailableMonths(transactions), [transactions]);

  const totalsByCategory = useCallback(
    (month, type) => getTotalsByCategory(transactions, month, type),
    [transactions]
  );

  const filter = useCallback(
    (filters) => filterTransactions(transactions, filters),
    [transactions]
  );

  return {
    transactions,
    loading,
    error,
    balance: totals.balance,
    totals,
    monthlyTotals,
    availableMonths,
    totalsByCategory,
    filter,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refresh,
  };
}

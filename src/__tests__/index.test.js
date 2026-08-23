import * as api from '../index';

/**
 * El contrato con Persona B y Persona C.
 *
 * Si alguna de estas exportaciones desaparece o cambia de nombre, se rompen las
 * pantallas y las gráficas. Este test es la red de seguridad: falla aquí antes
 * de fallar allá.
 */
const EXPECTED_FUNCTIONS = [
  'useTransactions',
  'getCategoriesForType',
  'addTransaction',
  'updateTransaction',
  'deleteTransaction',
  'getAllTransactions',
  'getTransactionById',
  'clearAllTransactions',
  'getBalance',
  'getTotals',
  'getTotalsByCategory',
  'getMonthlyTotals',
  'filterTransactions',
  'getAvailableMonths',
  'getMonthKey',
  'seedMockData',
];

describe('API pública de src/', () => {
  it.each(EXPECTED_FUNCTIONS)('exporta %s como función', (name) => {
    expect(typeof api[name]).toBe('function');
  });

  it('exporta las categorías acordadas con el equipo', () => {
    expect(api.EXPENSE_CATEGORIES).toEqual([
      'Comida',
      'Transporte',
      'Servicios',
      'Entretenimiento',
      'Salud',
      'Otros',
    ]);
    expect(api.INCOME_CATEGORIES).toEqual(['Salario', 'Freelance', 'Regalo', 'Otros']);
  });

  it('exporta los tipos de transacción', () => {
    expect(api.TRANSACTION_TYPES).toEqual({ INCOME: 'income', EXPENSE: 'expense' });
  });

  it('exporta los datos de prueba', () => {
    expect(Array.isArray(api.MOCK_TRANSACTIONS)).toBe(true);
    expect(api.MOCK_TRANSACTIONS.length).toBeGreaterThan(0);
  });
});

import {
  filterTransactions,
  getAvailableMonths,
  getBalance,
  getMonthKey,
  getMonthlyTotals,
  getTotals,
  getTotalsByCategory,
} from '../calculations';

/**
 * Conjunto fijo y pequeño para poder verificar los números a mano:
 * julio -> ingresos 1000, gastos 500. agosto -> ingresos 500, gastos 100.
 */
const transactions = [
  {
    id: '1',
    type: 'income',
    amount: 1000,
    category: 'Salario',
    date: '2026-07-01',
    note: '',
    createdAt: '2026-07-01T10:00:00.000Z',
  },
  {
    id: '2',
    type: 'expense',
    amount: 300,
    category: 'Comida',
    date: '2026-07-05',
    note: '',
    createdAt: '2026-07-05T10:00:00.000Z',
  },
  {
    id: '3',
    type: 'expense',
    amount: 200,
    category: 'Comida',
    date: '2026-07-20',
    note: '',
    createdAt: '2026-07-20T10:00:00.000Z',
  },
  {
    id: '4',
    type: 'expense',
    amount: 100,
    category: 'Transporte',
    date: '2026-08-02',
    note: '',
    createdAt: '2026-08-02T10:00:00.000Z',
  },
  {
    id: '5',
    type: 'income',
    amount: 500,
    category: 'Freelance',
    date: '2026-08-10',
    note: '',
    createdAt: '2026-08-10T10:00:00.000Z',
  },
];

describe('getMonthKey', () => {
  it('extrae el mes de una fecha ISO', () => {
    expect(getMonthKey('2026-08-22')).toBe('2026-08');
  });

  it('devuelve "" si no recibe un string', () => {
    expect(getMonthKey(undefined)).toBe('');
    expect(getMonthKey(null)).toBe('');
  });
});

describe('getTotals y getBalance', () => {
  it('suma ingresos y gastos por separado', () => {
    expect(getTotals(transactions)).toEqual({
      income: 1500,
      expense: 600,
      balance: 900,
    });
  });

  it('el balance es ingresos menos gastos', () => {
    expect(getBalance(transactions)).toBe(900);
  });

  it('devuelve ceros con una lista vacía', () => {
    expect(getTotals([])).toEqual({ income: 0, expense: 0, balance: 0 });
    expect(getBalance([])).toBe(0);
  });

  it('funciona sin argumentos', () => {
    expect(getBalance()).toBe(0);
  });

  it('da balance negativo si se gastó más de lo que entró', () => {
    const soloGastos = [transactions[1], transactions[2]];
    expect(getBalance(soloGastos)).toBe(-500);
  });
});

describe('getTotalsByCategory', () => {
  it('suma gastos por categoría, de mayor a menor', () => {
    expect(getTotalsByCategory(transactions)).toEqual([
      { category: 'Comida', total: 500 },
      { category: 'Transporte', total: 100 },
    ]);
  });

  it('filtra por mes cuando se le pasa uno', () => {
    expect(getTotalsByCategory(transactions, '2026-08')).toEqual([
      { category: 'Transporte', total: 100 },
    ]);
  });

  it('puede sumar ingresos en vez de gastos', () => {
    expect(getTotalsByCategory(transactions, null, 'income')).toEqual([
      { category: 'Salario', total: 1000 },
      { category: 'Freelance', total: 500 },
    ]);
  });

  it('devuelve lista vacía para un mes sin movimientos', () => {
    expect(getTotalsByCategory(transactions, '2026-01')).toEqual([]);
  });
});

describe('getMonthlyTotals', () => {
  it('agrupa por mes, del más antiguo al más reciente', () => {
    expect(getMonthlyTotals(transactions)).toEqual([
      { month: '2026-07', income: 1000, expense: 500, balance: 500 },
      { month: '2026-08', income: 500, expense: 100, balance: 400 },
    ]);
  });

  it('no inventa meses sin movimientos', () => {
    expect(getMonthlyTotals(transactions)).toHaveLength(2);
  });

  it('devuelve lista vacía sin transacciones', () => {
    expect(getMonthlyTotals([])).toEqual([]);
  });
});

describe('filterTransactions', () => {
  it('filtra por mes', () => {
    const result = filterTransactions(transactions, { month: '2026-08' });
    expect(result.map((t) => t.id)).toEqual(['4', '5']);
  });

  it('filtra por categoría', () => {
    const result = filterTransactions(transactions, { category: 'Comida' });
    expect(result.map((t) => t.id)).toEqual(['2', '3']);
  });

  it('filtra por tipo', () => {
    const result = filterTransactions(transactions, { type: 'income' });
    expect(result.map((t) => t.id)).toEqual(['1', '5']);
  });

  it('combina varios filtros a la vez', () => {
    const result = filterTransactions(transactions, {
      month: '2026-07',
      type: 'expense',
      category: 'Comida',
    });
    expect(result.map((t) => t.id)).toEqual(['2', '3']);
  });

  it('sin filtros devuelve todo', () => {
    expect(filterTransactions(transactions)).toHaveLength(5);
  });

  it('no muta el array original', () => {
    filterTransactions(transactions, { type: 'income' });
    expect(transactions).toHaveLength(5);
  });
});

describe('getAvailableMonths', () => {
  it('lista los meses sin repetir, del más reciente al más antiguo', () => {
    expect(getAvailableMonths(transactions)).toEqual(['2026-08', '2026-07']);
  });

  it('devuelve lista vacía sin transacciones', () => {
    expect(getAvailableMonths([])).toEqual([]);
  });
});

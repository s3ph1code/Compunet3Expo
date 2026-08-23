import { act, renderHook, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import * as repository from '../../data/transactionsRepository';
import { useTransactions } from '../useTransactions';

/**
 * Estos tests montan el hook de verdad (con estado y efectos de React) sobre el
 * AsyncStorage simulado. Verifican lo que los tests del repositorio no pueden:
 * que el estado de la pantalla quede consistente después de cada operación.
 */

const gasto = {
  type: 'expense',
  amount: 25000,
  category: 'Comida',
  date: '2026-08-22',
  note: 'Almuerzo',
};

const ingreso = {
  type: 'income',
  amount: 100000,
  category: 'Salario',
  date: '2026-08-01',
  note: '',
};

/**
 * Monta el hook y espera a que termine la carga inicial.
 * Ojo: en RNTL 14 renderHook es asíncrono, hay que esperarlo.
 */
async function renderReady() {
  const utils = await renderHook(() => useTransactions());
  await waitFor(() => expect(utils.result.current.loading).toBe(false));
  return utils;
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('carga inicial', () => {
  it('termina la carga con la lista vacía y sin errores', async () => {
    // renderHook ya resuelve con los efectos aplicados, así que el loading
    // inicial en true no se alcanza a observar aquí; se prueba en "refresh".
    const { result } = await renderHook(() => useTransactions());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.transactions).toEqual([]);
    expect(result.current.balance).toBe(0);
    expect(result.current.error).toBeNull();
  });

  it('lee lo que ya estaba guardado en el dispositivo', async () => {
    const guardadas = [
      {
        id: 'a',
        type: 'income',
        amount: 500,
        category: 'Salario',
        date: '2026-08-01',
        note: '',
        createdAt: '2026-08-01T10:00:00.000Z',
      },
    ];
    await AsyncStorage.setItem('transactions', JSON.stringify(guardadas));

    const { result } = await renderReady();

    expect(result.current.transactions).toHaveLength(1);
    expect(result.current.balance).toBe(500);
  });
});

describe('addTransaction', () => {
  it('agrega la transacción y recarga la lista sola', async () => {
    const { result } = await renderReady();

    await act(async () => {
      await result.current.addTransaction(gasto);
    });

    expect(result.current.transactions).toHaveLength(1);
    expect(result.current.transactions[0].category).toBe('Comida');
  });

  it('recalcula el balance y los totales', async () => {
    const { result } = await renderReady();

    await act(async () => {
      await result.current.addTransaction(ingreso);
      await result.current.addTransaction(gasto);
    });

    expect(result.current.totals).toEqual({
      income: 100000,
      expense: 25000,
      balance: 75000,
    });
    expect(result.current.balance).toBe(75000);
  });

  it('devuelve la transacción creada', async () => {
    const { result } = await renderReady();

    let creada;
    await act(async () => {
      creada = await result.current.addTransaction(gasto);
    });

    expect(creada.id).toEqual(expect.any(String));
  });
});

describe('manejo de errores', () => {
  it('expone el error y lo vuelve a lanzar para que la pantalla lo muestre', async () => {
    const { result } = await renderReady();

    await act(async () => {
      await expect(
        result.current.addTransaction({ ...gasto, amount: -1 })
      ).rejects.toThrow(/amount/);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error.message).toMatch(/amount/);
  });

  it('no altera la lista cuando la transacción es inválida', async () => {
    const { result } = await renderReady();

    await act(async () => {
      await result.current.addTransaction(gasto);
    });
    await act(async () => {
      await expect(
        result.current.addTransaction({ ...gasto, category: 'Salario' })
      ).rejects.toThrow();
    });

    expect(result.current.transactions).toHaveLength(1);
  });

  it('limpia el error después de una operación exitosa', async () => {
    const { result } = await renderReady();

    await act(async () => {
      await expect(result.current.addTransaction({ ...gasto, amount: 0 })).rejects.toThrow();
    });
    expect(result.current.error).not.toBeNull();

    await act(async () => {
      await result.current.addTransaction(gasto);
    });
    expect(result.current.error).toBeNull();
  });
});

describe('updateTransaction y deleteTransaction', () => {
  it('actualiza y refleja el cambio en el balance', async () => {
    const { result } = await renderReady();

    let creada;
    await act(async () => {
      creada = await result.current.addTransaction(gasto);
    });
    await act(async () => {
      await result.current.updateTransaction(creada.id, { amount: 40000 });
    });

    expect(result.current.transactions[0].amount).toBe(40000);
    expect(result.current.balance).toBe(-40000);
  });

  it('elimina y deja la lista vacía', async () => {
    const { result } = await renderReady();

    let creada;
    await act(async () => {
      creada = await result.current.addTransaction(gasto);
    });
    await act(async () => {
      await result.current.deleteTransaction(creada.id);
    });

    expect(result.current.transactions).toEqual([]);
    expect(result.current.balance).toBe(0);
  });
});

describe('consultas derivadas', () => {
  it('totalsByCategory y monthlyTotals se mantienen al día', async () => {
    const { result } = await renderReady();

    await act(async () => {
      await result.current.addTransaction(ingreso);
      await result.current.addTransaction(gasto);
    });

    expect(result.current.totalsByCategory('2026-08')).toEqual([
      { category: 'Comida', total: 25000 },
    ]);
    expect(result.current.monthlyTotals).toEqual([
      { month: '2026-08', income: 100000, expense: 25000, balance: 75000 },
    ]);
    expect(result.current.availableMonths).toEqual(['2026-08']);
  });

  it('filter aplica los filtros sobre lo cargado', async () => {
    const { result } = await renderReady();

    await act(async () => {
      await result.current.addTransaction(ingreso);
      await result.current.addTransaction(gasto);
    });

    expect(result.current.filter({ type: 'income' })).toHaveLength(1);
    expect(result.current.filter({ category: 'Comida' })).toHaveLength(1);
    expect(result.current.filter({})).toHaveLength(2);
  });
});

describe('refresh', () => {
  it('marca loading mientras vuelve a leer', async () => {
    const { result } = await renderReady();
    expect(result.current.loading).toBe(false);

    // Congelamos la lectura del dispositivo para poder observar el estado
    // intermedio: si no, la recarga termina antes de que podamos mirarlo.
    let liberarLectura;
    const lecturaBloqueada = new Promise((resolve) => {
      liberarLectura = resolve;
    });
    const spy = jest
      .spyOn(repository, 'getAllTransactions')
      .mockReturnValue(lecturaBloqueada);

    let pendiente;
    await act(async () => {
      pendiente = result.current.refresh();
    });
    expect(result.current.loading).toBe(true);

    await act(async () => {
      liberarLectura([]);
      await pendiente;
    });
    expect(result.current.loading).toBe(false);

    spy.mockRestore();
  });

  it('vuelve a leer del dispositivo', async () => {
    const { result } = await renderReady();
    expect(result.current.transactions).toEqual([]);

    // Simula que algo escribió por fuera del hook.
    await AsyncStorage.setItem(
      'transactions',
      JSON.stringify([
        {
          id: 'x',
          type: 'expense',
          amount: 10,
          category: 'Otros',
          date: '2026-08-05',
          note: '',
          createdAt: '2026-08-05T10:00:00.000Z',
        },
      ])
    );

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.transactions).toHaveLength(1);
  });
});

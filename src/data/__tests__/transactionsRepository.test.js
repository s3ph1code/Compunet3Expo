import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEY } from '../constants';
import {
  addTransaction,
  clearAllTransactions,
  deleteTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
} from '../transactionsRepository';

// AsyncStorage está simulado en memoria desde jest.setup.js: nada toca un dispositivo real.

const validInput = {
  type: 'expense',
  amount: 25000,
  category: 'Comida',
  date: '2026-08-22',
  note: 'Almuerzo',
};

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('addTransaction', () => {
  it('guarda la transacción y le genera id y createdAt', async () => {
    const created = await addTransaction(validInput);

    expect(created.id).toEqual(expect.any(String));
    expect(created.id.length).toBeGreaterThan(0);
    expect(created.createdAt).toEqual(expect.any(String));
    expect(created).toMatchObject(validInput);

    const stored = await getAllTransactions();
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(created.id);
  });

  it('pone note en "" cuando no se envía', async () => {
    const created = await addTransaction({ ...validInput, note: undefined });
    expect(created.note).toBe('');
  });

  it('guarda el array completo bajo la clave acordada', async () => {
    await addTransaction(validInput);

    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    expect(Array.isArray(JSON.parse(raw))).toBe(true);
  });

  it('genera ids distintos aunque se creen muchas seguidas', async () => {
    for (let i = 0; i < 20; i += 1) {
      await addTransaction(validInput);
    }

    const stored = await getAllTransactions();
    const ids = new Set(stored.map((transaction) => transaction.id));
    expect(ids.size).toBe(20);
  });

  it('rechaza un amount negativo o cero', async () => {
    await expect(addTransaction({ ...validInput, amount: -100 })).rejects.toThrow(
      /amount/
    );
    await expect(addTransaction({ ...validInput, amount: 0 })).rejects.toThrow(/amount/);
  });

  it('rechaza un type que no sea income ni expense', async () => {
    await expect(addTransaction({ ...validInput, type: 'ahorro' })).rejects.toThrow(
      /type/
    );
  });

  it('rechaza una categoría que no corresponde al tipo', async () => {
    // "Salario" es categoría de ingreso, no de gasto.
    await expect(addTransaction({ ...validInput, category: 'Salario' })).rejects.toThrow(
      /category/
    );
  });

  it('rechaza fechas mal formadas o inexistentes', async () => {
    await expect(addTransaction({ ...validInput, date: '22/08/2026' })).rejects.toThrow(
      /date/
    );
    await expect(addTransaction({ ...validInput, date: '2026-02-31' })).rejects.toThrow(
      /date/
    );
  });

  it('no guarda nada cuando la transacción es inválida', async () => {
    await expect(addTransaction({ ...validInput, amount: -1 })).rejects.toThrow();
    expect(await getAllTransactions()).toEqual([]);
  });
});

describe('getAllTransactions', () => {
  it('devuelve lista vacía cuando no hay nada guardado', async () => {
    expect(await getAllTransactions()).toEqual([]);
  });

  it('ordena de la fecha más reciente a la más antigua', async () => {
    await addTransaction({ ...validInput, date: '2026-06-10' });
    await addTransaction({ ...validInput, date: '2026-08-01' });
    await addTransaction({ ...validInput, date: '2026-07-15' });

    const dates = (await getAllTransactions()).map((transaction) => transaction.date);
    expect(dates).toEqual(['2026-08-01', '2026-07-15', '2026-06-10']);
  });

  it('devuelve lista vacía si el contenido guardado está corrupto', async () => {
    // El warning es esperado en este caso; lo silenciamos para no ensuciar la salida.
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    await AsyncStorage.setItem(STORAGE_KEY, 'esto no es json');
    expect(await getAllTransactions()).toEqual([]);

    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe('getTransactionById', () => {
  it('encuentra la transacción por id', async () => {
    const created = await addTransaction(validInput);
    expect(await getTransactionById(created.id)).toEqual(created);
  });

  it('devuelve null si no existe', async () => {
    expect(await getTransactionById('no-existe')).toBeNull();
  });
});

describe('updateTransaction', () => {
  it('cambia solo los campos indicados', async () => {
    const created = await addTransaction(validInput);
    const updated = await updateTransaction(created.id, { amount: 30000, note: 'Cena' });

    expect(updated.amount).toBe(30000);
    expect(updated.note).toBe('Cena');
    expect(updated.category).toBe(created.category);
    expect(updated.date).toBe(created.date);
  });

  it('persiste el cambio', async () => {
    const created = await addTransaction(validInput);
    await updateTransaction(created.id, { amount: 30000 });

    const stored = await getTransactionById(created.id);
    expect(stored.amount).toBe(30000);
  });

  it('no permite cambiar id ni createdAt', async () => {
    const created = await addTransaction(validInput);
    const updated = await updateTransaction(created.id, {
      id: 'otro-id',
      createdAt: '2000-01-01T00:00:00.000Z',
    });

    expect(updated.id).toBe(created.id);
    expect(updated.createdAt).toBe(created.createdAt);
  });

  it('rechaza un cambio que dejaría la transacción inválida', async () => {
    const created = await addTransaction(validInput);
    await expect(updateTransaction(created.id, { amount: -5 })).rejects.toThrow(/amount/);

    const stored = await getTransactionById(created.id);
    expect(stored.amount).toBe(validInput.amount);
  });

  it('rechaza cambiar a una categoría incompatible con el tipo', async () => {
    const created = await addTransaction(validInput);
    await expect(updateTransaction(created.id, { category: 'Freelance' })).rejects.toThrow(
      /category/
    );
  });

  it('permite cambiar type y category a la vez', async () => {
    const created = await addTransaction(validInput);
    const updated = await updateTransaction(created.id, {
      type: 'income',
      category: 'Salario',
    });

    expect(updated.type).toBe('income');
    expect(updated.category).toBe('Salario');
  });

  it('lanza si el id no existe', async () => {
    await expect(updateTransaction('no-existe', { amount: 1 })).rejects.toThrow(
      /no-existe/
    );
  });
});

describe('deleteTransaction', () => {
  it('elimina la transacción', async () => {
    const created = await addTransaction(validInput);
    await deleteTransaction(created.id);

    expect(await getAllTransactions()).toEqual([]);
  });

  it('deja intactas las demás', async () => {
    const first = await addTransaction(validInput);
    const second = await addTransaction({ ...validInput, date: '2026-08-23' });

    await deleteTransaction(first.id);

    const stored = await getAllTransactions();
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(second.id);
  });

  it('lanza si el id no existe', async () => {
    await expect(deleteTransaction('no-existe')).rejects.toThrow(/no-existe/);
  });
});

describe('clearAllTransactions', () => {
  it('deja el almacenamiento vacío', async () => {
    await addTransaction(validInput);
    await addTransaction(validInput);

    await clearAllTransactions();

    expect(await getAllTransactions()).toEqual([]);
  });
});

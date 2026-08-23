import { getValidationErrors } from '../validation';
import { MOCK_TRANSACTIONS } from '../mockData';

/**
 * Los datos de prueba son lo primero que ven B y C, así que tienen que cumplir
 * el modelo al pie de la letra. Si alguien edita mockData.js y se equivoca,
 * estos tests lo cazan antes de que llegue a las pantallas.
 */
describe('MOCK_TRANSACTIONS', () => {
  it('todas las transacciones de prueba son válidas', () => {
    const invalid = MOCK_TRANSACTIONS.filter(
      (transaction) => getValidationErrors(transaction).length > 0
    ).map((transaction) => ({
      id: transaction.id,
      errors: getValidationErrors(transaction),
    }));

    expect(invalid).toEqual([]);
  });

  it('todos los ids son únicos', () => {
    const ids = MOCK_TRANSACTIONS.map((transaction) => transaction.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('todas traen id y createdAt', () => {
    for (const transaction of MOCK_TRANSACTIONS) {
      expect(typeof transaction.id).toBe('string');
      expect(typeof transaction.createdAt).toBe('string');
    }
  });

  it('cubren varios meses para que las gráficas tengan tendencia', () => {
    const months = new Set(
      MOCK_TRANSACTIONS.map((transaction) => transaction.date.slice(0, 7))
    );
    expect(months.size).toBeGreaterThanOrEqual(3);
  });

  it('incluyen ingresos y gastos', () => {
    const types = new Set(MOCK_TRANSACTIONS.map((transaction) => transaction.type));
    expect(types).toEqual(new Set(['income', 'expense']));
  });
});

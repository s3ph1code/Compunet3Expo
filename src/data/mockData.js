import { saveTransactions } from './storage';

/**
 * Datos de prueba para que el equipo pueda trabajar en las pantallas y las
 * gráficas sin tener que registrar transacciones a mano.
 *
 * Cubren tres meses (junio, julio y agosto de 2026) y todas las categorías,
 * para que la tendencia mensual y el desglose por categoría tengan algo que mostrar.
 *
 * Los ids son fijos y con prefijo "mock-" para distinguirlos de los reales.
 */
export const MOCK_TRANSACTIONS = [
  // --- Junio 2026 ---
  {
    id: 'mock-001',
    type: 'income',
    amount: 3200000,
    category: 'Salario',
    date: '2026-06-01',
    note: 'Sueldo de junio',
    createdAt: '2026-06-01T13:05:00.000Z',
  },
  {
    id: 'mock-002',
    type: 'expense',
    amount: 180000,
    category: 'Servicios',
    date: '2026-06-03',
    note: 'Internet y luz',
    createdAt: '2026-06-03T15:20:00.000Z',
  },
  {
    id: 'mock-003',
    type: 'expense',
    amount: 45000,
    category: 'Comida',
    date: '2026-06-05',
    note: 'Mercado de la semana',
    createdAt: '2026-06-05T18:40:00.000Z',
  },
  {
    id: 'mock-004',
    type: 'expense',
    amount: 12000,
    category: 'Transporte',
    date: '2026-06-06',
    note: '',
    createdAt: '2026-06-06T12:10:00.000Z',
  },
  {
    id: 'mock-005',
    type: 'expense',
    amount: 60000,
    category: 'Entretenimiento',
    date: '2026-06-14',
    note: 'Cine con amigos',
    createdAt: '2026-06-14T23:15:00.000Z',
  },
  {
    id: 'mock-006',
    type: 'income',
    amount: 800000,
    category: 'Freelance',
    date: '2026-06-20',
    note: 'Landing page para cliente',
    createdAt: '2026-06-20T16:00:00.000Z',
  },
  {
    id: 'mock-007',
    type: 'expense',
    amount: 90000,
    category: 'Salud',
    date: '2026-06-25',
    note: 'Consulta odontológica',
    createdAt: '2026-06-25T14:30:00.000Z',
  },

  // --- Julio 2026 ---
  {
    id: 'mock-008',
    type: 'income',
    amount: 3200000,
    category: 'Salario',
    date: '2026-07-01',
    note: 'Sueldo de julio',
    createdAt: '2026-07-01T13:05:00.000Z',
  },
  {
    id: 'mock-009',
    type: 'expense',
    amount: 52000,
    category: 'Comida',
    date: '2026-07-02',
    note: 'Mercado',
    createdAt: '2026-07-02T19:00:00.000Z',
  },
  {
    id: 'mock-010',
    type: 'expense',
    amount: 15000,
    category: 'Transporte',
    date: '2026-07-04',
    note: 'Taxi al aeropuerto',
    createdAt: '2026-07-04T09:45:00.000Z',
  },
  {
    id: 'mock-011',
    type: 'expense',
    amount: 240000,
    category: 'Servicios',
    date: '2026-07-08',
    note: 'Servicios del mes',
    createdAt: '2026-07-08T11:25:00.000Z',
  },
  {
    id: 'mock-012',
    type: 'expense',
    amount: 120000,
    category: 'Entretenimiento',
    date: '2026-07-15',
    note: 'Concierto',
    createdAt: '2026-07-15T22:50:00.000Z',
  },
  {
    id: 'mock-013',
    type: 'expense',
    amount: 35000,
    category: 'Otros',
    date: '2026-07-19',
    note: '',
    createdAt: '2026-07-19T17:05:00.000Z',
  },
  {
    id: 'mock-014',
    type: 'income',
    amount: 200000,
    category: 'Regalo',
    date: '2026-07-22',
    note: 'Cumpleaños',
    createdAt: '2026-07-22T20:30:00.000Z',
  },

  // --- Agosto 2026 ---
  {
    id: 'mock-015',
    type: 'income',
    amount: 3200000,
    category: 'Salario',
    date: '2026-08-01',
    note: 'Sueldo de agosto',
    createdAt: '2026-08-01T13:05:00.000Z',
  },
  {
    id: 'mock-016',
    type: 'expense',
    amount: 25000,
    category: 'Comida',
    date: '2026-08-02',
    note: 'Almuerzo',
    createdAt: '2026-08-02T18:15:00.000Z',
  },
  {
    id: 'mock-017',
    type: 'expense',
    amount: 38000,
    category: 'Comida',
    date: '2026-08-09',
    note: 'Domicilio',
    createdAt: '2026-08-09T01:20:00.000Z',
  },
  {
    id: 'mock-018',
    type: 'expense',
    amount: 18000,
    category: 'Transporte',
    date: '2026-08-11',
    note: '',
    createdAt: '2026-08-11T13:40:00.000Z',
  },
  {
    id: 'mock-019',
    type: 'expense',
    amount: 195000,
    category: 'Servicios',
    date: '2026-08-12',
    note: 'Agua y gas',
    createdAt: '2026-08-12T10:00:00.000Z',
  },
  {
    id: 'mock-020',
    type: 'expense',
    amount: 150000,
    category: 'Salud',
    date: '2026-08-18',
    note: 'Medicamentos',
    createdAt: '2026-08-18T16:35:00.000Z',
  },
  {
    id: 'mock-021',
    type: 'income',
    amount: 600000,
    category: 'Freelance',
    date: '2026-08-20',
    note: 'Mantenimiento de sitio web',
    createdAt: '2026-08-20T15:10:00.000Z',
  },
  {
    id: 'mock-022',
    type: 'expense',
    amount: 75000,
    category: 'Entretenimiento',
    date: '2026-08-21',
    note: 'Salida del fin de semana',
    createdAt: '2026-08-21T21:00:00.000Z',
  },
];

/**
 * Reemplaza lo que haya en el dispositivo por los datos de prueba.
 * Solo para desarrollo: borra las transacciones reales del usuario.
 * @returns {Promise<Array>} las transacciones que quedaron guardadas
 */
export async function seedMockData() {
  await saveTransactions(MOCK_TRANSACTIONS);
  return MOCK_TRANSACTIONS;
}

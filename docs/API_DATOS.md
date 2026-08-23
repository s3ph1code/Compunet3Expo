# API de la capa de datos

Guía para Persona B (pantallas) y Persona C (UI y gráficas).

**No necesitas saber cómo funciona por dentro.** Todo se importa desde `src`, y ahí está el contrato completo.

```js
import { useTransactions, EXPENSE_CATEGORIES } from '../src';
```

---

## Lo único que necesitas: `useTransactions()`

Un hook que carga las transacciones del dispositivo, las mantiene en memoria y recalcula los totales solo cuando hace falta.

```js
function Dashboard() {
  const { transactions, balance, totals, loading, error, addTransaction } = useTransactions();

  if (loading) return <ActivityIndicator />;

  return <Text>Balance: {balance}</Text>;
}
```

### Qué devuelve

| Campo | Tipo | Descripción |
|---|---|---|
| `transactions` | `Transaction[]` | Todas, de la más reciente a la más antigua |
| `loading` | `boolean` | `true` mientras lee del dispositivo |
| `error` | `Error \| null` | El último error ocurrido |
| `balance` | `number` | Ingresos − gastos. Puede ser negativo |
| `totals` | `{income, expense, balance}` | Los tres números de un tirón |
| `monthlyTotals` | `Array` | `[{month, income, expense, balance}]`, del mes más antiguo al más reciente |
| `availableMonths` | `string[]` | Meses con movimientos (`"2026-08"`), del más reciente al más antiguo |
| `totalsByCategory(month?, type?)` | función | `[{category, total}]` ordenado de mayor a menor |
| `filter({month, category, type})` | función | Devuelve las transacciones que cumplen los filtros |
| `addTransaction(input)` | async | Crea una. Devuelve la transacción creada |
| `updateTransaction(id, changes)` | async | Modifica los campos indicados |
| `deleteTransaction(id)` | async | Elimina por id |
| `refresh()` | async | Vuelve a leer del dispositivo |

Después de `addTransaction`, `updateTransaction` o `deleteTransaction` la lista se recarga sola. No hace falta llamar a `refresh()`.

### Crear una transacción

Solo mandas estos campos. El `id` y el `createdAt` los pone la capa de datos.

```js
await addTransaction({
  type: 'expense',        // 'income' o 'expense'
  amount: 25000,          // número positivo, siempre
  category: 'Comida',
  date: '2026-08-22',     // "YYYY-MM-DD"
  note: 'Almuerzo',       // opcional
});
```

Si algo está mal, **lanza un `Error` con un mensaje en español listo para mostrar**. Envuélvelo en `try/catch` en el formulario:

```js
try {
  await addTransaction(input);
} catch (err) {
  Alert.alert('No se pudo guardar', err.message);
}
```

Qué rechaza: `type` que no sea `income`/`expense`, `amount` que no sea número positivo, `category` que no corresponda al tipo, y `date` mal formada o inexistente (`2026-02-31` no pasa).

### Gráficas

```js
// Torta de gastos del mes actual
const porCategoria = totalsByCategory('2026-08');
// -> [{ category: 'Servicios', total: 195000 }, { category: 'Salud', total: 150000 }, ...]

// Barras de tendencia mensual
monthlyTotals;
// -> [{ month: '2026-06', income: 4000000, expense: 387000, balance: 3613000 }, ...]
```

`totalsByCategory` suma **gastos** por defecto. Para ingresos: `totalsByCategory('2026-08', 'income')`.

Solo aparecen las categorías que tienen movimientos: no hay filas en cero que filtrar.

### Historial con filtros

```js
const { filter, availableMonths } = useTransactions();

const delMes = filter({ month: '2026-08' });
const soloComida = filter({ month: '2026-08', category: 'Comida' });
const soloGastos = filter({ type: 'expense' });
```

Los filtros que no pases se ignoran. `filter({})` devuelve todo.

---

## Categorías para los selectores

```js
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, getCategoriesForType } from '../src';

// Que el selector cambie según lo que eligió el usuario:
const categorias = getCategoriesForType(type);
```

Gastos: Comida, Transporte, Servicios, Entretenimiento, Salud, Otros.
Ingresos: Salario, Freelance, Regalo, Otros.

---

## Datos de prueba

Para trabajar sin registrar nada a mano: 22 transacciones repartidas en junio, julio y agosto de 2026, cubriendo todas las categorías.

```js
import { seedMockData } from '../src';

// Llamar una vez, por ejemplo desde un botón temporal de desarrollo.
await seedMockData();
```

⚠️ `seedMockData()` **reemplaza** lo que haya guardado. Solo para desarrollo.

---

## La forma de una `Transaction`

Lo que reciben `transactions` y las funciones de filtro. Es exactamente el modelo de `DATA_MODEL.md`:

```js
{
  id: '1692720000000-a3f9k2',
  type: 'expense',
  amount: 25000,
  category: 'Comida',
  date: '2026-08-22',
  note: 'Almuerzo',
  createdAt: '2026-08-22T14:30:00.000Z',
}
```

`date` es cuándo ocurrió el gasto (la elige el usuario). `createdAt` es cuándo se registró en la app. No son lo mismo.

---

## Si necesitas el CRUD sin React

Fuera de un componente, importa las funciones directamente. Todas son `async`:

```js
import { getAllTransactions, addTransaction } from '../src';

const todas = await getAllTransactions();
```

Disponibles: `getAllTransactions`, `getTransactionById`, `addTransaction`, `updateTransaction`, `deleteTransaction`, `clearAllTransactions`.

Y los cálculos puros, si ya tienes un array en la mano: `getBalance(txs)`, `getTotals(txs)`, `getTotalsByCategory(txs, month, type)`, `getMonthlyTotals(txs)`, `filterTransactions(txs, filtros)`, `getAvailableMonths(txs)`.

---

## Dos cosas que cambiaron respecto al `CONTEXT.md`

1. **`getTotalsByCategory` recibe el array como primer parámetro** (`getTotalsByCategory(txs, month)`) porque los cálculos son funciones puras y no leen del dispositivo. Desde el hook no se nota: ahí sigue siendo `totalsByCategory(month)`.
2. **Los `id` ahora son `"1692720000000-a3f9k2"`** (timestamp + sufijo corto) en vez de solo timestamp. Dos transacciones creadas en el mismo milisegundo tendrían el mismo id, y el modelo exige que sean únicos. Sigue siendo un `string`; nada cambia para ustedes.

---

## Estructura interna (por si te da curiosidad)

```
src/
├── index.js                       # lo único que deben importar B y C
├── data/
│   ├── constants.js               # clave de storage, tipos, categorías
│   ├── storage.js                 # lectura/escritura en AsyncStorage
│   ├── validation.js              # reglas del modelo
│   ├── transactionsRepository.js  # CRUD
│   └── mockData.js                # datos de prueba
├── logic/
│   └── calculations.js            # funciones puras
└── hooks/
    └── useTransactions.js         # une todo para la UI
```

## Tests

```bash
npm test
```

71 tests sobre los cálculos, el CRUD, los datos de prueba y el contrato público. Corren sin abrir la app: AsyncStorage está simulado en memoria (`jest.setup.js`).

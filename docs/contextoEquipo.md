# Contexto para el equipo

Resumen de lo que se hizo en la **capa de datos y lógica** (Persona A) y de las decisiones que los afectan a ustedes.

Este documento explica **qué hay y por qué**. Para saber **cómo usarlo**, vayan a [`API_DATOS.md`](./API_DATOS.md).

---

## 1. Qué había y qué hay ahora

El repo estaba vacío, con solo el README. Ahora tiene el proyecto Expo montado y la capa de datos completa y probada.

| | Versión |
|---|---|
| Expo SDK | 57 |
| React Native | 0.86.2 |
| React | 19.2.3 |

Plantilla en blanco, **JavaScript** (no TypeScript). Se eligió JS para que nadie tenga que pelear con tipos durante la entrega; el modelo de datos está documentado y validado en tiempo de ejecución, que es lo que de verdad protege contra datos malos.

## 2. Dependencias que se agregaron

| Paquete | Para qué |
|---|---|
| `@react-native-async-storage/async-storage` | La persistencia en el dispositivo |
| `react-dom`, `react-native-web` | Permiten `npm run web` y trabajar sin celular |
| `jest`, `jest-expo`, `@testing-library/react-native` | Solo desarrollo: los tests |

No se agregó nada más. Sin librerías de UUID, de fechas ni de manejo de estado — todo se resolvió con JavaScript nativo y React. **Si necesitan instalar algo, avisen antes**, para no terminar con tres librerías que hacen lo mismo.

## 3. Cómo arrancar

```bash
npm install
npm start        # celular con Expo Go
npm run web      # navegador, sin celular
npm test         # 85 tests, ~2 segundos
```

## 4. Estructura

```
src/
├── index.js                       # ← lo único que ustedes importan
├── data/
│   ├── constants.js               # clave de storage, tipos, categorías
│   ├── storage.js                 # lee y escribe en AsyncStorage
│   ├── validation.js              # reglas del modelo
│   ├── transactionsRepository.js  # CRUD
│   └── mockData.js                # 22 transacciones de prueba
├── logic/
│   └── calculations.js            # cálculos puros
├── hooks/
│   └── useTransactions.js         # une todo para la UI
└── dev/
    └── DataLayerCheck.js          # pantalla de verificación, no va en la app final
```

**Importen siempre desde `src`, nunca de los archivos internos:**

```js
import { useTransactions, EXPENSE_CATEGORIES } from '../src';
```

Así podemos reorganizar por dentro sin romperles nada. Si algo que necesitan no está exportado en `src/index.js`, pídanlo y lo agrego — no lo importen por la ruta interna.

## 5. Cómo está armado y por qué

La capa tiene tres niveles, cada uno con una responsabilidad:

**`src/data/` — habla con el dispositivo.** Todo es `async` porque AsyncStorage lo es. Aquí vive el CRUD y la validación.

**`src/logic/` — solo calcula.** Funciones puras y síncronas: reciben el array de transacciones y devuelven un número o una lista. No tocan el almacenamiento ni React. Por eso son triviales de probar y se pueden aplicar a cualquier lista, incluso a una ya filtrada.

**`src/hooks/useTransactions.js` — lo que ustedes usan.** Carga las transacciones al montar, las mantiene en memoria y recalcula los totales cuando cambian.

La razón de partirlo así: si los cálculos leyeran del dispositivo por dentro, cada `getBalance()` sería una operación asíncrona y ustedes tendrían que manejar `await` y estado en cada pantalla. Con el hook, `balance` es simplemente un número.

**Consecuencia práctica para ustedes: después de `addTransaction`, `updateTransaction` o `deleteTransaction` la lista se recarga sola.** No llamen a `refresh()`.

## 6. El modelo de datos

Es el de `DATA_MODEL.md`, sin cambios:

```js
{
  id: '1692720000000-a3f9k2',
  type: 'expense',              // 'income' o 'expense'
  amount: 25000,                // siempre positivo
  category: 'Comida',
  date: '2026-08-22',           // "YYYY-MM-DD", la elige el usuario
  note: 'Almuerzo',             // opcional, "" si no hay
  createdAt: '2026-08-22T14:30:00.000Z',  // automático
}
```

Se guarda como **un solo array** bajo la clave `"transactions"`.

⚠️ **No cambien el modelo sin avisar.** Las pantallas, las gráficas y los 85 tests dependen de esta forma exacta.

## 7. Dos cosas que cambiaron respecto al `CONTEXT.md`

1. **`getTotalsByCategory` ahora recibe el array primero:** `getTotalsByCategory(txs, month)` en vez de `getTotalsByCategory(month)`. Es consecuencia de que los cálculos sean puros. **Desde el hook no se nota:** ahí sigue siendo `totalsByCategory(month)`.

2. **Los `id` llevan un sufijo corto:** `"1692720000000-a3f9k2"` en vez de solo el timestamp. Dos transacciones creadas en el mismo milisegundo tendrían el mismo id, y el modelo exige que sean únicos. Sigue siendo un `string`, así que para ustedes no cambia nada.

## 8. Decisiones que les pueden afectar

**La validación rechaza, no corrige.** Si mandan `amount: -25000`, no se guarda como `25000`: lanza un `Error`. Se prefirió que el usuario vea "el monto debe ser positivo" antes que guardar en silencio algo que quizás escribió mal. **Envuelvan las llamadas en `try/catch`** — los mensajes de error vienen en español y se pueden mostrar directo:

```js
try {
  await addTransaction(input);
} catch (err) {
  Alert.alert('No se pudo guardar', err.message);
}
```

Qué rechaza: `type` que no sea `income`/`expense`, `amount` que no sea número positivo, `category` que no corresponda al tipo (`Salario` en un gasto, por ejemplo), y fechas mal formadas o inexistentes (`2026-02-31` no pasa).

**Leer nunca tumba la app.** Si el almacenamiento está corrupto o vacío, se devuelve una lista vacía y se registra un aviso. Nunca van a recibir una excepción por leer.

**Las listas de categorías no traen ceros.** `totalsByCategory()` solo devuelve categorías con movimientos, y `monthlyTotals` solo meses con movimientos. No tienen que filtrar filas en cero antes de graficar.

**Los cálculos no mutan nada.** `filter()` y las demás funciones devuelven arrays nuevos.

## 9. Qué está probado

**85 tests, 5 suites, corren en ~2 segundos** con `npm test`. AsyncStorage está simulado en memoria, así que no hace falta abrir la app.

| Suite | Qué cubre |
|---|---|
| `calculations` | Balance, totales por categoría y por mes, filtros, casos borde (lista vacía, mes sin datos, balance negativo) |
| `transactionsRepository` | CRUD completo, orden por fecha, unicidad de ids, todos los casos de validación, datos corruptos |
| `useTransactions` | Carga inicial, recarga tras cada operación, recálculo de totales, propagación de errores, estado de `loading` |
| `mockData` | Que los datos de prueba cumplan el modelo |
| `index` | Que el contrato público no se rompa |

Ese último es su red de seguridad: si alguien renombra o borra una función que ustedes usan, el test falla antes de que lo descubran en la pantalla.

## 10. Qué se verificó corriendo la app

Se ejecutó de verdad en el navegador con la pantalla `src/dev/DataLayerCheck.js`:

- Cargar los 22 datos de prueba → balance $9.850.000, cuadra con el cálculo a mano.
- Agregar un gasto → el balance y los totales por categoría y mes se actualizaron solos.
- Monto inválido → rechazado con mensaje claro, no se guardó nada.
- **Recargar la página completa → los datos siguen ahí.** La persistencia funciona.
- Borrar → vuelve al estado anterior.
- Cero errores en consola. El almacenamiento quedó con una sola clave, `"transactions"`, con el array y los siete campos del modelo.

También se comprobó que la app **bundlea limpio para Android** (592 módulos) y que `expo-doctor` pasa sus 21 checks.

**Lo que falta verificar:** en web, AsyncStorage usa `localStorage` por debajo, no el módulo nativo de Android/iOS. La prueba de persistencia en un teléfono real todavía no se ha hecho. Para hacerla, en `API_DATOS.md` están los pasos con `src/dev/DataLayerCheck.js`.

## 11. Qué NO se hizo (a propósito)

- **Nada de UI ni navegación.** `App.js` está exactamente como lo dejó el scaffold de Expo. Las carpetas `src/screens/`, `src/components/` y `src/navigation/` son suyas.
- **SQLite.** Quedó como opción futura. AsyncStorage alcanza de sobra para el volumen de datos de esta app.
- **`src/dev/DataLayerCheck.js` no va en la entrega final.** Es una herramienta de verificación; bórrenla o ignórenla cuando armemos la versión final.

## 12. Si necesitan algo

Si les falta una función, un filtro o un cálculo, pídanlo en vez de escribirlo en la pantalla. La idea es que toda la lógica de datos viva en un solo lugar y esté probada.

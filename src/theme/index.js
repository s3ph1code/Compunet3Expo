/**
 * Sistema visual de la app (Persona C).
 *
 * Un único lugar donde viven los colores, la tipografía, los espaciados y los
 * radios. Las pantallas y componentes deberían leer de aquí en lugar de escribir
 * valores sueltos ("#2563eb", 16, etc.), para que todo se vea coherente y sea
 * fácil de retocar antes de la exposición.
 */

export const colors = {
  // Marca / acciones principales
  primary: '#2563eb',
  primaryDark: '#1d4ed8',
  primarySoft: '#dbeafe',

  // Semánticos
  income: '#16a34a',
  incomeSoft: '#dcfce7',
  expense: '#dc2626',
  expenseSoft: '#fee2e2',

  // Superficies
  background: '#f1f5f9',
  surface: '#ffffff',
  border: '#e2e8f0',

  // Texto
  text: '#0f172a',
  textMuted: '#64748b',
  textInverse: '#ffffff',

  // Paleta para las gráficas por categoría (una por segmento).
  chart: [
    '#2563eb',
    '#16a34a',
    '#f59e0b',
    '#db2777',
    '#0891b2',
    '#7c3aed',
    '#dc2626',
    '#64748b',
  ],
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
};

export const typography = {
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  body: {
    fontSize: 15,
    color: colors.text,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  caption: {
    fontSize: 13,
    color: colors.textMuted,
  },
};

/**
 * Sombra sutil y multiplataforma (iOS + Android + web) para las tarjetas.
 */
export const shadow = {
  shadowColor: '#0f172a',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 2,
};

/**
 * Formatea un monto como pesos colombianos, sin decimales.
 * Ej: 3200000 -> "$3.200.000". Cae con elegancia si el valor no es numérico.
 * @param {number} value
 * @returns {string}
 */
export function formatCurrency(value) {
  const amount = Number(value) || 0;

  try {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `$${amount.toLocaleString('es-CO')}`;
  }
}

/**
 * Convierte "2026-08" en una etiqueta corta y legible como "ago 2026".
 * @param {string} monthKey formato "YYYY-MM"
 * @returns {string}
 */
export function formatMonthLabel(monthKey) {
  if (typeof monthKey !== 'string' || monthKey.length < 7) return monthKey || '';

  const meses = [
    'ene', 'feb', 'mar', 'abr', 'may', 'jun',
    'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
  ];

  const [year, month] = monthKey.split('-');
  const index = Number(month) - 1;

  if (index < 0 || index > 11) return monthKey;

  return `${meses[index]} ${year}`;
}

export default { colors, spacing, radii, typography, shadow, formatCurrency, formatMonthLabel };

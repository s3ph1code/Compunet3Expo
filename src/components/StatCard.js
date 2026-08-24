import { Text, StyleSheet } from 'react-native';

import Card from './Card';
import { colors, spacing, typography, formatCurrency } from '../theme';

/**
 * Tarjeta compacta para mostrar un dato numérico con su etiqueta.
 * Pensada para los resúmenes (balance, ingresos, gastos).
 *
 * @param {string} label
 * @param {number} value monto a formatear como moneda
 * @param {'default'|'income'|'expense'} [tone] color del número
 * @param {string} [icon] emoji opcional
 * @param {object} [style]
 */
export default function StatCard({
  label,
  value,
  tone = 'default',
  icon,
  style,
}) {
  const valueColor =
    tone === 'income'
      ? colors.income
      : tone === 'expense'
        ? colors.expense
        : colors.text;

  return (
    <Card style={[styles.card, style]}>
      <Text style={styles.label}>
        {icon ? `${icon} ` : ''}
        {label}
      </Text>
      <Text style={[styles.value, { color: valueColor }]}>
        {formatCurrency(value)}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
  },
  label: {
    ...typography.label,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
  },
});

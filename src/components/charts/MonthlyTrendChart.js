import { View, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

import { colors, formatMonthLabel } from '../../theme';
import { baseChartConfig } from './chartConfig';
import EmptyState from '../EmptyState';

/**
 * Convierte montos grandes en etiquetas cortas para el eje Y.
 * Ej: 3200000 -> "3.2M", 240000 -> "240k".
 */
function compact(value) {
  const n = Number(value) || 0;
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${Math.round(n / 1_000)}k`;
  return `${n}`;
}

/**
 * Gráfica de líneas con la tendencia mensual de ingresos vs. gastos.
 *
 * @param {Array<{month: string, income: number, expense: number}>} data
 * @param {number} width ancho disponible en píxeles
 */
export default function MonthlyTrendChart({ data = [], width }) {
  if (!data.length) {
    return (
      <EmptyState
        icon="📈"
        title="Sin tendencia todavía"
        message="Cuando tengas movimientos en varios meses aparecerá aquí."
      />
    );
  }

  const chartData = {
    labels: data.map((item) => formatMonthLabel(item.month)),
    datasets: [
      {
        data: data.map((item) => item.income),
        color: (opacity = 1) => `rgba(22, 163, 74, ${opacity})`,
        strokeWidth: 2,
      },
      {
        data: data.map((item) => item.expense),
        color: (opacity = 1) => `rgba(220, 38, 38, ${opacity})`,
        strokeWidth: 2,
      },
    ],
    legend: ['Ingresos', 'Gastos'],
  };

  return (
    <View style={styles.container}>
      <LineChart
        data={chartData}
        width={width}
        height={220}
        chartConfig={baseChartConfig}
        formatYLabel={compact}
        bezier
        fromZero
        style={styles.chart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  chart: {
    borderRadius: 12,
    marginLeft: -8,
  },
});

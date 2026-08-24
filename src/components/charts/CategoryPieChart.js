import { View, Text, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

import { colors, spacing, typography, formatCurrency } from '../../theme';
import { baseChartConfig } from './chartConfig';
import EmptyState from '../EmptyState';

/**
 * Gráfica de torta con el gasto (o ingreso) por categoría.
 *
 * @param {Array<{category: string, total: number}>} data ya calculado por la capa A
 * @param {number} width ancho disponible en píxeles
 */
export default function CategoryPieChart({ data = [], width }) {
  if (!data.length) {
    return (
      <EmptyState
        icon="🥧"
        title="Sin datos por categoría"
        message="Registra algunos gastos para ver el desglose."
      />
    );
  }

  const total = data.reduce((sum, item) => sum + item.total, 0);

  const chartData = data.map((item, index) => ({
    name: item.category,
    amount: item.total,
    color: colors.chart[index % colors.chart.length],
    legendFontColor: colors.textMuted,
    legendFontSize: 13,
  }));

  return (
    <View>
      <PieChart
        data={chartData}
        width={width}
        height={200}
        accessor="amount"
        backgroundColor="transparent"
        paddingLeft="8"
        chartConfig={baseChartConfig}
        absolute={false}
      />

      <View style={styles.legend}>
        {data.map((item, index) => {
          const percent = total > 0 ? Math.round((item.total / total) * 100) : 0;

          return (
            <View key={item.category} style={styles.legendRow}>
              <View style={styles.legendLeft}>
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: colors.chart[index % colors.chart.length] },
                  ]}
                />
                <Text style={styles.legendLabel}>
                  {item.category} · {percent}%
                </Text>
              </View>

              <Text style={styles.legendValue}>
                {formatCurrency(item.total)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  legend: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 1,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendLabel: {
    ...typography.body,
    flexShrink: 1,
  },
  legendValue: {
    ...typography.body,
    fontWeight: '700',
  },
});

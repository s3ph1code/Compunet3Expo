import { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  useWindowDimensions,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { useTransactions, seedMockData } from '../index';
import {
  ScreenContainer,
  Card,
  StatCard,
  Button,
  SectionHeader,
  EmptyState,
  CategoryPieChart,
  MonthlyTrendChart,
} from '../components';
import { colors, spacing, radii, typography, formatMonthLabel } from '../theme';

export default function StatisticsScreen() {
  const {
    transactions,
    totals,
    monthlyTotals,
    availableMonths,
    totalsByCategory,
    filter,
    loading,
    refresh,
  } = useTransactions();

  const [selectedMonth, setSelectedMonth] = useState(null);

  const loadDemoData = async () => {
    await seedMockData();
    await refresh();
  };

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const { width } = useWindowDimensions();
  // Ancho útil: quitamos el padding de la pantalla y el de la tarjeta.
  const chartWidth = Math.max(
    240,
    Math.min(width, 520) - spacing.lg * 2 - spacing.lg * 2
  );

  const expensesByCategory = totalsByCategory(selectedMonth, 'expense');

  const periodTotals = useMemo(() => {
    if (!selectedMonth) return totals;

    const income = filter({ month: selectedMonth, type: 'income' }).reduce(
      (sum, t) => sum + t.amount,
      0
    );
    const expense = filter({ month: selectedMonth, type: 'expense' }).reduce(
      (sum, t) => sum + t.amount,
      0
    );

    return { income, expense, balance: income - expense };
  }, [selectedMonth, totals, filter]);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={typography.body}>Cargando estadísticas...</Text>
      </View>
    );
  }

  if (transactions.length === 0) {
    return (
      <ScreenContainer>
        <Text style={styles.title}>Estadísticas</Text>
        <Card>
          <EmptyState
            icon="📊"
            title="Aún no hay estadísticas"
            message="Registra tu primera transacción y aquí verás tus gráficas de gastos por categoría y la tendencia mensual."
          />
          <Button
            title="Cargar datos de prueba"
            variant="ghost"
            onPress={loadDemoData}
            style={styles.demoButton}
          />
        </Card>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Text style={styles.title}>Estadísticas</Text>

      <Text style={styles.filterLabel}>Periodo</Text>
      <View style={styles.filterRow}>
        <Chip
          label="Todos"
          active={selectedMonth === null}
          onPress={() => setSelectedMonth(null)}
        />
        {availableMonths.map((month) => (
          <Chip
            key={month}
            label={formatMonthLabel(month)}
            active={selectedMonth === month}
            onPress={() => setSelectedMonth(month)}
          />
        ))}
      </View>

      <View style={styles.summaryRow}>
        <StatCard
          label="Ingresos"
          value={periodTotals.income}
          tone="income"
          icon="↑"
          style={styles.summaryCard}
        />
        <StatCard
          label="Gastos"
          value={periodTotals.expense}
          tone="expense"
          icon="↓"
          style={styles.summaryCard}
        />
      </View>

      <StatCard
        label="Balance del periodo"
        value={periodTotals.balance}
        tone={periodTotals.balance < 0 ? 'expense' : 'income'}
        icon="＝"
        style={styles.balanceCard}
      />

      <Card style={styles.chartCard}>
        <SectionHeader title="Gasto por categoría" />
        <CategoryPieChart data={expensesByCategory} width={chartWidth} />
      </Card>

      <Card style={styles.chartCard}>
        <SectionHeader title="Tendencia mensual" />
        <MonthlyTrendChart data={monthlyTotals} width={chartWidth} />
      </Card>
    </ScreenContainer>
  );
}

function Chip({ label, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  title: {
    ...typography.title,
    marginBottom: spacing.md,
  },
  filterLabel: {
    ...typography.label,
    marginBottom: spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.text,
  },
  chipTextActive: {
    color: colors.textInverse,
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  summaryCard: {
    flex: 1,
  },
  balanceCard: {
    marginTop: spacing.md,
  },
  chartCard: {
    marginTop: spacing.lg,
  },
  demoButton: {
    marginTop: spacing.md,
  },
});

import { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { useTransactions, seedMockData } from '../index';
import {
  ScreenContainer,
  Card,
  StatCard,
  Button,
  SectionHeader,
  EmptyState,
} from '../components';
import { colors, spacing, typography, formatCurrency } from '../theme';

export default function HomeScreen({ navigation }) {
  const { transactions, totals, balance, loading, error, refresh } =
    useTransactions();

  const loadDemoData = async () => {
    await seedMockData();
    await refresh();
  };

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={typography.body}>Cargando datos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Error: {String(error?.message || error)}</Text>
      </View>
    );
  }

  const latestTransactions = transactions.slice(0, 5);

  return (
    <ScreenContainer>
      <Text style={styles.title}>Resumen financiero</Text>

      <Card style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Balance actual</Text>
        <Text
          style={[
            styles.balanceValue,
            balance < 0 ? styles.negative : styles.positive,
          ]}
        >
          {formatCurrency(balance)}
        </Text>
      </Card>

      <View style={styles.summaryRow}>
        <StatCard
          label="Ingresos"
          value={totals.income}
          tone="income"
          icon="↑"
          style={styles.summaryCard}
        />
        <StatCard
          label="Gastos"
          value={totals.expense}
          tone="expense"
          icon="↓"
          style={styles.summaryCard}
        />
      </View>

      <Button
        title="+  Agregar transacción"
        onPress={() => navigation.navigate('TransactionForm')}
        style={styles.addButton}
      />

      <SectionHeader
        title="Últimos movimientos"
        actionLabel="Ver historial"
        onAction={() => navigation.navigate('Historial')}
      />

      {latestTransactions.length === 0 ? (
        <Card>
          <EmptyState
            icon="🧾"
            title="Sin movimientos"
            message="Agrega tu primera transacción para empezar a ver tu resumen."
          />
          <Button
            title="Cargar datos de prueba"
            variant="ghost"
            onPress={loadDemoData}
            style={styles.demoButton}
          />
        </Card>
      ) : (
        latestTransactions.map((transaction) => {
          const isExpense = transaction.type === 'expense';

          return (
            <Card key={transaction.id} style={styles.transactionCard}>
              <View style={styles.transactionInfo}>
                <Text style={styles.category}>{transaction.category}</Text>
                <Text style={styles.date}>{transaction.date}</Text>
                {transaction.note ? (
                  <Text style={styles.note}>{transaction.note}</Text>
                ) : null}
              </View>

              <Text
                style={[
                  styles.transactionAmount,
                  isExpense ? styles.negative : styles.positive,
                ]}
              >
                {isExpense ? '-' : '+'}
                {formatCurrency(transaction.amount)}
              </Text>
            </Card>
          );
        })
      )}
    </ScreenContainer>
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
    marginBottom: spacing.lg,
  },
  balanceCard: {
    marginBottom: spacing.md,
  },
  balanceLabel: {
    ...typography.label,
  },
  balanceValue: {
    fontSize: 30,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  summaryCard: {
    flex: 1,
  },
  addButton: {
    marginBottom: spacing.xl,
  },
  demoButton: {
    marginTop: spacing.md,
  },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  transactionInfo: {
    flexShrink: 1,
    paddingRight: spacing.md,
  },
  category: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  date: {
    color: colors.textMuted,
    marginTop: 3,
  },
  note: {
    color: colors.text,
    marginTop: 5,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  positive: {
    color: colors.income,
  },
  negative: {
    color: colors.expense,
  },
  errorText: {
    color: colors.expense,
    ...typography.body,
  },
});

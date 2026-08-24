import { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { useTransactions } from '../index';
import { Card, Button, EmptyState } from '../components';
import {
  colors,
  spacing,
  radii,
  typography,
  formatCurrency,
  formatMonthLabel,
} from '../theme';

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

export default function HistoryScreen({ navigation }) {
  const {
    availableMonths,
    filter,
    deleteTransaction,
    refresh,
    loading,
  } = useTransactions();

  const [selectedType, setSelectedType] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(null);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const filteredTransactions = filter({
    type: selectedType === 'all' ? null : selectedType,
    month: selectedMonth,
  });

  const handleDelete = (transaction) => {
    const removeTransaction = async () => {
      try {
        await deleteTransaction(transaction.id);
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
    };

    if (typeof window !== 'undefined') {
      const confirmed = window.confirm(
        `¿Eliminar la transacción "${transaction.category}"?`
      );
      if (confirmed) removeTransaction();
      return;
    }

    Alert.alert(
      'Eliminar transacción',
      `¿Deseas eliminar "${transaction.category}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: removeTransaction },
      ]
    );
  };

  const renderTransaction = ({ item }) => {
    const isExpense = item.type === 'expense';

    return (
      <Card style={styles.transactionCard}>
        <View style={styles.transactionHeader}>
          <View style={styles.transactionInfo}>
            <Text style={styles.category}>{item.category}</Text>
            <Text style={styles.date}>{item.date}</Text>
          </View>

          <Text
            style={[
              styles.amount,
              isExpense ? styles.negative : styles.positive,
            ]}
          >
            {isExpense ? '-' : '+'}
            {formatCurrency(item.amount)}
          </Text>
        </View>

        {item.note ? <Text style={styles.note}>{item.note}</Text> : null}

        <View style={styles.actions}>
          <Button
            title="Editar"
            variant="primary"
            style={styles.actionButton}
            onPress={() =>
              navigation.navigate('TransactionForm', {
                transactionId: item.id,
              })
            }
          />
          <Button
            title="Eliminar"
            variant="danger"
            style={styles.actionButton}
            onPress={() => handleDelete(item)}
          />
        </View>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={typography.body}>Cargando movimientos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial</Text>

      <Text style={styles.label}>Tipo</Text>
      <View style={styles.filterRow}>
        <Chip
          label="Todos"
          active={selectedType === 'all'}
          onPress={() => setSelectedType('all')}
        />
        <Chip
          label="Ingresos"
          active={selectedType === 'income'}
          onPress={() => setSelectedType('income')}
        />
        <Chip
          label="Gastos"
          active={selectedType === 'expense'}
          onPress={() => setSelectedType('expense')}
        />
      </View>

      {availableMonths.length > 0 ? (
        <>
          <Text style={styles.label}>Mes</Text>
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
        </>
      ) : null}

      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        renderItem={renderTransaction}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="🔍"
            title="Nada por aquí"
            message="No hay movimientos que coincidan con los filtros."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
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
  label: {
    ...typography.label,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
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
  list: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  transactionCard: {
    marginBottom: spacing.md,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  transactionInfo: {
    flexShrink: 1,
  },
  category: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  date: {
    marginTop: 4,
    color: colors.textMuted,
  },
  amount: {
    fontSize: 17,
    fontWeight: '700',
  },
  positive: {
    color: colors.income,
  },
  negative: {
    color: colors.expense,
  },
  note: {
    marginTop: spacing.sm,
    color: colors.text,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
  },
});

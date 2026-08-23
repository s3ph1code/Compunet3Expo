import { useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { useTransactions } from '../index';

export default function HomeScreen({ navigation }) {
  const {
    transactions,
    totals,
    balance,
    loading,
    error,
    refresh,
  } = useTransactions();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Cargando datos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  const latestTransactions = transactions.slice(0, 5);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Resumen financiero</Text>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Balance actual</Text>

        <Text
          style={[
            styles.balanceValue,
            balance < 0 ? styles.negative : styles.positive,
          ]}
        >
          ${balance}
        </Text>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Ingresos</Text>
          <Text style={[styles.summaryValue, styles.positive]}>
            ${totals.income}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Gastos</Text>
          <Text style={[styles.summaryValue, styles.negative]}>
            ${totals.expense}
          </Text>
        </View>
      </View>

      <Pressable
        style={styles.addButton}
        onPress={() => navigation.navigate('TransactionForm')}
      >
        <Text style={styles.addButtonText}>
          + Agregar transacción
        </Text>
      </Pressable>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Últimos movimientos
        </Text>

        <Pressable
          onPress={() => navigation.navigate('Historial')}
        >
          <Text style={styles.viewAllText}>
            Ver historial
          </Text>
        </Pressable>
      </View>

      {latestTransactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No hay movimientos registrados.
          </Text>
        </View>
      ) : (
        latestTransactions.map((transaction) => {
          const isExpense = transaction.type === 'expense';

          return (
            <View
              key={transaction.id}
              style={styles.transactionCard}
            >
              <View>
                <Text style={styles.category}>
                  {transaction.category}
                </Text>

                <Text style={styles.date}>
                  {transaction.date}
                </Text>

                {transaction.note ? (
                  <Text style={styles.note}>
                    {transaction.note}
                  </Text>
                ) : null}
              </View>

              <Text
                style={[
                  styles.transactionAmount,
                  isExpense
                    ? styles.negative
                    : styles.positive,
                ]}
              >
                {isExpense ? '-' : '+'}${transaction.amount}
              </Text>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    paddingBottom: 30,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },

  balanceCard: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 18,
    backgroundColor: '#fff',
    marginBottom: 12,
  },

  balanceLabel: {
    fontSize: 14,
    color: '#666',
  },

  balanceValue: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 6,
  },

  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },

  summaryCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#fff',
  },

  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },

  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 5,
  },

  positive: {
    color: '#16a34a',
  },

  negative: {
    color: '#dc2626',
  },

  addButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 9,
    alignItems: 'center',
    marginBottom: 22,
  },

  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
  },

  viewAllText: {
    color: '#2563eb',
    fontWeight: '600',
  },

  emptyContainer: {
    paddingVertical: 30,
    alignItems: 'center',
  },

  emptyText: {
    color: '#666',
  },

  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    backgroundColor: '#fff',
  },

  category: {
    fontSize: 16,
    fontWeight: '700',
  },

  date: {
    color: '#666',
    marginTop: 3,
  },

  note: {
    color: '#444',
    marginTop: 5,
  },

  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
});
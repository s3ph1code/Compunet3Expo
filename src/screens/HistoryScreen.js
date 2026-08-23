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

export default function HistoryScreen({ navigation }) {
  const {
    transactions,
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

      if (confirmed) {
        removeTransaction();
      }

      return;
    }

    Alert.alert(
      'Eliminar transacción',
      `¿Deseas eliminar "${transaction.category}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: removeTransaction,
        },
      ]
    );
  };

  const renderTransaction = ({ item }) => {
    const isExpense = item.type === 'expense';

    return (
      <View style={styles.transactionCard}>
        <View style={styles.transactionHeader}>
          <View>
            <Text style={styles.category}>
              {item.category}
            </Text>

            <Text style={styles.date}>
              {item.date}
            </Text>
          </View>

          <Text
            style={[
              styles.amount,
              isExpense
                ? styles.expenseAmount
                : styles.incomeAmount,
            ]}
          >
            {isExpense ? '-' : '+'}${item.amount}
          </Text>
        </View>

        {item.note ? (
          <Text style={styles.note}>
            {item.note}
          </Text>
        ) : null}

        <View style={styles.actions}>
          <Pressable
            style={styles.editButton}
            onPress={() =>
              navigation.navigate('TransactionForm', {
                transactionId: item.id,
              })
            }
          >
            <Text style={styles.editButtonText}>
              Editar
            </Text>
          </Pressable>

          <Pressable
            style={styles.deleteButton}
            onPress={() => handleDelete(item)}
          >
            <Text style={styles.deleteButtonText}>
              Eliminar
            </Text>
          </Pressable>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Cargando movimientos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial</Text>

      <Text style={styles.label}>Tipo</Text>

      <View style={styles.filterRow}>
        <Pressable
          style={[
            styles.filterButton,
            selectedType === 'all' &&
              styles.filterButtonActive,
          ]}
          onPress={() => setSelectedType('all')}
        >
          <Text
            style={[
              styles.filterText,
              selectedType === 'all' &&
                styles.filterTextActive,
            ]}
          >
            Todos
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.filterButton,
            selectedType === 'income' &&
              styles.filterButtonActive,
          ]}
          onPress={() => setSelectedType('income')}
        >
          <Text
            style={[
              styles.filterText,
              selectedType === 'income' &&
                styles.filterTextActive,
            ]}
          >
            Ingresos
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.filterButton,
            selectedType === 'expense' &&
              styles.filterButtonActive,
          ]}
          onPress={() => setSelectedType('expense')}
        >
          <Text
            style={[
              styles.filterText,
              selectedType === 'expense' &&
                styles.filterTextActive,
            ]}
          >
            Gastos
          </Text>
        </Pressable>
      </View>

      {availableMonths.length > 0 ? (
        <>
          <Text style={styles.label}>Mes</Text>

          <View style={styles.filterRow}>
            <Pressable
              style={[
                styles.filterButton,
                selectedMonth === null &&
                  styles.filterButtonActive,
              ]}
              onPress={() => setSelectedMonth(null)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedMonth === null &&
                    styles.filterTextActive,
                ]}
              >
                Todos
              </Text>
            </Pressable>

            {availableMonths.map((month) => (
              <Pressable
                key={month}
                style={[
                  styles.filterButton,
                  selectedMonth === month &&
                    styles.filterButtonActive,
                ]}
                onPress={() => setSelectedMonth(month)}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedMonth === month &&
                      styles.filterTextActive,
                  ]}
                >
                  {month}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}

      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        renderItem={renderTransaction}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No hay movimientos para mostrar.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },

  label: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 6,
  },

  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },

  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 18,
  },

  filterButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },

  filterText: {
    color: '#333',
  },

  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },

  list: {
    paddingTop: 12,
    paddingBottom: 24,
  },

  transactionCard: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    backgroundColor: '#fff',
  },

  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },

  category: {
    fontSize: 17,
    fontWeight: '700',
  },

  date: {
    marginTop: 4,
    color: '#666',
  },

  amount: {
    fontSize: 17,
    fontWeight: '700',
  },

  expenseAmount: {
    color: '#dc2626',
  },

  incomeAmount: {
    color: '#16a34a',
  },

  note: {
    marginTop: 8,
    color: '#444',
  },

  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },

  editButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#2563eb',
  },

  editButtonText: {
    color: '#fff',
    fontWeight: '600',
  },

  deleteButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#dc2626',
  },

  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
  },

  emptyText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#666',
  },
});
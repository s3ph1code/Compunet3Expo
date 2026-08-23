import { useCallback } from 'react';
import { View, Text, Button } from 'react-native';
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
      <View>
        <Text>Cargando datos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  const latestTransactions = transactions.slice(0, 5);

  return (
    <View>
      <Text>Inicio</Text>

      <Text>Balance: ${balance}</Text>
      <Text>Ingresos: ${totals.income}</Text>
      <Text>Gastos: ${totals.expense}</Text>

      <Text>Últimos movimientos</Text>

      {latestTransactions.length === 0 ? (
        <Text>No hay movimientos registrados.</Text>
      ) : (
        latestTransactions.map((transaction) => (
          <View key={transaction.id}>
            <Text>
              {transaction.category} - ${transaction.amount}
            </Text>

            <Text>
              {transaction.type === 'expense' ? 'Gasto' : 'Ingreso'}
            </Text>

            <Text>{transaction.note}</Text>
          </View>
        ))
      )}

      <Button
        title="Agregar transacción"
        onPress={() => navigation.navigate('TransactionForm')}
      />
    </View>
  );
}
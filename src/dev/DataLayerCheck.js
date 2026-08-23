import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { seedMockData } from '../data/mockData';
import { clearAllTransactions } from '../data/transactionsRepository';
import { useTransactions } from '../hooks/useTransactions';

/**
 * Pantalla de verificación de la capa de datos. NO es parte de la app final.
 *
 * Sirve para comprobar en un dispositivo real lo que los tests no pueden:
 * que AsyncStorage guarde de verdad y que los datos sobrevivan a cerrar la app.
 *
 * Para usarla, reemplaza temporalmente el contenido de App.js por:
 *
 *   import DataLayerCheck from './src/dev/DataLayerCheck';
 *   export default DataLayerCheck;
 *
 * Cómo verificar la persistencia:
 *   1. Toca "Cargar datos de prueba" y confirma que aparecen 22 transacciones.
 *   2. Toca "Agregar gasto de $5.000" un par de veces y mira cambiar el balance.
 *   3. Cierra la app por completo y vuelve a abrirla.
 *   4. Si el balance y el conteo siguen igual, la persistencia funciona.
 */
export default function DataLayerCheck() {
  const {
    transactions,
    loading,
    error,
    balance,
    totals,
    monthlyTotals,
    totalsByCategory,
    addTransaction,
    deleteTransaction,
    refresh,
  } = useTransactions();

  const [ultimaAccion, setUltimaAccion] = useState('—');

  /** Ejecuta una acción y deja anotado qué pasó, para verlo en pantalla. */
  async function ejecutar(nombre, accion) {
    try {
      await accion();
      setUltimaAccion(`✅ ${nombre}`);
    } catch (err) {
      setUltimaAccion(`❌ ${nombre}: ${err.message}`);
    }
  }

  const porCategoria = totalsByCategory();

  if (loading) {
    return (
      <View style={styles.centrado}>
        <Text style={styles.titulo}>Cargando del dispositivo…</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.contenedor}>
      <Text style={styles.titulo}>Verificación de la capa de datos</Text>

      <View style={styles.tarjeta}>
        <Text style={styles.etiqueta}>Balance</Text>
        <Text style={styles.balance}>{formatear(balance)}</Text>
        <Text style={styles.detalle}>
          Ingresos {formatear(totals.income)} · Gastos {formatear(totals.expense)}
        </Text>
        <Text style={styles.detalle}>{transactions.length} transacciones guardadas</Text>
      </View>

      <View style={styles.tarjeta}>
        <Text style={styles.etiqueta}>Última acción</Text>
        <Text style={styles.detalle}>{ultimaAccion}</Text>
        {error ? <Text style={styles.error}>error: {error.message}</Text> : null}
      </View>

      <Boton
        titulo="Cargar datos de prueba"
        onPress={() => ejecutar('Datos de prueba cargados', async () => {
          await seedMockData();
          await refresh();
        })}
      />

      <Boton
        titulo="Agregar gasto de $5.000"
        onPress={() => ejecutar('Gasto agregado', () =>
          addTransaction({
            type: 'expense',
            amount: 5000,
            category: 'Otros',
            date: new Date().toISOString().slice(0, 10),
            note: 'Prueba',
          })
        )}
      />

      <Boton
        titulo="Intentar guardar un monto inválido"
        onPress={() => ejecutar('La validación rechazó el monto', () =>
          addTransaction({
            type: 'expense',
            amount: -1,
            category: 'Otros',
            date: '2026-08-23',
          })
        )}
      />

      <Boton
        titulo="Borrar la primera"
        onPress={() => ejecutar('Transacción borrada', () => {
          if (transactions.length === 0) {
            throw new Error('No hay transacciones que borrar.');
          }
          return deleteTransaction(transactions[0].id);
        })}
      />

      <Boton
        titulo="Borrar todo"
        onPress={() => ejecutar('Todo borrado', async () => {
          await clearAllTransactions();
          await refresh();
        })}
      />

      <Text style={styles.etiqueta}>Gastos por categoría</Text>
      {porCategoria.length === 0 ? (
        <Text style={styles.detalle}>Sin gastos registrados.</Text>
      ) : (
        porCategoria.map((fila) => (
          <Text key={fila.category} style={styles.fila}>
            {fila.category}: {formatear(fila.total)}
          </Text>
        ))
      )}

      <Text style={styles.etiqueta}>Totales por mes</Text>
      {monthlyTotals.length === 0 ? (
        <Text style={styles.detalle}>Sin movimientos.</Text>
      ) : (
        monthlyTotals.map((mes) => (
          <Text key={mes.month} style={styles.fila}>
            {mes.month}: balance {formatear(mes.balance)}
          </Text>
        ))
      )}

      <Text style={styles.etiqueta}>Últimas 5 transacciones</Text>
      {transactions.slice(0, 5).map((transaction) => (
        <Text key={transaction.id} style={styles.fila}>
          {transaction.date} · {transaction.type === 'income' ? '+' : '−'}
          {formatear(transaction.amount)} · {transaction.category}
        </Text>
      ))}
    </ScrollView>
  );
}

function Boton({ titulo, onPress }) {
  return (
    <Pressable style={styles.boton} onPress={onPress}>
      <Text style={styles.textoBoton}>{titulo}</Text>
    </Pressable>
  );
}

/** Formatea un número como pesos, sin decimales. */
function formatear(valor) {
  return `$${valor.toLocaleString('es-CO')}`;
}

const styles = StyleSheet.create({
  contenedor: { padding: 20, paddingTop: 60, gap: 10 },
  centrado: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  titulo: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
  tarjeta: {
    backgroundColor: '#f2f2f7',
    borderRadius: 12,
    padding: 14,
    gap: 4,
  },
  etiqueta: { fontSize: 12, color: '#6b6b70', marginTop: 12, textTransform: 'uppercase' },
  balance: { fontSize: 30, fontWeight: '700' },
  detalle: { fontSize: 13, color: '#3a3a3c' },
  error: { fontSize: 13, color: '#c0392b' },
  fila: { fontSize: 14, paddingVertical: 2 },
  boton: {
    backgroundColor: '#1c1c1e',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  textoBoton: { color: '#fff', textAlign: 'center', fontWeight: '600' },
});

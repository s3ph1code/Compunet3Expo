import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';

import {
  useTransactions,
  getCategoriesForType,
  getTransactionById,
  TRANSACTION_TYPES,
} from '../index';

export default function TransactionFormScreen({
  navigation,
  route,
}) {
  const {
    addTransaction,
    updateTransaction,
  } = useTransactions();

  const transactionId = route.params?.transactionId;
  const isEditing = Boolean(transactionId);

  const [type, setType] = useState(TRANSACTION_TYPES.EXPENSE);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [saveError, setSaveError] = useState('');
  const [loadingTransaction, setLoadingTransaction] = useState(false);

  const categories = getCategoriesForType(type);

  useEffect(() => {
    const loadTransaction = async () => {
      if (!isEditing) {
        return;
      }

      setLoadingTransaction(true);

      try {
        const transaction = await getTransactionById(transactionId);

        if (!transaction) {
          setSaveError('No se encontró la transacción.');
          return;
        }

        setType(transaction.type);
        setAmount(String(transaction.amount));
        setCategory(transaction.category);
        setDate(transaction.date);
        setNote(transaction.note || '');
      } catch (error) {
        setSaveError(
          error?.message || 'No se pudo cargar la transacción'
        );
      } finally {
        setLoadingTransaction(false);
      }
    };

    loadTransaction();
  }, [isEditing, transactionId]);

  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Editar transacción' : 'Nueva transacción',
    });
  }, [navigation, isEditing]);

  const handleTypeChange = (newType) => {
    setType(newType);
    setCategory('');
    setSaveError('');
  };

  const handleSave = async () => {
    setSaveError('');

    const transactionData = {
      type,
      amount: Number(amount),
      category,
      date,
      note,
    };

    try {
      if (isEditing) {
        await updateTransaction(
          transactionId,
          transactionData
        );
      } else {
        await addTransaction(transactionData);
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error al guardar:', error);

      setSaveError(
        error?.message || 'No se pudo guardar la transacción'
      );
    }
  };

  if (loadingTransaction) {
    return (
      <View style={styles.center}>
        <Text>Cargando transacción...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        {isEditing
          ? 'Editar transacción'
          : 'Nueva transacción'}
      </Text>

      <Text style={styles.label}>Tipo</Text>

      <View style={styles.row}>
        <Pressable
          style={[
            styles.typeButton,
            type === TRANSACTION_TYPES.INCOME &&
              styles.typeButtonActive,
          ]}
          onPress={() =>
            handleTypeChange(TRANSACTION_TYPES.INCOME)
          }
        >
          <Text
            style={[
              styles.typeButtonText,
              type === TRANSACTION_TYPES.INCOME &&
                styles.typeButtonTextActive,
            ]}
          >
            Ingreso
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.typeButton,
            type === TRANSACTION_TYPES.EXPENSE &&
              styles.typeButtonActive,
          ]}
          onPress={() =>
            handleTypeChange(TRANSACTION_TYPES.EXPENSE)
          }
        >
          <Text
            style={[
              styles.typeButtonText,
              type === TRANSACTION_TYPES.EXPENSE &&
                styles.typeButtonTextActive,
            ]}
          >
            Gasto
          </Text>
        </Pressable>
      </View>

      <Text style={styles.label}>Monto</Text>

      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={(value) => {
          setAmount(value);
          setSaveError('');
        }}
        placeholder="Ej: 25000"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Categoría</Text>

      <View style={styles.categoriesContainer}>
        {categories.map((item) => {
          const isSelected = category === item;

          return (
            <Pressable
              key={item}
              style={[
                styles.categoryButton,
                isSelected &&
                  styles.categoryButtonActive,
              ]}
              onPress={() => {
                setCategory(item);
                setSaveError('');
              }}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  isSelected &&
                    styles.categoryButtonTextActive,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.selectedText}>
        Categoría seleccionada:{' '}
        <Text style={styles.selectedValue}>
          {category || 'Ninguna'}
        </Text>
      </Text>

      <Text style={styles.label}>Fecha</Text>

      <TextInput
        style={styles.input}
        value={date}
        onChangeText={(value) => {
          setDate(value);
          setSaveError('');
        }}
        placeholder="YYYY-MM-DD"
      />

      <Text style={styles.label}>Nota</Text>

      <TextInput
        style={[styles.input, styles.noteInput]}
        value={note}
        onChangeText={(value) => {
          setNote(value);
          setSaveError('');
        }}
        placeholder="Descripción opcional"
        multiline
      />

      {saveError ? (
        <Text style={styles.errorText}>
          {saveError}
        </Text>
      ) : null}

      <Pressable
        style={styles.saveButton}
        onPress={handleSave}
      >
        <Text style={styles.saveButtonText}>
          {isEditing
            ? 'Guardar cambios'
            : 'Guardar transacción'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 10,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
  },

  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },

  row: {
    flexDirection: 'row',
    gap: 10,
  },

  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    alignItems: 'center',
  },

  typeButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },

  typeButtonText: {
    fontSize: 16,
    color: '#333',
  },

  typeButtonTextActive: {
    color: '#fff',
    fontWeight: '700',
  },

  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },

  noteInput: {
    minHeight: 90,
    textAlignVertical: 'top',
  },

  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  categoryButton: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  categoryButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },

  categoryButtonText: {
    color: '#333',
  },

  categoryButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },

  selectedText: {
    marginTop: 4,
    fontSize: 14,
    color: '#555',
  },

  selectedValue: {
    fontWeight: '700',
  },

  errorText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
  },

  saveButton: {
    marginTop: 20,
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },

  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
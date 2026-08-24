import { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import {
  useTransactions,
  getCategoriesForType,
  getTransactionById,
  TRANSACTION_TYPES,
} from '../index';
import { ScreenContainer, Input, Button } from '../components';
import { colors, spacing, radii, typography } from '../theme';

export default function TransactionFormScreen({ navigation, route }) {
  const { addTransaction, updateTransaction } = useTransactions();

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
      if (!isEditing) return;

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
        setSaveError(error?.message || 'No se pudo cargar la transacción');
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
        await updateTransaction(transactionId, transactionData);
      } else {
        await addTransaction(transactionData);
      }
      navigation.goBack();
    } catch (error) {
      console.error('Error al guardar:', error);
      setSaveError(error?.message || 'No se pudo guardar la transacción');
    }
  };

  if (loadingTransaction) {
    return (
      <View style={styles.center}>
        <Text style={typography.body}>Cargando transacción...</Text>
      </View>
    );
  }

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <Text style={styles.title}>
        {isEditing ? 'Editar transacción' : 'Nueva transacción'}
      </Text>

      <Text style={styles.label}>Tipo</Text>
      <View style={styles.row}>
        <Pressable
          style={[
            styles.typeButton,
            type === TRANSACTION_TYPES.INCOME && styles.typeIncomeActive,
          ]}
          onPress={() => handleTypeChange(TRANSACTION_TYPES.INCOME)}
        >
          <Text
            style={[
              styles.typeText,
              type === TRANSACTION_TYPES.INCOME && styles.typeTextActive,
            ]}
          >
            Ingreso
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.typeButton,
            type === TRANSACTION_TYPES.EXPENSE && styles.typeExpenseActive,
          ]}
          onPress={() => handleTypeChange(TRANSACTION_TYPES.EXPENSE)}
        >
          <Text
            style={[
              styles.typeText,
              type === TRANSACTION_TYPES.EXPENSE && styles.typeTextActive,
            ]}
          >
            Gasto
          </Text>
        </Pressable>
      </View>

      <Input
        label="Monto"
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
                styles.categoryChip,
                isSelected && styles.categoryChipActive,
              ]}
              onPress={() => {
                setCategory(item);
                setSaveError('');
              }}
            >
              <Text
                style={[
                  styles.categoryText,
                  isSelected && styles.categoryTextActive,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Input
        label="Fecha"
        value={date}
        onChangeText={(value) => {
          setDate(value);
          setSaveError('');
        }}
        placeholder="YYYY-MM-DD"
      />

      <Input
        label="Nota"
        value={note}
        onChangeText={(value) => {
          setNote(value);
          setSaveError('');
        }}
        placeholder="Descripción opcional"
        multiline
        inputStyle={styles.noteInput}
      />

      {saveError ? <Text style={styles.errorText}>{saveError}</Text> : null}

      <Button
        title={isEditing ? 'Guardar cambios' : 'Guardar transacción'}
        variant="success"
        onPress={handleSave}
        style={styles.saveButton}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  title: {
    ...typography.title,
  },
  label: {
    ...typography.label,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  typeIncomeActive: {
    backgroundColor: colors.income,
    borderColor: colors.income,
  },
  typeExpenseActive: {
    backgroundColor: colors.expense,
    borderColor: colors.expense,
  },
  typeText: {
    fontSize: 16,
    color: colors.text,
  },
  typeTextActive: {
    color: colors.textInverse,
    fontWeight: '700',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    color: colors.text,
  },
  categoryTextActive: {
    color: colors.textInverse,
    fontWeight: '600',
  },
  noteInput: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  errorText: {
    color: colors.expense,
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    marginTop: spacing.md,
  },
});

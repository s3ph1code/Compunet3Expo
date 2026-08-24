import { View, Text, TextInput, StyleSheet } from 'react-native';

import { colors, radii, spacing, typography } from '../theme';

/**
 * Campo de texto con etiqueta arriba, coherente con el resto de la app.
 * Reenvía cualquier prop extra al TextInput (keyboardType, multiline, etc.).
 */
export default function Input({ label, style, inputStyle, ...rest }) {
  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <TextInput
        style={[styles.input, inputStyle]}
        placeholderTextColor={colors.textMuted}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    ...typography.label,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
});

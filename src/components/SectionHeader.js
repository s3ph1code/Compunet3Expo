import { View, Text, Pressable, StyleSheet } from 'react-native';

import { colors, spacing, typography } from '../theme';

/**
 * Encabezado de sección: título a la izquierda y una acción opcional a la derecha.
 *
 * @param {string} title
 * @param {string} [actionLabel] texto del enlace de acción (ej: "Ver historial")
 * @param {() => void} [onAction]
 */
export default function SectionHeader({ title, actionLabel, onAction }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      {actionLabel && onAction ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.sectionTitle,
  },
  action: {
    color: colors.primary,
    fontWeight: '600',
  },
});

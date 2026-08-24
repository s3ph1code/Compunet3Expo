import { View, Text, StyleSheet } from 'react-native';

import { colors, spacing, typography } from '../theme';

/**
 * Estado vacío reutilizable: un ícono grande, un título y un texto de ayuda.
 * Se usa cuando todavía no hay transacciones o cuando un filtro no arroja nada.
 *
 * @param {string} [icon] emoji o texto corto que sirve de ilustración
 * @param {string} title
 * @param {string} [message]
 */
export default function EmptyState({ icon = '📭', title, message }) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  icon: {
    fontSize: 42,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.sectionTitle,
    textAlign: 'center',
  },
  message: {
    ...typography.caption,
    textAlign: 'center',
    lineHeight: 20,
  },
});

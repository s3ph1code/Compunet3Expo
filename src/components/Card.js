import { View, StyleSheet } from 'react-native';

import { colors, radii, spacing, shadow } from '../theme';

/**
 * Tarjeta blanca con borde suave y sombra. Base visual de casi toda la app.
 */
export default function Card({ style, children, ...rest }) {
  return (
    <View style={[styles.card, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadow,
  },
});

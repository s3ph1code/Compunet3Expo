import { Pressable, Text, StyleSheet } from 'react-native';

import { colors, radii, spacing } from '../theme';

/**
 * Botón reutilizable con tres variantes de color.
 *
 * @param {string} title texto del botón
 * @param {() => void} onPress
 * @param {'primary'|'success'|'danger'|'ghost'} [variant]
 * @param {object} [style] estilos extra para el contenedor
 */
export default function Button({
  title,
  onPress,
  variant = 'primary',
  style,
  ...rest
}) {
  const isGhost = variant === 'ghost';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && styles.pressed,
        style,
      ]}
      {...rest}
    >
      <Text style={[styles.text, isGhost && styles.ghostText]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  success: {
    backgroundColor: colors.income,
  },
  danger: {
    backgroundColor: colors.expense,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  text: {
    color: colors.textInverse,
    fontSize: 16,
    fontWeight: '700',
  },
  ghostText: {
    color: colors.primary,
  },
});

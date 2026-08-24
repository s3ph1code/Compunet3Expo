import { ScrollView, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '../theme';

/**
 * Envoltura estándar de pantalla: fondo gris claro y padding consistente.
 * Respeta el notch/barra inferior con safe-area.
 *
 * @param {boolean} [scroll=true] si es false usa un View fijo (para FlatList, etc.)
 */
export default function ScreenContainer({
  children,
  scroll = true,
  contentContainerStyle,
  style,
}) {
  const insets = useSafeAreaInsets();

  const padding = {
    padding: spacing.lg,
    paddingBottom: spacing.xl + insets.bottom,
  };

  if (scroll) {
    return (
      <ScrollView
        style={[styles.screen, style]}
        contentContainerStyle={[padding, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={[styles.screen, padding, style]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

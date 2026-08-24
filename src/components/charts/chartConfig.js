import { colors } from '../../theme';

/**
 * Configuración base compartida por las gráficas de react-native-chart-kit,
 * para que todas tengan el mismo estilo (fondo blanco, texto oscuro, etc.).
 */
export const baseChartConfig = {
  backgroundColor: colors.surface,
  backgroundGradientFrom: colors.surface,
  backgroundGradientTo: colors.surface,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
  labelColor: () => colors.textMuted,
  propsForDots: {
    r: '4',
    strokeWidth: '2',
    stroke: colors.primary,
  },
  propsForBackgroundLines: {
    stroke: colors.border,
  },
};

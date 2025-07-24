import { Platform } from 'react-native';

// ============================================================================
// PALETA DE COLORES BASE
// ============================================================================
const baseColors = {
  // Colores primarios
  purple: {
    50: '#F3E8FF',
    100: '#E9D5FF', 
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#8B5CF6',
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
    950: '#2E1065',
  },
  
  // Colores de acento (amarillo)
  yellow: {
    50: '#FEFCE8',
    100: '#FEF9C3',
    200: '#FEF08A',
    300: '#FDE047',
    400: '#FACC15',
    500: '#EAB308',
    600: '#CA8A04',
    700: '#A16207',
    800: '#854D0E',
    900: '#713F12',
    950: '#422006',
  },

  // Escala de grises
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
    950: '#030712',
  },

  // Colores de estado
  success: {
    50: '#F0FDF4',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
  },
  
  warning: {
    50: '#FFFBEB',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
  },
  
  error: {
    50: '#FEF2F2',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
  },

  info: {
    50: '#EFF6FF',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
  },

  // Colores base
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

// ============================================================================
// TEMA DE COLORES PARA LA APLICACIÓN
// ============================================================================
export const colors = {
  // Colores principales
  primary: baseColors.purple[600],        // #7C3AED
  primaryLight: baseColors.purple[500],   // #8B5CF6
  primaryDark: baseColors.purple[700],    // #6D28D9
  
  // Colores de acento
  accent: baseColors.yellow[400],         // #FACC15
  accentLight: baseColors.yellow[300],    // #FDE047
  accentDark: baseColors.yellow[500],     // #EAB308

  // Fondos
  background: baseColors.purple[600],     // Fondo principal (morado)
  backgroundAlt: baseColors.white,        // Fondo alternativo para cards
  backgroundInput: baseColors.white,      // Fondo para inputs
  backgroundOverlay: baseColors.black + '50', // Overlay con transparencia
  
  // Fondos de superficie
  surface: baseColors.white,
  surfaceVariant: baseColors.gray[50],
  surfaceDisabled: baseColors.gray[100],
  
  // Textos
  text: baseColors.black,                 // Texto principal
  textSecondary: baseColors.gray[600],    // Texto secundario
  textMuted: baseColors.gray[500],        // Texto deshabilitado
  textInverse: baseColors.white,          // Texto sobre fondos oscuros
  textOnPrimary: baseColors.white,        // Texto sobre color primario
  textOnAccent: baseColors.black,         // Texto sobre color de acento

  // Bordes y divisores
  border: baseColors.gray[200],
  borderLight: baseColors.gray[100],
  borderDark: baseColors.gray[300],
  divider: baseColors.gray[200],

  // Estados
  success: baseColors.success[500],
  successLight: baseColors.success[50],
  successDark: baseColors.success[700],
  
  warning: baseColors.warning[500],
  warningLight: baseColors.warning[50],
  warningDark: baseColors.warning[700],
  
  error: baseColors.error[500],
  errorLight: baseColors.error[50],
  errorDark: baseColors.error[700],
  
  info: baseColors.info[500],
  infoLight: baseColors.info[50],
  infoDark: baseColors.info[700],

  // Estados de interacción
  hover: baseColors.gray[50],
  pressed: baseColors.gray[100],
  focus: baseColors.purple[100],
  disabled: baseColors.gray[300],

  // Sombras
  shadow: baseColors.black,
  shadowLight: baseColors.gray[400],

  // Compatibilidad con versión anterior
  secondaryText: baseColors.gray[600],    // Mantener para compatibilidad

  // Exponer escalas completas para acceso seguro y buenas prácticas
  gray: baseColors.gray,        // Escala de grises (para backgrounds, borders, etc)
  success: baseColors.success,  // Escala de éxito
  warning: baseColors.warning,  // Escala de advertencia
  error: baseColors.error,      // Escala de error
  info: baseColors.info,        // Escala de información
};

// ============================================================================
// TIPOGRAFÍA
// ============================================================================
const fontFamilies = {
  primary: 'Montserrat_400Regular',
  secondary: 'Chicalo-Regular',
  
  // Variantes de peso (si tienes más fuentes disponibles)
  light: Platform.select({
    ios: 'Montserrat-Light',
    android: 'Montserrat_300Light',
    default: 'Montserrat_400Regular',
  }),
  regular: 'Montserrat_400Regular',
  medium: Platform.select({
    ios: 'Montserrat-Medium', 
    android: 'Montserrat_500Medium',
    default: 'Montserrat_400Regular',
  }),
  semibold: Platform.select({
    ios: 'Montserrat-SemiBold',
    android: 'Montserrat_600SemiBold', 
    default: 'Montserrat_400Regular',
  }),
  bold: Platform.select({
    ios: 'Montserrat-Bold',
    android: 'Montserrat_700Bold',
    default: 'Montserrat_400Regular',
  }),
};

// Escala tipográfica basada en Material Design 3
export const typography = {
  // Display styles
  displayLarge: {
    fontFamily: fontFamilies.regular,
    fontSize: 57,
    lineHeight: 64,
    letterSpacing: 0,
    fontWeight: '400',
  },
  displayMedium: {
    fontFamily: fontFamilies.regular,
    fontSize: 45,
    lineHeight: 52,
    letterSpacing: 0,
    fontWeight: '400',
  },
  displaySmall: {
    fontFamily: fontFamilies.regular,
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: 0,
    fontWeight: '400',
  },

  // Headline styles
  headlineLarge: {
    fontFamily: fontFamilies.regular,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: 0,
    fontWeight: '400',
  },
  headlineMedium: {
    fontFamily: fontFamilies.regular,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: 0,
    fontWeight: '400',
  },
  headlineSmall: {
    fontFamily: fontFamilies.regular,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0,
    fontWeight: '400',
  },

  // Title styles
  titleLarge: {
    fontFamily: fontFamilies.regular,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 0,
    fontWeight: '400',
  },
  titleMedium: {
    fontFamily: fontFamilies.medium,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    fontWeight: '500',
  },
  titleSmall: {
    fontFamily: fontFamilies.medium,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
    fontWeight: '500',
  },

  // Body styles
  bodyLarge: {
    fontFamily: fontFamilies.regular,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    fontWeight: '400',
  },
  bodyMedium: {
    fontFamily: fontFamilies.regular,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
    fontWeight: '400',
  },
  bodySmall: {
    fontFamily: fontFamilies.regular,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    fontWeight: '400',
  },

  // Label styles
  labelLarge: {
    fontFamily: fontFamilies.medium,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
    fontWeight: '500',
  },
  labelMedium: {
    fontFamily: fontFamilies.medium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
    fontWeight: '500',
  },
  labelSmall: {
    fontFamily: fontFamilies.medium,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.5,
    fontWeight: '500',
  },
};

// Estilos tipográficos con colores aplicados (compatibilidad)
export const fonts = {
  // Estilos principales con colores
  title: {
    ...typography.headlineMedium,
    color: colors.primary,
  },
  subtitle: {
    fontFamily: fontFamilies.secondary,
    fontSize: 20,
    lineHeight: 28,
    color: colors.accent,
  },
  body: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  bodyLarge: {
    ...typography.bodyLarge,
    color: colors.text,
  },

  // React Native Paper variants con colores
  displayLarge: { ...typography.displayLarge, color: colors.text },
  displayMedium: { ...typography.displayMedium, color: colors.text },
  displaySmall: { ...typography.displaySmall, color: colors.text },
  
  headlineLarge: { ...typography.headlineLarge, color: colors.primary },
  headlineMedium: { ...typography.headlineMedium, color: colors.primary },
  headlineSmall: { ...typography.headlineSmall, color: colors.primary },
  
  titleLarge: { ...typography.titleLarge, color: colors.primary },
  titleMedium: { ...typography.titleMedium, color: colors.primary },
  titleSmall: { ...typography.titleSmall, color: colors.primary },
  
  bodyMedium: { ...typography.bodyMedium, color: colors.text },
  bodySmall: { ...typography.bodySmall, color: colors.text },
  
  labelLarge: { ...typography.labelLarge, color: colors.primary },
  labelMedium: { ...typography.labelMedium, color: colors.text },
  labelSmall: { ...typography.labelSmall, color: colors.text },
};

// ============================================================================
// ESPACIADO Y DIMENSIONES
// ============================================================================
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const shadows = {
  small: {
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  extraLarge: {
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
};

// ============================================================================
// TEMA COMPLETO PARA REACT NATIVE PAPER
// ============================================================================
export const paperTheme = {
  colors: {
    primary: colors.primary,
    primaryContainer: colors.primaryLight,
    secondary: colors.accent,
    secondaryContainer: colors.accentLight,
    tertiary: colors.info[500],
    tertiaryContainer: colors.info[50],
    surface: colors.surface,
    surfaceVariant: colors.surfaceVariant,
    surfaceDisabled: colors.surfaceDisabled,
    background: colors.backgroundAlt,
    error: colors.error[500],
    errorContainer: colors.error[50],
    onPrimary: colors.textOnPrimary,
    onPrimaryContainer: colors.primary,
    onSecondary: colors.textOnAccent,
    onSecondaryContainer: colors.accent,
    onTertiary: colors.white,
    onTertiaryContainer: colors.info[500],
    onSurface: colors.text,
    onSurfaceVariant: colors.textSecondary,
    onSurfaceDisabled: colors.textMuted,
    onBackground: colors.text,
    onError: colors.white,
    onErrorContainer: colors.error[500],
    outline: colors.border,
    outlineVariant: colors.borderLight,
    inverseSurface: colors.gray[800],
    inverseOnSurface: colors.white,
    inversePrimary: colors.primaryLight,
    shadow: colors.shadow,
    scrim: colors.backgroundOverlay,
    backdrop: colors.backgroundOverlay,
    // Añadido para compatibilidad con React Native Paper (PaperProvider)
    elevation: {
      level0: colors.surface,
      level1: colors.surface,
      level2: colors.surfaceVariant,
      level3: colors.surfaceVariant,
      level4: colors.surfaceVariant,
      level5: colors.surfaceVariant,
    },
  },
  fonts: {
    displayLarge: typography.displayLarge,
    displayMedium: typography.displayMedium,
    displaySmall: typography.displaySmall,
    headlineLarge: typography.headlineLarge,
    headlineMedium: typography.headlineMedium,
    headlineSmall: typography.headlineSmall,
    titleLarge: typography.titleLarge,
    titleMedium: typography.titleMedium,
    titleSmall: typography.titleSmall,
    bodyLarge: typography.bodyLarge,
    bodyMedium: typography.bodyMedium,
    bodySmall: typography.bodySmall,
    labelLarge: typography.labelLarge,
    labelMedium: typography.labelMedium,
    labelSmall: typography.labelSmall,
  },
};

// ============================================================================
// TEMA PRINCIPAL DE LA APLICACIÓN
// ============================================================================
export const appTheme = {
  colors,
  fonts,
  typography,
  spacing,
  borderRadius,
  shadows,
  paperTheme,
  
  // Utilidades
  utils: {
    // Función para crear variantes de color con opacidad
    withOpacity: (color, opacity) => `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
    
    // Función para obtener color de texto apropiado según el fondo
    getTextColor: (backgroundColor) => {
      // Lógica simple - en una implementación real usarías una función más sofisticada
      const darkBackgrounds = [colors.primary, colors.primaryDark, colors.background];
      return darkBackgrounds.includes(backgroundColor) ? colors.textInverse : colors.text;
    },
    
    // Función para obtener sombra según elevación
    getShadow: (elevation) => {
      if (elevation <= 2) return shadows.small;
      if (elevation <= 4) return shadows.medium;
      if (elevation <= 8) return shadows.large;
      return shadows.extraLarge;
    },
  },
};

// Exportación por defecto
export default appTheme; 
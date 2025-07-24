// Paleta de colores y tipografías globales
export const colors = {
  primary: '#5E17EB',
  accent: '#FFD605',
  background: '#FFFFFF',
  text: '#000000',
};

export const fonts = {
  title: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 28,
    color: colors.primary,
  },
  subtitle: {
    fontFamily: 'Chicalo-Regular',
    fontSize: 20,
    color: colors.accent,
  },
  body: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 16,
    color: colors.text,
  },
  bodyLarge: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 18,
    color: colors.text,
  },
  // Variantes estándar de React Native Paper
  labelLarge: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 16,
    color: colors.primary,
  },
  titleLarge: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 22,
    color: colors.primary,
  },
  bodyMedium: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 16,
    color: colors.text,
  },
  bodySmall: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 14,
    color: colors.text,
  },
  // Puedes agregar más variantes según lo que use tu UI
};

export const appTheme = {
  ...colors,
  fonts,
}; 
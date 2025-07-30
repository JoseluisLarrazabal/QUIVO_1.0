import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Animated,
  Pressable,
  Text,
} from 'react-native';
import {
  Card,
  Button,
  TextInput,
  Divider,
  Surface,
  IconButton,
  Chip,
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import { colors, typography, spacing, borderRadius, shadows, appTheme, chicaloStyles } from '../theme';

const RegisterCardScreen = ({ navigation }) => {
  const { user, refreshUserCards } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    uid: '',
    alias: '',
    tipo_tarjeta: 'adulto',
    saldo_inicial: '',
  });
  const [focusedField, setFocusedField] = useState(null);
  const [scaleAnimation] = useState(new Animated.Value(1));

  const cardTypes = [
    {
      id: 'adulto',
      label: 'Adulto',
      icon: '👤',
      color: colors.primary,
      description: 'Tarjeta estándar para adultos',
    },
    {
      id: 'estudiante',
      label: 'Estudiante',
      icon: '🎓',
      color: colors.success,
      description: 'Tarjeta con descuento estudiantil',
    },
    {
      id: 'adulto_mayor',
      label: 'Adulto Mayor',
      icon: '👴',
      color: colors.accent,
      description: 'Tarjeta con beneficios especiales',
    },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.uid.trim()) {
      Alert.alert('Error', 'El UID de la tarjeta es requerido');
      return false;
    }

    if (formData.uid.trim().length < 4) {
      Alert.alert('Error', 'El UID debe tener al menos 4 caracteres');
      return false;
    }

    if (formData.alias.trim().length > 50) {
      Alert.alert('Error', 'El alias no puede tener más de 50 caracteres');
      return false;
    }

    if (formData.saldo_inicial && parseFloat(formData.saldo_inicial) < 0) {
      Alert.alert('Error', 'El saldo inicial no puede ser negativo');
      return false;
    }

    return true;
  };

  const handleRegisterCard = async () => {
    if (!validateForm()) return;
    
    if (!user || !user.id) {
      Alert.alert('Error', 'No se pudo identificar al usuario. Por favor, inicia sesión nuevamente.');
      return;
    }

    // Animación del botón
    Animated.sequence([
      Animated.timing(scaleAnimation, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setLoading(true);
    try {
      const cardData = {
        uid: formData.uid.trim().toUpperCase(),
        alias: formData.alias.trim(),
        tipo_tarjeta: formData.tipo_tarjeta,
        saldo_inicial: formData.saldo_inicial ? parseFloat(formData.saldo_inicial) : 0,
      };

      const response = await apiService.addCardToUser(user.id, cardData);

      if (response.success) {
        await refreshUserCards();
        Alert.alert(
          'Tarjeta Registrada',
          `La tarjeta ${cardData.uid} ha sido registrada exitosamente`,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert('Error', response.error || 'No se pudo registrar la tarjeta');
      }
    } catch (error) {
      console.error('Error registering card:', error);
      Alert.alert('Error', 'No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const getCardTypeData = (tipo) => {
    return cardTypes.find(ct => ct.id === tipo) || cardTypes[0];
  };

  const selectCardType = (tipo) => {
    handleInputChange('tipo_tarjeta', tipo);
  };

  const formatUID = (uid) => {
    // Formatear UID en grupos de 2 caracteres separados por espacios
    return uid.toUpperCase().replace(/(.{2})/g, '$1 ').trim();
  };

  return (
    <View style={styles.container}>
      {/* Header mejorado */}
      <Surface style={styles.header} elevation={0}>
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-left"
            iconColor={colors.textInverse}
            size={24}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
          <View style={styles.headerTextContainer}>
            <Text variant="headlineSmall" style={styles.headerTitle}>
              Nueva Tarjeta
            </Text>
          </View>
        </View>
      </Surface>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Información del Usuario */}
        {user && (
          <Surface style={styles.userInfoCard} elevation={2}>
            <View style={styles.userInfoHeader}>
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>
                  {user.nombre?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
              <View style={styles.userDetails}>
                <Text variant="titleMedium" style={styles.userName}>
                  {user.nombre || 'Usuario'}
                </Text>
                <View style={styles.userTypeContainer}>
                  <Chip 
                    mode="outlined" 
                    style={[
                      styles.userTypeChip,
                      { borderColor: getCardTypeData(user.tipo_tarjeta || 'adulto').color }
                    ]}
                    textStyle={[
                      styles.userTypeText,
                      { color: getCardTypeData(user.tipo_tarjeta || 'adulto').color }
                    ]}
                  >
                    {getCardTypeData(user.tipo_tarjeta || 'adulto').icon} {getCardTypeData(user.tipo_tarjeta || 'adulto').label}
                  </Chip>
                </View>
              </View>
            </View>
          </Surface>
        )}

        {/* Formulario de UID */}
        <Surface style={styles.section} elevation={1}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Identificación de Tarjeta
            </Text>
            <Text variant="bodySmall" style={styles.sectionSubtitle}>
              Ingresa el UID único de tu tarjeta NFC
            </Text>
          </View>
          
          <View style={styles.inputContainer}>
            <TextInput
              label="UID de la Tarjeta"
              value={formData.uid}
              onChangeText={(value) => handleInputChange('uid', value)}
              onFocus={() => setFocusedField('uid')}
              onBlur={() => setFocusedField(null)}
              mode="outlined"
              placeholder="Ej: A1B2C3D4"
              autoCapitalize="characters"
              style={[
                styles.input,
                focusedField === 'uid' && styles.inputFocused
              ]}
              maxLength={50}
              left={<TextInput.Icon icon="card-account-details" />}
              theme={{
                colors: {
                  primary: colors.primary,
                  onSurfaceVariant: colors.textSecondary,
                }
              }}
            />
            
            {formData.uid && (
              <View style={styles.uidPreview}>
                <Text variant="bodySmall" style={styles.uidPreviewLabel}>
                  Vista previa:
                </Text>
                <Text variant="titleMedium" style={styles.uidPreviewText}>
                  {formatUID(formData.uid)}
                </Text>
              </View>
            )}
            
            {formData.uid && formData.uid.length < 4 && (
              <View style={styles.warningContainer}>
                <Text style={styles.warningText}>
                  ⚠️ El UID debe tener al menos 4 caracteres
                </Text>
              </View>
            )}
          </View>
        </Surface>

        {/* Alias opcional */}
        <Surface style={styles.section} elevation={1}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Personalización
            </Text>
            <Text variant="bodySmall" style={styles.sectionSubtitle}>
              Dale un nombre personalizado a tu tarjeta
            </Text>
          </View>
          
          <TextInput
            label="Alias (Opcional)"
            value={formData.alias}
            onChangeText={(value) => handleInputChange('alias', value)}
            onFocus={() => setFocusedField('alias')}
            onBlur={() => setFocusedField(null)}
            mode="outlined"
            placeholder="Ej: Mi Tarjeta Principal"
            style={[
              styles.input,
              focusedField === 'alias' && styles.inputFocused
            ]}
            maxLength={50}
            left={<TextInput.Icon icon="tag" />}
            theme={{
              colors: {
                primary: colors.primary,
                onSurfaceVariant: colors.textSecondary,
              }
            }}
          />
        </Surface>

        {/* Tipo de Tarjeta */}
        <Surface style={styles.section} elevation={1}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Tipo de Tarjeta
            </Text>
            <Text variant="bodySmall" style={styles.sectionSubtitle}>
              Selecciona el tipo que corresponde a tu perfil
            </Text>
          </View>
          
          <View style={styles.cardTypesGrid}>
            {cardTypes.map((cardType) => (
              <Pressable
                key={cardType.id}
                onPress={() => selectCardType(cardType.id)}
                style={[
                  styles.cardTypeOption,
                  formData.tipo_tarjeta === cardType.id && styles.cardTypeOptionSelected
                ]}
              >
                <View style={[
                  styles.cardTypeIconContainer,
                  { backgroundColor: cardType.color + '20' }
                ]}>
                  <Text style={styles.cardTypeIcon}>{cardType.icon}</Text>
                </View>
                
                <View style={styles.cardTypeInfo}>
                  <Text variant="titleSmall" style={[
                    styles.cardTypeTitle,
                    formData.tipo_tarjeta === cardType.id && { color: cardType.color }
                  ]}>
                    {cardType.label}
                  </Text>
                  <Text variant="bodySmall" style={styles.cardTypeDescription}>
                    {cardType.description}
                  </Text>
                </View>
                
                {formData.tipo_tarjeta === cardType.id && (
                  <View style={[styles.selectedIndicator, { backgroundColor: cardType.color }]}>
                    <Text style={styles.selectedIcon}>✓</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </Surface>

        {/* Saldo Inicial */}
        <Surface style={styles.section} elevation={1}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Saldo Inicial
            </Text>
            <Text variant="bodySmall" style={styles.sectionSubtitle}>
              Monto inicial para cargar en la tarjeta (opcional)
            </Text>
          </View>
          
          <TextInput
            label="Saldo Inicial"
            value={formData.saldo_inicial}
            onChangeText={(value) => handleInputChange('saldo_inicial', value)}
            onFocus={() => setFocusedField('saldo_inicial')}
            onBlur={() => setFocusedField(null)}
            mode="outlined"
            placeholder="0.00"
            keyboardType="numeric"
            style={[
              styles.input,
              focusedField === 'saldo_inicial' && styles.inputFocused
            ]}
            left={<TextInput.Icon icon="currency-usd" />}
            right={<TextInput.Affix text="Bs" />}
            theme={{
              colors: {
                primary: colors.primary,
                onSurfaceVariant: colors.textSecondary,
              }
            }}
          />
        </Surface>

        {/* Resumen */}
        {formData.uid && (
          <Surface style={styles.summaryCard} elevation={3}>
            <View style={styles.summaryHeader}>
              <Text variant="titleMedium" style={styles.summaryTitle}>
                Resumen de Registro
              </Text>
            </View>
            
            <View style={styles.summaryContent}>
              <View style={styles.summaryRow}>
                <Text variant="bodyMedium" style={styles.summaryLabel}>UID</Text>
                <Text variant="titleMedium" style={styles.summaryValue}>
                  {formatUID(formData.uid)}
                </Text>
              </View>
              
              {formData.alias && (
                <View style={styles.summaryRow}>
                  <Text variant="bodyMedium" style={styles.summaryLabel}>Alias</Text>
                  <Text variant="bodyMedium" style={styles.summaryValueSecondary}>
                    {formData.alias}
                  </Text>
                </View>
              )}
              
              <View style={styles.summaryRow}>
                <Text variant="bodyMedium" style={styles.summaryLabel}>Tipo</Text>
                <View style={styles.summaryTypeContainer}>
                  <Text style={styles.summaryTypeIcon}>
                    {getCardTypeData(formData.tipo_tarjeta).icon}
                  </Text>
                  <Text variant="bodyMedium" style={[
                    styles.summaryValueSecondary,
                    { color: getCardTypeData(formData.tipo_tarjeta).color }
                  ]}>
                    {getCardTypeData(formData.tipo_tarjeta).label}
                  </Text>
                </View>
              </View>
              
              <Divider style={styles.summaryDivider} />
              
              <View style={styles.summaryRow}>
                <Text variant="titleMedium" style={styles.summaryTotalLabel}>Saldo inicial</Text>
                <Text variant="titleLarge" style={styles.summaryTotal}>
                  {formData.saldo_inicial ? `${parseFloat(formData.saldo_inicial).toFixed(2)} Bs` : '0.00 Bs'}
                </Text>
              </View>
            </View>
          </Surface>
        )}

        {/* Botones de Acción */}
        <View style={styles.buttonContainer}>
          <Animated.View style={{ transform: [{ scale: scaleAnimation }] }}>
            <Button
              mode="contained"
              onPress={handleRegisterCard}
              loading={loading}
              disabled={loading || !formData.uid.trim() || formData.uid.length < 4}
              style={[
                styles.registerButton,
                (loading || !formData.uid.trim() || formData.uid.length < 4) && styles.buttonDisabled
              ]}
              contentStyle={styles.buttonContent}
              labelStyle={styles.registerButtonLabel}
              testID="register-btn"
            >
              {loading ? 'Registrando Tarjeta...' : 'Registrar Tarjeta'}
            </Button>
          </Animated.View>
          
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            disabled={loading}
            style={styles.cancelButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.cancelButtonLabel}
          >
            Cancelar
          </Button>
          
          <Text style={styles.footerText}>
            La tarjeta será registrada en tu cuenta y podrás gestionarla desde "Mis Tarjetas"
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Header
  header: {
    backgroundColor: colors.primary,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    paddingTop: spacing.xl + 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  backButton: {
    margin: 0,
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  headerTitle: {
    ...chicaloStyles.subtitle,
    color: colors.textInverse,
    fontSize: 24,
    fontWeight: '600',
  },
  headerSubtitle: {
    ...chicaloStyles.subtitle,
    marginTop: spacing.xs,
  },

  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },

  // Card de información del usuario
  userInfoCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  userInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  userAvatarText: {
    color: colors.textInverse,
    fontSize: 24,
    fontWeight: '600',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    ...chicaloStyles.subtitle,
    color: colors.primary,
  },
  userTypeContainer: {
    flexDirection: 'row',
  },
  userTypeChip: {
    borderRadius: borderRadius.sm,
    borderWidth: 1.5,
  },
  userTypeText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Secciones
  section: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...chicaloStyles.subtitle,
    color: colors.primary,
  },
  sectionSubtitle: {
    ...chicaloStyles.info,
    color: colors.textSecondary,
  },

  // Inputs
  inputContainer: {
    gap: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  inputFocused: {
    transform: [{ scale: 1.01 }],
  },
  
  // Vista previa UID
  uidPreview: {
    backgroundColor: colors.surfaceVariant,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  uidPreviewLabel: {
    ...chicaloStyles.description,
    color: colors.textSecondary,
  },
  uidPreviewText: {
    ...chicaloStyles.info,
    color: colors.primary,
  },
  
  // Advertencia
  warningContainer: {
    backgroundColor: colors.warningLight,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  warningText: {
    color: colors.warningDark,
    fontSize: 12,
    fontWeight: '500',
  },

  // Grid de tipos de tarjeta
  cardTypesGrid: {
    gap: spacing.md,
  },
  cardTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    position: 'relative',
  },
  cardTypeOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08',
  },
  cardTypeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  cardTypeIcon: {
    fontSize: 24,
  },
  cardTypeInfo: {
    flex: 1,
  },
  cardTypeTitle: {
    color: colors.text,
    fontFamily: typography.titleSmall.fontFamily,
    marginBottom: spacing.xs,
  },
  cardTypeDescription: {
    ...chicaloStyles.description,
    color: colors.textSecondary,
  },
  selectedIndicator: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIcon: {
    color: colors.textInverse,
    fontSize: 12,
    fontWeight: '600',
  },

  // Resumen
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  summaryHeader: {
    backgroundColor: colors.primary + '10',
    padding: spacing.lg,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
  },
  summaryTitle: {
    ...chicaloStyles.subtitle,
    color: colors.primary,
  },
  summaryContent: {
    padding: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  summaryLabel: {
    ...chicaloStyles.description,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...chicaloStyles.info,
    color: colors.primary,
  },
  summaryValueSecondary: {
    ...chicaloStyles.info,
    color: colors.textSecondary,
  },
  summaryTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  summaryTypeIcon: {
    fontSize: 16,
  },
  summaryDivider: {
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  summaryTotalLabel: {
    ...chicaloStyles.info,
    color: colors.primary,
  },
  summaryTotal: {
    ...chicaloStyles.subtitle,
    color: colors.primary,
    fontWeight: '700',
  },

  // Botones
  buttonContainer: {
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  registerButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    ...shadows.medium,
  },
  cancelButton: {
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    borderWidth: 2,
  },
  buttonDisabled: {
    backgroundColor: colors.disabled,
  },
  buttonContent: {
    paddingVertical: spacing.md,
  },
  registerButtonLabel: {
    color: colors.textInverse,
    fontFamily: typography.labelLarge.fontFamily,
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonLabel: {
    color: colors.primary,
    fontFamily: typography.labelLarge.fontFamily,
    fontSize: 16,
    fontWeight: '500',
  },
  footerText: {
    ...chicaloStyles.description,
    color: colors.textInverse,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});

export default RegisterCardScreen;
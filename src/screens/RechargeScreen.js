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
import { TextInput, Button, Card, Divider, RadioButton, Surface, IconButton } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import CenteredLoader from '../components/CenteredLoader';
import { colors, typography, spacing, borderRadius, shadows, appTheme, chicaloStyles } from '../theme';

const RechargeScreen = ({ navigation, route }) => {
  const { user, refreshUserCards, loading } = useAuth();
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [selectedAmountAnimation] = useState(new Animated.Value(1));

  // Obtener tarjeta seleccionada del contexto o de los parámetros de navegación
  const selectedCard = route.params?.selectedCard || 
    (user?.cards && user.selectedCard ? 
      user.cards.find(card => card.uid === user.selectedCard) : null);

  const predefinedAmounts = [
    { value: 10, label: '10 Bs', popular: false },
    { value: 20, label: '20 Bs', popular: true },
    { value: 50, label: '50 Bs', popular: false },
    { value: 100, label: '100 Bs', popular: false },
  ];

  const paymentMethods = [
    {
      id: 'efectivo',
      title: 'Efectivo',
      description: 'Recarga en puntos físicos autorizados',
      icon: '💵',
    },
    {
      id: 'qr',
      title: 'QR Bancario',
      description: 'Pago mediante código QR de tu banco',
      icon: '📱',
    },
    {
      id: 'tigo_money',
      title: 'Tigo Money',
      description: 'Pago con billetera móvil Tigo Money',
      icon: '💳',
    },
  ];

  const handleRecharge = async () => {
    if (!selectedCard) {
      Alert.alert('Error', 'No hay tarjeta seleccionada');
      return;
    }

    const rechargeAmount = parseFloat(amount);
    
    if (!rechargeAmount || rechargeAmount <= 0) {
      Alert.alert('Error', 'Por favor ingresa un monto válido');
      return;
    }

    if (rechargeAmount < 5) {
      Alert.alert('Error', 'El monto mínimo de recarga es 5 Bs');
      return;
    }

    Alert.alert(
      'Confirmar Recarga',
      `¿Estás seguro de recargar ${rechargeAmount.toFixed(2)} Bs en la tarjeta ${selectedCard.uid} con ${getPaymentMethodLabel(paymentMethod)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: processRecharge }
      ]
    );
  };

  const processRecharge = async () => {
    setLoadingLocal(true);
    try {
      const response = await apiService.rechargeCard(
        selectedCard.uid,
        parseFloat(amount),
        paymentMethod
      );

      if (response.success) {
        await refreshUserCards();
        Alert.alert(
          'Recarga Exitosa',
          `Se han agregado ${amount} Bs a la tarjeta ${selectedCard.uid}`,
          [{ text: 'OK', onPress: () => {
            setAmount('');
            navigation.goBack();
          }}]
        );
      } else {
        Alert.alert('Error', response.message || 'No se pudo procesar la recarga');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar con el servidor');
    } finally {
      setLoadingLocal(false);
    }
  };

  const getPaymentMethodLabel = (method) => {
    const paymentMethod = paymentMethods.find(pm => pm.id === method);
    return paymentMethod ? paymentMethod.title : 'Desconocido';
  };

  const selectPredefinedAmount = (value) => {
    setAmount(value.toString());
    
    // Animación de selección
    Animated.sequence([
      Animated.timing(selectedAmountAnimation, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(selectedAmountAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Retorno temprano DESPUÉS de todos los hooks
  if (loading || !user) {
    return <CenteredLoader />;
  }

  if (!selectedCard) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          No hay tarjeta seleccionada para recargar
        </Text>
        <Button
          mode="contained"
          onPress={() => navigation.goBack()}
          style={styles.errorButton}
        >
          Volver
        </Button>
      </View>
    );
  }

  const currentAmount = parseFloat(amount) || 0;
  const newBalance = selectedCard.saldo_actual + currentAmount;

  return (
    <View style={styles.container}>
      {/* Header mejorado con gradiente visual */}
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
              Recargar Tarjeta
            </Text>
          </View>
        </View>
      </Surface>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Información de la Tarjeta con diseño de card mejorado */}
        <Surface style={styles.cardInfo} elevation={2}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconContainer}>
              <Text style={styles.cardIcon}>💳</Text>
            </View>
            <View style={styles.cardDetails}>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Tarjeta Actual
              </Text>
              <Text variant="bodySmall" style={styles.cardSubtitle}>
                UID: {selectedCard.uid}
              </Text>
            </View>
          </View>
          
          <View style={styles.balanceContainer}>
            <Text variant="bodyMedium" style={styles.balanceLabel}>
              Saldo Actual
            </Text>
            <Text variant="displaySmall" style={styles.currentBalance}>
              {selectedCard.saldo_actual.toFixed(2)} Bs
            </Text>
          </View>
        </Surface>

        {/* Montos Predefinidos con diseño mejorado */}
        <Surface style={styles.section} elevation={1}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Montos Rápidos
            </Text>
            <Text variant="bodySmall" style={styles.sectionSubtitle}>
              Selecciona un monto común
            </Text>
          </View>
          
          <View style={styles.amountGrid}>
            {predefinedAmounts.map((item) => (
              <Pressable
                key={item.value}
                onPress={() => selectPredefinedAmount(item.value)}
                style={[
                  styles.amountButton,
                  amount === item.value.toString() && styles.amountButtonSelected
                ]}
              >
                <Animated.View
                  style={[
                    styles.amountButtonContent,
                    { transform: [{ scale: selectedAmountAnimation }] }
                  ]}
                >
                  {item.popular && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularText}>Popular</Text>
                    </View>
                  )}
                  <Text 
                    variant="titleMedium" 
                    style={[
                      styles.amountButtonText,
                      amount === item.value.toString() && styles.amountButtonTextSelected
                    ]}
                  >
                    {item.label}
                  </Text>
                </Animated.View>
              </Pressable>
            ))}
          </View>
        </Surface>

        {/* Monto Personalizado mejorado */}
        <Surface style={styles.section} elevation={1}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Monto Personalizado
            </Text>
            <Text variant="bodySmall" style={styles.sectionSubtitle}>
              Ingresa cualquier monto desde 5 Bs
            </Text>
          </View>
          
          <View style={styles.inputContainer}>
            <TextInput
              label="Monto a recargar"
              value={amount}
              onChangeText={setAmount}
              mode="outlined"
              keyboardType="numeric"
              placeholder="0.00"
              style={styles.input}
              contentStyle={styles.inputContent}
              right={<TextInput.Affix text="Bs" />}
              theme={{
                colors: {
                  primary: colors.primary,
                  onSurfaceVariant: colors.textSecondary,
                }
              }}
            />
            
            {currentAmount > 0 && currentAmount < 5 && (
              <View style={styles.warningContainer}>
                <Text style={styles.warningText}>
                  ⚠️ El monto mínimo es 5 Bs
                </Text>
              </View>
            )}
          </View>
        </Surface>

        {/* Método de Pago rediseñado */}
        <Surface style={styles.section} elevation={1}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Método de Pago
            </Text>
            <Text variant="bodySmall" style={styles.sectionSubtitle}>
              Elige cómo quieres pagar
            </Text>
          </View>
          
          <View style={styles.paymentMethods}>
            {paymentMethods.map((method, index) => (
              <Pressable
                key={method.id}
                onPress={() => setPaymentMethod(method.id)}
                style={[
                  styles.paymentMethod,
                  paymentMethod === method.id && styles.paymentMethodSelected,
                  index < paymentMethods.length - 1 && styles.paymentMethodBorder
                ]}
              >
                <View style={styles.paymentMethodContent}>
                  <View style={styles.paymentMethodLeft}>
                    <View style={styles.paymentMethodIcon}>
                      <Text style={styles.paymentMethodEmoji}>{method.icon}</Text>
                    </View>
                    <View style={styles.paymentMethodInfo}>
                      <Text variant="titleSmall" style={styles.paymentMethodTitle}>
                        {method.title}
                      </Text>
                      <Text variant="bodySmall" style={styles.paymentMethodDescription}>
                        {method.description}
                      </Text>
                    </View>
                  </View>
                  <RadioButton
                    value={method.id}
                    status={paymentMethod === method.id ? 'checked' : 'unchecked'}
                    onPress={() => setPaymentMethod(method.id)}
                    color={colors.primary}
                  />
                </View>
              </Pressable>
            ))}
          </View>
        </Surface>

        {/* Resumen mejorado */}
        {currentAmount > 0 && (
          <Surface style={styles.summaryCard} elevation={3}>
            <View style={styles.summaryHeader}>
              <Text variant="titleMedium" style={styles.summaryTitle}>
                Resumen de Recarga
              </Text>
            </View>
            
            <View style={styles.summaryContent}>
              <View style={styles.summaryRow}>
                <Text variant="bodyMedium" style={styles.summaryLabel}>Monto a recargar</Text>
                <Text variant="titleMedium" style={styles.summaryValue}>
                  {currentAmount.toFixed(2)} Bs
                </Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text variant="bodyMedium" style={styles.summaryLabel}>Saldo actual</Text>
                <Text variant="bodyMedium" style={styles.summaryCurrentBalance}>
                  {selectedCard.saldo_actual.toFixed(2)} Bs
                </Text>
              </View>
              
              <Divider style={styles.summaryDivider} />
              
              <View style={styles.summaryRow}>
                <Text variant="titleMedium" style={styles.summaryTotalLabel}>Nuevo saldo</Text>
                <Text variant="titleLarge" style={styles.summaryTotal}>
                  {newBalance.toFixed(2)} Bs
                </Text>
              </View>
            </View>
          </Surface>
        )}

        {/* Botón de Recarga mejorado */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleRecharge}
            loading={loadingLocal}
            disabled={loadingLocal || !amount || currentAmount < 5}
            style={[
              styles.rechargeButton,
              (loadingLocal || !amount || currentAmount < 5) && styles.rechargeButtonDisabled
            ]}
            contentStyle={styles.rechargeButtonContent}
            labelStyle={styles.rechargeButtonLabel}
            testID="recharge-btn"
          >
            {loadingLocal ? 'Procesando Recarga...' : 'Confirmar Recarga'}
          </Button>
          
          <Text style={styles.footerText}>
            Las recargas pueden tardar hasta 5 minutos en reflejarse
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
  
  // Header mejorado
  header: {
    backgroundColor: colors.primary,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    paddingTop: spacing.xl + 20, // Status bar space
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

  // Scroll view
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },

  // Card de información
  cardInfo: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  cardIcon: {
    fontSize: 24,
  },
  cardDetails: {
    flex: 1,
  },
  cardTitle: {
    ...chicaloStyles.subtitle,
    color: colors.primary,
  },
  cardSubtitle: {
    ...chicaloStyles.info,
    marginTop: spacing.xs,
  },
  balanceContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.md,
  },
  balanceLabel: {
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  currentBalance: {
    color: colors.primary,
    fontWeight: '600',
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
    ...chicaloStyles.description,
    marginTop: spacing.xs,
  },

  // Grid de montos
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginHorizontal: -spacing.xs, // Compensar el gap
  },
  amountButton: {
    width: '48%',
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  amountButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  amountButtonContent: {
    padding: spacing.lg,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
  popularBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.xs,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textOnAccent,
  },
  amountButtonText: {
    color: colors.text,
    fontWeight: '500',
  },
  amountButtonTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },

  // Input personalizado
  inputContainer: {
    gap: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
  },
  inputContent: {
    fontSize: 18,
    fontWeight: '500',
  },
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

  // Métodos de pago
  paymentMethods: {
    gap: 0,
  },
  paymentMethod: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  paymentMethodSelected: {
    backgroundColor: colors.primary + '08',
  },
  paymentMethodBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  paymentMethodEmoji: {
    fontSize: 20,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodTitle: {
    ...chicaloStyles.info,
    color: colors.primary,
  },
  paymentMethodDescription: {
    ...chicaloStyles.info,
    marginTop: spacing.xs,
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
    color: colors.success,
    fontWeight: '600',
  },
  summaryCurrentBalance: {
    color: colors.text,
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

  // Botón de recarga
  buttonContainer: {
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  rechargeButton: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.md,
    ...shadows.medium,
  },
  rechargeButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  rechargeButtonContent: {
    paddingVertical: spacing.md,
  },
  rechargeButtonLabel: {
    color: colors.textInverse,
    fontFamily: typography.labelLarge.fontFamily,
    fontSize: 16,
    fontWeight: '600',
  },
  footerText: {
    ...chicaloStyles.description,
    color: colors.textInverse,
    textAlign: 'center',
    marginTop: spacing.xl,
  },

  // Error states
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surface,
  },
  errorText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    fontSize: 16,
  },
  errorButton: {
    backgroundColor: colors.primary,
  },
});

export default RechargeScreen;
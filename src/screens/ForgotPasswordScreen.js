import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  ScrollView,
  Dimensions,
  Text,
} from 'react-native';
import {
  Button,
  Card,
  TextInput,
  IconButton,
} from 'react-native-paper';
import { colors, spacing, shadows, borderRadius, chicaloStyles } from '../theme';

const { width, height } = Dimensions.get('window');

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    setLoading(true);
    try {
      // Aquí se implementaría la lógica de recuperación
      console.log('Enviando email de recuperación a:', email);
      
      // Simular envío exitoso
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setEmailSent(true);
      Alert.alert(
        'Email Enviado', 
        'Se ha enviado un enlace de recuperación a tu correo electrónico',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar el email de recuperación');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  const handleResendEmail = () => {
    setEmailSent(false);
    setEmail('');
  };

  return (
    <View style={styles.container}>
      {/* Header optimizado - consistente con LoginScreen */}
      <View style={styles.header}>
        <View style={styles.brandSection}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.brandTitle}>
            Recuperar Contraseña
          </Text>
          <Text style={styles.brandSubtitle}>
            Te ayudamos a recuperar tu acceso
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Card Principal */}
          <Card style={styles.mainCard}>
            <Card.Content style={styles.cardContent}>
              {!emailSent ? (
                <View style={styles.formContainer}>
                  {/* Icono de ayuda */}
                  <View style={styles.helpIconContainer}>
                    <IconButton
                      icon="help-circle"
                      size={60}
                      iconColor={colors.primary}
                      style={styles.helpIcon}
                    />
                  </View>

                  {/* Título y descripción */}
                  <View style={styles.textSection}>
                    <Text style={styles.mainTitle}>
                      ¿Olvidaste tu contraseña?
                    </Text>
                    <Text style={styles.mainDescription}>
                      No te preocupes, ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
                    </Text>
                  </View>

                  {/* Campo de email */}
                  <View style={styles.inputGroup}>
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      mode="outlined"
                      placeholder="Email"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      left={<TextInput.Icon icon="email" color={colors.primary} />}
                      style={styles.input}
                      outlineStyle={styles.inputOutline}
                    />
                  </View>

                  {/* Información adicional */}
                  <View style={styles.infoBox}>
                    <IconButton
                      icon="information"
                      size={16}
                      iconColor={colors.primary}
                    />
                    <Text style={styles.infoText}>
                      El enlace de recuperación expirará en 1 hora por seguridad
                    </Text>
                  </View>

                  {/* Botón de envío */}
                  <Button
                    mode="contained"
                    onPress={handleResetPassword}
                    loading={loading}
                    disabled={loading}
                    style={styles.resetButton}
                    labelStyle={styles.resetButtonLabel}
                    contentStyle={styles.resetButtonContent}
                    icon="email-send"
                  >
                    {loading ? 'Enviando...' : 'Enviar Email de Recuperación'}
                  </Button>
                </View>
              ) : (
                <View style={styles.successContainer}>
                  {/* Icono de éxito */}
                  <View style={styles.successIconContainer}>
                    <IconButton
                      icon="check-circle"
                      size={80}
                      iconColor={colors.successScale[500]}
                      style={styles.successIcon}
                    />
                  </View>

                  {/* Mensaje de éxito */}
                  <View style={styles.textSection}>
                    <Text style={styles.successTitle}>
                      ¡Email Enviado!
                    </Text>
                    <Text style={styles.successDescription}>
                      Hemos enviado un enlace de recuperación a{' '}
                      <Text style={styles.emailHighlight}>{email}</Text>
                    </Text>
                  </View>

                  {/* Instrucciones */}
                  <View style={styles.instructionsBox}>
                    <Text style={styles.instructionsTitle}>
                      Próximos pasos:
                    </Text>
                    <View style={styles.instructionsList}>
                      <View style={styles.instructionItem}>
                        <IconButton
                          icon="email-check"
                          size={20}
                          iconColor={colors.primary}
                        />
                        <Text style={styles.instructionText}>
                          Revisa tu bandeja de entrada
                        </Text>
                      </View>
                      <View style={styles.instructionItem}>
                        <IconButton
                          icon="link"
                          size={20}
                          iconColor={colors.primary}
                        />
                        <Text style={styles.instructionText}>
                          Haz clic en el enlace de recuperación
                        </Text>
                      </View>
                      <View style={styles.instructionItem}>
                        <IconButton
                          icon="lock-reset"
                          size={20}
                          iconColor={colors.primary}
                        />
                        <Text style={styles.instructionText}>
                          Crea una nueva contraseña
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Botones de acción */}
                  <View style={styles.actionButtons}>
                    <Button
                      mode="outlined"
                      onPress={handleResendEmail}
                      style={styles.resendButton}
                      labelStyle={styles.resendButtonLabel}
                      icon="email-resend"
                    >
                      Reenviar Email
                    </Button>
                    
                    <Button
                      mode="contained"
                      onPress={handleBackToLogin}
                      style={styles.backButton}
                      labelStyle={styles.backButtonLabel}
                      icon="arrow-left"
                    >
                      Volver al Login
                    </Button>
                  </View>
                </View>
              )}
            </Card.Content>
          </Card>

          {/* Enlaces de ayuda */}
          <View style={styles.helpSection}>
            <Button
              mode="text"
              onPress={handleBackToLogin}
              style={styles.helpButton}
              labelStyle={styles.helpButtonLabel}
              icon="arrow-left"
            >
              ¿Recordaste tu contraseña? Inicia sesión
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 24,
    backgroundColor: colors.background,
  },
  brandSection: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.backgroundAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...shadows.medium,
  },
  logo: {
    width: 40,
    height: 40,
  },
  brandTitle: {
    ...chicaloStyles.title,
    color: colors.backgroundAlt,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  brandSubtitle: {
    ...chicaloStyles.subtitle,
    color: colors.backgroundAlt,
    opacity: 0.8,
    fontSize: 14,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  mainCard: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: borderRadius.xl,
    ...shadows.large,
    marginBottom: 24,
  },
  cardContent: {
    padding: 24,
  },
  formContainer: {
    alignItems: 'center',
    gap: 24,
  },
  helpIconContainer: {
    marginBottom: 8,
  },
  helpIcon: {
    backgroundColor: colors.primary + '15',
  },
  textSection: {
    alignItems: 'center',
    gap: 12,
  },
  mainTitle: {
    ...chicaloStyles.title,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
  mainDescription: {
    ...chicaloStyles.description,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 16,
  },
  input: {
    backgroundColor: colors.backgroundAlt,
    fontSize: 16,
  },
  inputOutline: {
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.md,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    width: '100%',
  },
  infoText: {
    ...chicaloStyles.info,
    flex: 1,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  resetButton: {
    borderRadius: borderRadius.md,
    width: '100%',
    ...shadows.medium,
  },
  resetButtonContent: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: borderRadius.md,
  },
  resetButtonLabel: {
    color: colors.backgroundAlt,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  successContainer: {
    alignItems: 'center',
    gap: 24,
  },
  successIconContainer: {
    marginBottom: 8,
  },
  successIcon: {
    backgroundColor: colors.successScale[50],
  },
  successTitle: {
    ...chicaloStyles.title,
    color: colors.successScale[600],
    textAlign: 'center',
    fontWeight: '600',
  },
  successDescription: {
    ...chicaloStyles.description,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  emailHighlight: {
    color: colors.primary,
    fontWeight: '600',
  },
  instructionsBox: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.md,
    padding: 20,
    width: '100%',
  },
  instructionsTitle: {
    ...chicaloStyles.subtitle,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  instructionsList: {
    gap: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  instructionText: {
    ...chicaloStyles.info,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  actionButtons: {
    width: '100%',
    gap: 16,
  },
  resendButton: {
    borderRadius: borderRadius.md,
    borderColor: colors.border,
    borderWidth: 1.5,
  },
  resendButtonLabel: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
  },
  backButtonLabel: {
    color: colors.backgroundAlt,
    fontSize: 16,
    fontWeight: '600',
  },
  helpSection: {
    alignItems: 'center',
  },
  helpButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
  },
  helpButtonLabel: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ForgotPasswordScreen;

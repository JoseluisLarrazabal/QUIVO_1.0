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
  SegmentedButtons,
  IconButton,
  Surface,
  Chip,
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, shadows, borderRadius, chicaloStyles } from '../theme';

const { width, height } = Dimensions.get('window');

const RegisterScreen = ({ navigation }) => {
  const [registerMode, setRegisterMode] = useState('email');
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefono: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { register } = useAuth();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.nombre.trim() || !formData.apellido.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu nombre y apellido');
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return false;
    }
    if (formData.password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return false;
    }
    if (!formData.telefono.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu número de teléfono');
      return false;
    }
    if (!acceptedTerms) {
      Alert.alert('Error', 'Debes aceptar los términos y condiciones');
      return false;
    }
    return true;
  };

  const handleEmailRegister = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const result = await register(formData);
      if (result.success) {
        Alert.alert('Éxito', 'Cuenta creada exitosamente', [
          { text: 'OK', onPress: () => navigation.navigate('Login') }
        ]);
      } else {
        Alert.alert('Error', result.error || 'No se pudo crear la cuenta');
      }
    } catch (error) {
      Alert.alert('Error', 'Error inesperado al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthRegister = async (provider) => {
    setLoading(true);
    try {
      // Aquí se implementaría la lógica de OAuth
      console.log(`Registrando con ${provider}...`);
      Alert.alert('Info', `Registro con ${provider} en desarrollo`);
    } catch (error) {
      Alert.alert('Error', `Error al registrar con ${provider}`);
    } finally {
      setLoading(false);
    }
  };

  const openTerms = () => {
    Alert.alert('Términos y Condiciones', 'Enlace a términos en desarrollo');
  };

  const openPrivacy = () => {
    Alert.alert('Política de Privacidad', 'Enlace a política en desarrollo');
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
            Crear Cuenta
          </Text>
          <Text style={styles.brandSubtitle}>
            Únete a QUIVO
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
          {/* Selector de Modo de Registro */}
          <View style={styles.modeSection}>
            <Surface style={styles.modeSurface} elevation={1}>
              <SegmentedButtons
                value={registerMode}
                onValueChange={setRegisterMode}
                buttons={[
                  {
                    value: 'email',
                    label: 'Email',
                    icon: 'email',
                    style: registerMode === 'email' ? styles.activeSegment : styles.inactiveSegment,
                  },
                  {
                    value: 'oauth',
                    label: 'Redes Sociales',
                    icon: 'account-multiple',
                    style: registerMode === 'oauth' ? styles.activeSegment : styles.inactiveSegment,
                  },
                ]}
                style={styles.segmentedButtons}
              />
            </Surface>
          </View>

          {/* Formulario de Registro por Email */}
          {registerMode === 'email' && (
            <Card style={styles.mainCard}>
              <Card.Content style={styles.cardContent}>
                <View style={styles.formContainer}>
                  {/* Nombre y Apellido */}
                  <View style={styles.rowInputs}>
                    <View style={styles.halfInput}>
                      <TextInput
                        value={formData.nombre}
                        onChangeText={(value) => handleInputChange('nombre', value)}
                        mode="outlined"
                        placeholder="Nombre"
                        left={<TextInput.Icon icon="account" color={colors.primary} />}
                        style={styles.input}
                        outlineStyle={styles.inputOutline}
                      />
                    </View>
                    <View style={styles.halfInput}>
                      <TextInput
                        value={formData.apellido}
                        onChangeText={(value) => handleInputChange('apellido', value)}
                        mode="outlined"
                        placeholder="Apellido"
                        left={<TextInput.Icon icon="account" color={colors.primary} />}
                        style={styles.input}
                        outlineStyle={styles.inputOutline}
                      />
                    </View>
                  </View>

                  {/* Email */}
                  <View style={styles.inputGroup}>
                    <TextInput
                      value={formData.email}
                      onChangeText={(value) => handleInputChange('email', value)}
                      mode="outlined"
                      placeholder="Email"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      left={<TextInput.Icon icon="email" color={colors.primary} />}
                      style={styles.input}
                      outlineStyle={styles.inputOutline}
                    />
                  </View>

                  {/* Teléfono */}
                  <View style={styles.inputGroup}>
                    <TextInput
                      value={formData.telefono}
                      onChangeText={(value) => handleInputChange('telefono', value)}
                      mode="outlined"
                      placeholder="Teléfono"
                      keyboardType="phone-pad"
                      left={<TextInput.Icon icon="phone" color={colors.primary} />}
                      style={styles.input}
                      outlineStyle={styles.inputOutline}
                    />
                  </View>

                  {/* Información sobre tarjetas */}
                  <View style={styles.infoBox}>
                    <IconButton
                      icon="information"
                      size={18}
                      iconColor={colors.primary}
                      style={styles.infoIcon}
                    />
                    <Text style={styles.infoText}>
                      Podrás agregar tus tarjetas NFC después de crear tu cuenta
                    </Text>
                  </View>



                  {/* Contraseña */}
                  <View style={styles.inputGroup}>
                    <TextInput
                      value={formData.password}
                      onChangeText={(value) => handleInputChange('password', value)}
                      mode="outlined"
                      placeholder="Contraseña"
                      secureTextEntry={!showPassword}
                      left={<TextInput.Icon icon="lock" color={colors.primary} />}
                      right={
                        <TextInput.Icon
                          icon={showPassword ? "eye-off" : "eye"}
                          color={colors.textSecondary}
                          onPress={() => setShowPassword(!showPassword)}
                        />
                      }
                      style={styles.input}
                      outlineStyle={styles.inputOutline}
                    />
                  </View>

                  {/* Confirmar Contraseña */}
                  <View style={styles.inputGroup}>
                    <TextInput
                      value={formData.confirmPassword}
                      onChangeText={(value) => handleInputChange('confirmPassword', value)}
                      mode="outlined"
                      placeholder="Confirmar Contraseña"
                      secureTextEntry={!showConfirmPassword}
                      left={<TextInput.Icon icon="lock-check" color={colors.primary} />}
                      right={
                        <TextInput.Icon
                          icon={showConfirmPassword ? "eye-off" : "eye"}
                          color={colors.textSecondary}
                          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        />
                      }
                      style={styles.input}
                      outlineStyle={styles.inputOutline}
                    />
                  </View>

                  {/* Términos y Condiciones */}
                  <View style={styles.termsSection}>
                    <View style={styles.termsRow}>
                      <IconButton
                        icon={acceptedTerms ? "checkbox-marked" : "checkbox-blank-outline"}
                        size={24}
                        iconColor={acceptedTerms ? colors.primary : colors.textSecondary}
                        onPress={() => setAcceptedTerms(!acceptedTerms)}
                      />
                      <Text style={styles.termsText}>
                        Acepto los{' '}
                        <Text style={styles.termsLink} onPress={openTerms}>
                          términos y condiciones
                        </Text>
                        {' '}y la{' '}
                        <Text style={styles.termsLink} onPress={openPrivacy}>
                          política de privacidad
                        </Text>
                      </Text>
                    </View>
                  </View>

                  {/* Botón de Registro */}
                  <Button
                    mode="contained"
                    onPress={handleEmailRegister}
                    loading={loading}
                    disabled={loading}
                    style={styles.registerButton}
                    labelStyle={styles.registerButtonLabel}
                    contentStyle={styles.registerButtonContent}
                    icon="account-plus"
                  >
                    {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                  </Button>
                </View>
              </Card.Content>
            </Card>
          )}

          {/* Registro con OAuth */}
          {registerMode === 'oauth' && (
            <Card style={styles.mainCard}>
              <Card.Content style={styles.cardContent}>
                <View style={styles.oauthContainer}>
                  <Text style={styles.oauthTitle}>
                    Registro rápido con redes sociales
                  </Text>
                  <Text style={styles.oauthSubtitle}>
                    Accede a tu cuenta existente o crea una nueva
                  </Text>
                  
                  <View style={styles.oauthButtons}>
                    <Button
                      mode="outlined"
                      onPress={() => handleOAuthRegister('google')}
                      disabled={loading}
                      style={styles.oauthButton}
                      labelStyle={styles.oauthButtonLabel}
                      icon="google"
                    >
                      Continuar con Google
                    </Button>
                    
                    <Button
                      mode="outlined"
                      onPress={() => handleOAuthRegister('facebook')}
                      disabled={loading}
                      style={styles.oauthButton}
                      labelStyle={styles.oauthButtonLabel}
                      icon="facebook"
                    >
                      Continuar con Facebook
                    </Button>
                    
                    <Button
                      mode="outlined"
                      onPress={() => handleOAuthRegister('apple')}
                      disabled={loading}
                      style={styles.oauthButton}
                      labelStyle={styles.oauthButtonLabel}
                      icon="apple"
                    >
                      Continuar con Apple
                    </Button>
                  </View>

                  <View style={styles.oauthInfo}>
                    <IconButton
                      icon="information"
                      size={16}
                      iconColor={colors.primary}
                    />
                    <Text style={styles.oauthInfoText}>
                      Al usar redes sociales, aceptas nuestros términos y política de privacidad
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          )}

          {/* Enlaces de ayuda */}
          <View style={styles.helpSection}>
            <Button
              mode="text"
              onPress={() => navigation.navigate('Login')}
              style={styles.helpButton}
              labelStyle={styles.helpButtonLabel}
              icon="arrow-left"
            >
              ¿Ya tienes cuenta? Inicia sesión
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
  modeSection: {
    marginBottom: 24,
  },
  modeSurface: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: borderRadius.lg,
    padding: 4,
  },
  segmentedButtons: {
    backgroundColor: colors.surfaceVariant,
  },
  activeSegment: {
    backgroundColor: colors.primary,
  },
  inactiveSegment: {
    backgroundColor: 'transparent',
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
    gap: 20,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 16,
  },
  halfInput: {
    flex: 1,
  },
  inputGroup: {
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
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  infoIcon: {
    marginRight: 12,
    marginTop: -2,
  },
  infoText: {
    ...chicaloStyles.info,
    flex: 1,
    lineHeight: 18,
    color: colors.textSecondary,
  },

  termsSection: {
    marginTop: 8,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  termsText: {
    ...chicaloStyles.info,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
    marginTop: 4,
  },
  termsLink: {
    color: colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  registerButton: {
    borderRadius: borderRadius.md,
    marginTop: 8,
    ...shadows.medium,
  },
  registerButtonContent: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: borderRadius.md,
  },
  registerButtonLabel: {
    color: colors.backgroundAlt,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  oauthContainer: {
    alignItems: 'center',
    gap: 24,
  },
  oauthTitle: {
    ...chicaloStyles.subtitle,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
  oauthSubtitle: {
    ...chicaloStyles.description,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  oauthButtons: {
    width: '100%',
    gap: 16,
  },
  oauthButton: {
    borderRadius: borderRadius.md,
    borderColor: colors.border,
    borderWidth: 1.5,
  },
  oauthButtonLabel: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  oauthInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.md,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  oauthInfoText: {
    ...chicaloStyles.info,
    flex: 1,
    lineHeight: 18,
    color: colors.textSecondary,
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

export default RegisterScreen;

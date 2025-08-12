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
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, shadows, borderRadius, chicaloStyles } from '../theme';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [authMode, setAuthMode] = useState('credentials');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [cardUid, setCardUid] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, loginWithCard } = useAuth();

  const handleLogin = async () => {
    console.log('🚀 Iniciando proceso de login...');
    
    if (authMode === 'credentials') {
      if (!username.trim() || !password.trim()) {
        console.log('❌ Campos vacíos en modo credenciales');
        Alert.alert('Error', 'Por favor ingresa tu usuario y contraseña');
        return;
      }
      console.log('✅ Campos de credenciales válidos');
    } else {
      if (!cardUid.trim()) {
        console.log('❌ UID de tarjeta vacío');
        Alert.alert('Error', 'Por favor ingresa el UID de tu tarjeta');
        return;
      }
      console.log('✅ UID de tarjeta válido');
    }

    setLoading(true);
    let result;
    
    try {
      if (authMode === 'credentials') {
        console.log('🔐 Llamando login con credenciales...');
        result = await login(username.trim(), password);
      } else {
        console.log('💳 Llamando login con tarjeta...');
        result = await loginWithCard(cardUid.trim());
      }
      
      console.log('📋 Resultado del login:', { 
        success: result?.success, 
        error: result?.error 
      });
    } catch (error) {
      console.error('❌ Error en handleLogin:', error);
      result = { success: false, error: error.message };
    } finally {
      setLoading(false);
    }

    if (!result.success) {
      console.log('❌ Login falló:', result.error);
      Alert.alert('Error', result.error || 'No se pudo autenticar');
    } else {
      console.log('✅ Login exitoso, navegando...');
    }
  };

  const clearFields = () => {
    setUsername('');
    setPassword('');
    setCardUid('');
  };

  const handleModeChange = (mode) => {
    setAuthMode(mode);
    clearFields();
  };

  return (
    <View style={styles.container}>
      {/* Header optimizado - inspirado en Google/Apple */}
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
            QUIVO
          </Text>
          <Text style={styles.brandSubtitle}>
            Transporte Público Bolivia
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
          {/* Selector de modo optimizado - inspirado en Uber */}
          <View style={styles.modeSection}>
            <Surface style={styles.modeSurface} elevation={1}>
              <SegmentedButtons
                value={authMode}
                onValueChange={handleModeChange}
                buttons={[
                  {
                    value: 'credentials',
                    label: 'Cuenta',
                    icon: 'account-circle',
                    style: authMode === 'credentials' ? styles.activeSegment : styles.inactiveSegment,
                  },
                  {
                    value: 'card',
                    label: 'Tarjeta NFC',
                    icon: 'contactless-payment',
                    style: authMode === 'card' ? styles.activeSegment : styles.inactiveSegment,
                  },
                ]}
                style={styles.segmentedButtons}
              />
            </Surface>
          </View>

          {/* Formulario principal optimizado - inspirado en Google */}
          <Card style={styles.mainCard}>
            <Card.Content style={styles.cardContent}>
              {authMode === 'credentials' ? (
                <View style={styles.credentialsForm}>
                  {/* Campo de usuario */}
                  <View style={styles.inputGroup}>
                    <TextInput
                      value={username}
                      onChangeText={setUsername}
                      mode="outlined"
                      placeholder="Usuario"
                      autoCapitalize="none"
                      left={<TextInput.Icon icon="account" color={colors.primary} />}
                      style={styles.input}
                      outlineStyle={styles.inputOutline}
                    />
                  </View>

                  {/* Campo de contraseña */}
                  <View style={styles.inputGroup}>
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
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

                  {/* Información contextual - inspirado en Spotify */}
                  <View style={styles.infoBox}>
                    <IconButton
                      icon="information"
                      size={18}
                      iconColor={colors.primary}
                      style={styles.infoIcon}
                    />
                    <Text style={styles.infoText}>
                      Accede con tu cuenta para gestionar todas tus tarjetas
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.cardForm}>
                  {/* Campo de UID */}
                  <View style={styles.inputGroup}>
                    <TextInput
                      value={cardUid}
                      onChangeText={setCardUid}
                      mode="outlined"
                      placeholder="UID de Tarjeta NFC"
                      autoCapitalize="characters"
                      left={<TextInput.Icon icon="contactless-payment" color={colors.primary} />}
                      style={styles.input}
                      outlineStyle={styles.inputOutline}
                    />
                  </View>

                  {/* Instrucciones NFC optimizadas */}
                  <View style={styles.nfcInstructions}>
                    <IconButton
                      icon="nfc"
                      size={40}
                      iconColor={colors.primary}
                      style={styles.nfcIcon}
                    />
                    <Text style={styles.nfcTitle}>
                      Acceso rápido con NFC
                    </Text>
                    <Text style={styles.nfcDescription}>
                      Coloca tu tarjeta cerca del dispositivo o ingresa el UID manualmente
                    </Text>
                  </View>
                </View>
              )}

              {/* Botón de login prominente - inspirado en Apple */}
              <Button
                mode="contained"
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                style={styles.loginButton}
                labelStyle={styles.loginButtonLabel}
                contentStyle={styles.loginButtonContent}
                icon={authMode === 'credentials' ? 'login' : 'contactless-payment'}
              >
                {loading ? 'Verificando...' : 'Ingresar'}
              </Button>
            </Card.Content>
          </Card>

          {/* Enlaces de ayuda integrados - inspirado en Google */}
          <View style={styles.helpSection}>
            {console.log('AuthMode:', authMode)}
            <View style={styles.credentialsHelp}>
              <Button
                mode="text"
                onPress={() => navigation.navigate('Register')}
                style={styles.helpButton}
                labelStyle={styles.helpButtonLabel}
                icon="account-plus"
              >
                Crear cuenta nueva
              </Button>
              <Button
                mode="text"
                onPress={() => navigation.navigate('ForgotPassword')}
                style={styles.helpButton}
                labelStyle={styles.helpButtonLabel}
                icon="lock-reset"
              >
                ¿Olvidaste tu contraseña?
              </Button>
            </View>
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
    flexGrow: 1,
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
  credentialsForm: {
    gap: 20,
  },
  cardForm: {
    gap: 20,
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
  nfcInstructions: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.warningLight,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.warning,
    borderStyle: 'dashed',
  },
  nfcIcon: {
    backgroundColor: colors.primary + '15',
    marginBottom: 12,
  },
  nfcTitle: {
    ...chicaloStyles.subtitle,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  nfcDescription: {
    ...chicaloStyles.description,
    textAlign: 'center',
    lineHeight: 18,
    color: colors.textSecondary,
  },
  loginButton: {
    borderRadius: borderRadius.md,
    marginTop: 8,
    ...shadows.medium,
  },
  loginButtonContent: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: borderRadius.md,
  },
  loginButtonLabel: {
    color: colors.backgroundAlt,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  helpSection: {
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
  },
  credentialsHelp: {
    width: '100%',
    gap: 12,
  },
  helpButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.md,
    marginBottom: 8,
  },
  helpButtonLabel: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  nfcHelp: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.md,
    padding: 16,
  },
  helpText: {
    ...chicaloStyles.description,
    flex: 1,
    lineHeight: 18,
    color: colors.textSecondary,
  },
});

export default LoginScreen;
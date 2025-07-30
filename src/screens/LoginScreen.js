import React, { useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    View,
    ActivityIndicator,
    ScrollView,
    Dimensions,
} from 'react-native';
import {
    Button,
    Card,
    Paragraph,
    TextInput,
    Title,
    SegmentedButtons,
    Divider,
    Text,
    IconButton,
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { colors, typography, chicaloStyles } from '../theme';

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  const [authMode, setAuthMode] = useState('credentials');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [cardUid, setCardUid] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, loginWithCard } = useAuth();

  const handleLogin = async () => {
    if (authMode === 'credentials') {
      if (!username.trim() || !password.trim()) {
        Alert.alert('Error', 'Por favor ingresa tu usuario y contraseña');
        return;
      }
    } else {
      if (!cardUid.trim()) {
        Alert.alert('Error', 'Por favor ingresa el UID de tu tarjeta');
        return;
      }
    }

    setLoading(true);
    let result;
    
    if (authMode === 'credentials') {
      result = await login(username.trim(), password);
    } else {
      result = await loginWithCard(cardUid.trim());
    }
    
    setLoading(false);

    if (!result.success) {
      Alert.alert('Error', result.error || 'No se pudo autenticar');
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
      {/* Header con gradiente visual */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoWrapper}>
            <Image
              source={require('../../assets/images/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text variant="titleLarge" style={styles.appTitle}>
            Transporte Público
          </Text>
          <Text variant="titleMedium" style={styles.appSubtitle}>
            Bolivia
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
          {/* Selector de Modo Mejorado */}
          <View style={styles.modeSection}>
            <Text variant="titleSmall" style={styles.sectionTitle}>
              Método de acceso
            </Text>
            <Card style={styles.modeCard}>
              <Card.Content style={styles.modeCardContent}>
                <SegmentedButtons
                  value={authMode}
                  onValueChange={handleModeChange}
                  buttons={[
                    {
                      value: 'credentials',
                      label: 'Usuario',
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
              </Card.Content>
            </Card>
          </View>

          {/* Formulario Principal */}
          <Card style={styles.mainCard}>
            <Card.Content style={styles.cardContent}>
              {authMode === 'credentials' ? (
                <View style={styles.credentialsForm}>
                  <View style={styles.inputGroup}>
                    <Text variant="bodyMedium" style={styles.inputLabel}>
                      Usuario
                    </Text>
                    <TextInput
                      value={username}
                      onChangeText={setUsername}
                      mode="outlined"
                      placeholder="Ej: juan.perez"
                      autoCapitalize="none"
                      left={<TextInput.Icon icon="account" color={colors.primary} />}
                      style={styles.input}
                      outlineStyle={styles.inputOutline}
                      contentStyle={styles.inputContent}
                      theme={{
                        colors: {
                          primary: colors.primary,
                          outline: '#E0E0E0',
                          outlineVariant: '#F5F5F5',
                        }
                      }}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text variant="bodyMedium" style={styles.inputLabel}>
                      Contraseña
                    </Text>
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      mode="outlined"
                      placeholder="Ingresa tu contraseña"
                      secureTextEntry={!showPassword}
                      left={<TextInput.Icon icon="lock" color={colors.primary} />}
                      right={
                        <TextInput.Icon
                          icon={showPassword ? "eye-off" : "eye"}
                          color={colors.secondaryText}
                          onPress={() => setShowPassword(!showPassword)}
                        />
                      }
                      style={styles.input}
                      outlineStyle={styles.inputOutline}
                      contentStyle={styles.inputContent}
                      theme={{
                        colors: {
                          primary: colors.primary,
                          outline: '#E0E0E0',
                          outlineVariant: '#F5F5F5',
                        }
                      }}
                    />
                  </View>

                  <View style={styles.infoBox}>
                    <View style={styles.infoIcon}>
                      <IconButton
                        icon="information"
                        size={16}
                        iconColor={colors.primary}
                      />
                    </View>
                    <Text variant="bodySmall" style={styles.infoText}>
                      Accede con tu cuenta para gestionar todas tus tarjetas y ver el historial completo
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.cardForm}>
                  <View style={styles.inputGroup}>
                    <Text variant="bodyMedium" style={styles.inputLabel}>
                      UID de Tarjeta NFC
                    </Text>
                    <TextInput
                      value={cardUid}
                      onChangeText={setCardUid}
                      mode="outlined"
                      placeholder="Ej: A1B2C3D4E5F6G7H8"
                      autoCapitalize="characters"
                      left={<TextInput.Icon icon="contactless-payment" color={colors.primary} />}
                      style={styles.input}
                      outlineStyle={styles.inputOutline}
                      contentStyle={styles.inputContent}
                      theme={{
                        colors: {
                          primary: colors.primary,
                          outline: '#E0E0E0',
                          outlineVariant: '#F5F5F5',
                        }
                      }}
                    />
                  </View>

                  <View style={styles.nfcInstructions}>
                    <View style={styles.nfcIcon}>
                      <IconButton
                        icon="nfc"
                        size={40}
                        iconColor={colors.accent}
                        style={styles.nfcIconButton}
                      />
                    </View>
                    <Text variant="bodyMedium" style={styles.nfcTitle}>
                      Acceso rápido con NFC
                    </Text>
                    <Text variant="bodySmall" style={styles.nfcDescription}>
                      Coloca tu tarjeta cerca del dispositivo para leer el UID automáticamente o ingrésalo manualmente
                    </Text>
                  </View>
                </View>
              )}

              {/* Botón de Login Mejorado */}
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

          {/* Texto de ayuda mejorado */}
          <View style={styles.helpSection}>
            <Text variant="bodySmall" style={styles.helpText}>
              {authMode === 'credentials' 
                ? '¿No tienes cuenta? Contacta al administrador del sistema para obtener acceso.'
                : 'Si no puedes leer el NFC automáticamente, ingresa el UID manualmente desde la configuración de tu tarjeta.'
              }
            </Text>
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    backgroundColor: colors.background,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.backgroundAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  logo: {
    width: 60,
    height: 60,
  },
  appTitle: {
    ...typography.headlineMedium,
    color: colors.backgroundAlt,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  appSubtitle: {
    ...chicaloStyles.subtitle,
    textAlign: 'center',
    fontWeight: '300',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  modeSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...typography.titleSmall,
    color: colors.backgroundAlt,
    marginBottom: 12,
    fontWeight: '600',
  },
  modeCard: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modeCardContent: {
    paddingVertical: 8,
  },
  segmentedButtons: {
    backgroundColor: '#F8F9FF',
  },
  activeSegment: {
    backgroundColor: colors.primary,
  },
  inactiveSegment: {
    backgroundColor: 'transparent',
  },
  mainCard: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 24,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
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
    gap: 8,
  },
  inputLabel: {
    ...typography.bodyMedium,
    color: colors.primary,
    fontWeight: '500',
    marginLeft: 4,
  },
  input: {
    backgroundColor: colors.backgroundAlt,
    fontSize: 16,
  },
  inputOutline: {
    borderRadius: 16,
    borderWidth: 1.5,
  },
  inputContent: {
    paddingVertical: 4,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8F9FF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  infoIcon: {
    marginRight: 8,
    marginTop: -4,
  },
  infoText: {
    ...chicaloStyles.info,
    flex: 1,
    lineHeight: 18,
  },
  nfcInstructions: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF9E6',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.accent,
    borderStyle: 'dashed',
  },
  nfcIcon: {
    marginBottom: 12,
  },
  nfcIconButton: {
    backgroundColor: colors.accent + '20',
  },
  nfcTitle: {
    ...typography.bodyMedium,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  nfcDescription: {
    ...chicaloStyles.description,
    textAlign: 'center',
    lineHeight: 18,
  },
  loginButton: {
    borderRadius: 16,
    marginTop: 8,
    elevation: 0,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  loginButtonContent: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 16,
  },
  loginButtonLabel: {
    color: colors.backgroundAlt,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  helpSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  helpText: {
    ...chicaloStyles.secondary,
    color: colors.backgroundAlt,
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.8,
  },
});

export default LoginScreen;
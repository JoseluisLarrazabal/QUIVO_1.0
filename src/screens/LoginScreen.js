import React, { useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    View,
} from 'react-native';
import {
    Button,
    Card,
    Paragraph,
    TextInput,
    Title,
    SegmentedButtons,
    Divider,
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { appTheme, fonts, colors } from '../theme';

const LoginScreen = () => {
  const [authMode, setAuthMode] = useState('credentials');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [cardUid, setCardUid] = useState('');
  const [loading, setLoading] = useState(false);
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
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Image
          source={require('../../assets/images/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Title style={[fonts.title, styles.title]}>Transporte Público Bolivia</Title>
        <Paragraph style={[fonts.subtitle, styles.subtitle]}>
          Accede a tu cuenta o tarjeta
        </Paragraph>
        {/* Selector de Modo de Autenticación */}
        <Card style={styles.modeCard}>
          <Card.Content>
            <SegmentedButtons
              value={authMode}
              onValueChange={handleModeChange}
              buttons={[
                {
                  value: 'credentials',
                  label: 'Credenciales',
                  icon: 'account',
                },
                {
                  value: 'card',
                  label: 'Tarjeta NFC',
                  icon: 'credit-card',
                },
              ]}
              style={styles.segmentedButtons}
            />
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Content>
            {authMode === 'credentials' ? (
              <>
                <TextInput
                  label="Usuario"
                  value={username}
                  onChangeText={setUsername}
                  mode="outlined"
                  placeholder="Ej: juan.perez"
                  autoCapitalize="none"
                  style={styles.input}
                  theme={{ colors: { primary: colors.primary, text: colors.text, placeholder: colors.primary } }}
                  underlineColor={colors.primary}
                />
                <TextInput
                  label="Contraseña"
                  value={password}
                  onChangeText={setPassword}
                  mode="outlined"
                  placeholder="Ingresa tu contraseña"
                  secureTextEntry
                  style={styles.input}
                  theme={{ colors: { primary: colors.primary, text: colors.text, placeholder: colors.primary } }}
                  underlineColor={colors.primary}
                />
                <Paragraph style={[fonts.body, styles.modeDescription]}>
                  Accede con tu cuenta para gestionar todas tus tarjetas
                </Paragraph>
              </>
            ) : (
              <>
                <TextInput
                  label="UID de Tarjeta"
                  value={cardUid}
                  onChangeText={setCardUid}
                  mode="outlined"
                  placeholder="Ej: A1B2C3D4"
                  autoCapitalize="characters"
                  style={styles.input}
                  theme={{ colors: { primary: colors.primary, text: colors.text, placeholder: colors.primary } }}
                  underlineColor={colors.primary}
                />
                <Paragraph style={[fonts.body, styles.modeDescription]}>
                  Accede directamente con tu tarjeta NFC para uso rápido
                </Paragraph>
              </>
            )}
            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.button}
              labelStyle={{ color: colors.accent, fontFamily: 'Montserrat_400Regular', fontSize: 18 }}
              contentStyle={{ backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 8 }}
            >
              {loading ? 'Verificando...' : 'Ingresar'}
            </Button>
          </Card.Content>
        </Card>
        <Paragraph style={[fonts.body, styles.helpText]}>
          {authMode === 'credentials' 
            ? '¿No tienes cuenta? Contacta al administrador del sistema.'
            : 'Coloca tu tarjeta cerca del dispositivo para leer el UID automáticamente.'
          }
        </Paragraph>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
  },
  modeCard: {
    marginBottom: 20,
    borderRadius: 16,
    elevation: 2,
    backgroundColor: colors.background,
  },
  segmentedButtons: {
    marginBottom: 10,
  },
  card: {
    marginBottom: 20,
    borderRadius: 16,
    elevation: 2,
    backgroundColor: colors.background,
  },
  input: {
    marginBottom: 20,
    backgroundColor: colors.background,
    fontFamily: 'Montserrat_400Regular',
  },
  modeDescription: {
    textAlign: 'center',
    color: colors.primary,
    fontSize: 13,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  button: {
    borderRadius: 12,
    marginTop: 8,
    elevation: 0,
  },
  helpText: {
    textAlign: 'center',
    color: colors.accent,
    fontSize: 13,
    marginTop: 8,
  },
});

export default LoginScreen;
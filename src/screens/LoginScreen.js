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
    Title
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu usuario y contraseña');
      return;
    }

    setLoading(true);
    const result = await login(username.trim(), password);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Error', result.error || 'No se pudo autenticar al usuario');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Image
          source={require('../../assets/images/icon.png')} // Logo temporal
          style={styles.logo}
          resizeMode="contain"
        />
        
        <Title style={styles.title}>Transporte Público Bolivia</Title>
        <Paragraph style={styles.subtitle}>
          Ingresa tus credenciales para acceder
        </Paragraph>

        <Card style={styles.card}>
          <Card.Content>
            <TextInput
              label="Usuario"
              value={username}
              onChangeText={setUsername}
              mode="outlined"
              placeholder="Ej: juan.perez"
              autoCapitalize="none"
              style={styles.input}
            />

            <TextInput
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              placeholder="Ingresa tu contraseña"
              secureTextEntry
              style={styles.input}
            />

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.button}
            >
              {loading ? 'Verificando...' : 'Ingresar'}
            </Button>
          </Card.Content>
        </Card>

        <Paragraph style={styles.helpText}>
          ¿No tienes cuenta? Contacta al administrador del sistema.
        </Paragraph>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
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
    color: '#2196F3',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  card: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 20,
  },
  button: {
    paddingVertical: 8,
  },
  helpText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
  },
});

export default LoginScreen;
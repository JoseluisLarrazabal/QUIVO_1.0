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
  const [uid, setUid] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!uid.trim()) {
      Alert.alert('Error', 'Por favor ingresa el UID de tu tarjeta');
      return;
    }

    setLoading(true);
    const result = await login(uid.trim());
    setLoading(false);

    if (!result.success) {
      Alert.alert('Error', result.error || 'No se pudo encontrar la tarjeta');
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
          Ingresa el UID de tu tarjeta NFC para acceder
        </Paragraph>

        <Card style={styles.card}>
          <Card.Content>
            <TextInput
              label="UID de la Tarjeta"
              value={uid}
              onChangeText={setUid}
              mode="outlined"
              placeholder="Ej: A1B2C3D4"
              autoCapitalize="characters"
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
          ¿No tienes una tarjeta? Acércate a cualquier punto de recarga autorizado.
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
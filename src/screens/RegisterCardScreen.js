import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  TextInput,
  SegmentedButtons,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';

const RegisterCardScreen = ({ navigation }) => {
  const { user, refreshUserCards } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    uid: '',
    alias: '',
    tipo_tarjeta: 'adulto',
    saldo_inicial: '',
  });

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

  const getCardTypeLabel = (tipo) => {
    switch (tipo) {
      case 'adulto': return 'Adulto';
      case 'estudiante': return 'Estudiante';
      case 'adulto_mayor': return 'Adulto Mayor';
      default: return 'Desconocido';
    }
  };

  const getCardTypeColor = (tipo) => {
    switch (tipo) {
      case 'adulto': return '#2196F3';
      case 'estudiante': return '#4CAF50';
      case 'adulto_mayor': return '#FF9800';
      default: return '#757575';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>Registrar Nueva Tarjeta</Title>
        <Paragraph style={styles.subtitle}>
          Agrega una nueva tarjeta NFC a tu cuenta
        </Paragraph>
      </View>

      {/* Información del Usuario */}
      <Card style={styles.userCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Tu Información</Title>
          <View style={styles.userInfo}>
            <Paragraph style={styles.userName}>{user.nombre}</Paragraph>
            <Paragraph style={styles.userType}>
              Tipo: {getCardTypeLabel(user.tipo_tarjeta)}
            </Paragraph>
          </View>
        </Card.Content>
      </Card>

      {/* Formulario de Registro */}
      <Card style={styles.formCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Información de la Tarjeta</Title>

          {/* UID de la Tarjeta */}
          <TextInput
            label="UID de la Tarjeta *"
            value={formData.uid}
            onChangeText={(value) => handleInputChange('uid', value)}
            mode="outlined"
            placeholder="Ej: A1B2C3D4"
            autoCapitalize="characters"
            style={styles.input}
            maxLength={50}
          />

          {/* Alias de la Tarjeta */}
          <TextInput
            label="Alias (Opcional)"
            value={formData.alias}
            onChangeText={(value) => handleInputChange('alias', value)}
            mode="outlined"
            placeholder="Ej: Mi Tarjeta Principal"
            style={styles.input}
            maxLength={50}
          />

          {/* Tipo de Tarjeta */}
          <View style={styles.typeSection}>
            <Paragraph style={styles.typeLabel}>Tipo de Tarjeta:</Paragraph>
            <SegmentedButtons
              value={formData.tipo_tarjeta}
              onValueChange={(value) => handleInputChange('tipo_tarjeta', value)}
              buttons={[
                {
                  value: 'adulto',
                  label: 'Adulto',
                  style: { backgroundColor: formData.tipo_tarjeta === 'adulto' ? '#2196F3' : undefined }
                },
                {
                  value: 'estudiante',
                  label: 'Estudiante',
                  style: { backgroundColor: formData.tipo_tarjeta === 'estudiante' ? '#4CAF50' : undefined }
                },
                {
                  value: 'adulto_mayor',
                  label: 'Adulto Mayor',
                  style: { backgroundColor: formData.tipo_tarjeta === 'adulto_mayor' ? '#FF9800' : undefined }
                },
              ]}
              style={styles.segmentedButtons}
            />
          </View>

          <Divider style={styles.divider} />

          {/* Saldo Inicial */}
          <TextInput
            label="Saldo Inicial (Opcional)"
            value={formData.saldo_inicial}
            onChangeText={(value) => handleInputChange('saldo_inicial', value)}
            mode="outlined"
            placeholder="0.00"
            keyboardType="numeric"
            style={styles.input}
          />

          <Paragraph style={styles.helpText}>
            * El UID es el identificador único de tu tarjeta NFC
          </Paragraph>
        </Card.Content>
      </Card>

      {/* Resumen */}
      {formData.uid && (
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Resumen</Title>
            <View style={styles.summaryRow}>
              <Paragraph>UID:</Paragraph>
              <Paragraph style={styles.summaryValue}>{formData.uid.toUpperCase()}</Paragraph>
            </View>
            {formData.alias && (
              <View style={styles.summaryRow}>
                <Paragraph>Alias:</Paragraph>
                <Paragraph style={styles.summaryValue}>{formData.alias}</Paragraph>
              </View>
            )}
            <View style={styles.summaryRow}>
              <Paragraph>Tipo:</Paragraph>
              <Paragraph style={[styles.summaryValue, { color: getCardTypeColor(formData.tipo_tarjeta) }]}>
                {getCardTypeLabel(formData.tipo_tarjeta)}
              </Paragraph>
            </View>
            <View style={styles.summaryRow}>
              <Paragraph>Saldo inicial:</Paragraph>
              <Paragraph style={styles.summaryValue}>
                {formData.saldo_inicial ? `${parseFloat(formData.saldo_inicial).toFixed(2)} Bs` : '0.00 Bs'}
              </Paragraph>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Botones de Acción */}
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleRegisterCard}
          loading={loading}
          disabled={loading || !formData.uid.trim()}
          style={styles.registerButton}
          contentStyle={styles.buttonContent}
        >
          {loading ? 'Registrando...' : 'Registrar Tarjeta'}
        </Button>

        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          disabled={loading}
          style={styles.cancelButton}
          contentStyle={styles.buttonContent}
        >
          Cancelar
        </Button>
      </View>

      <View style={styles.footer}>
        <Paragraph style={styles.footerText}>
          La tarjeta será registrada en tu cuenta y podrás gestionarla desde "Mis Tarjetas"
        </Paragraph>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    elevation: 2,
  },
  title: {
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    color: '#666',
  },
  userCard: {
    margin: 20,
    marginTop: 10,
    elevation: 4,
  },
  userInfo: {
    marginTop: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userType: {
    color: '#666',
    marginTop: 5,
  },
  formCard: {
    margin: 20,
    marginTop: 0,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 15,
  },
  input: {
    marginBottom: 15,
  },
  typeSection: {
    marginBottom: 15,
  },
  typeLabel: {
    marginBottom: 10,
    color: '#666',
    fontSize: 14,
  },
  segmentedButtons: {
    marginBottom: 10,
  },
  divider: {
    marginVertical: 15,
  },
  helpText: {
    color: '#666',
    fontSize: 12,
    fontStyle: 'italic',
  },
  summaryCard: {
    margin: 20,
    marginTop: 0,
    elevation: 4,
    backgroundColor: '#f8f9fa',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryValue: {
    fontWeight: 'bold',
  },
  buttonContainer: {
    padding: 20,
    paddingTop: 10,
  },
  registerButton: {
    backgroundColor: '#4CAF50',
    marginBottom: 10,
  },
  cancelButton: {
    borderColor: '#666',
  },
  buttonContent: {
    paddingVertical: 8,
  },
  footer: {
    padding: 20,
    paddingTop: 0,
  },
  footerText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    fontStyle: 'italic',
  },
});

export default RegisterCardScreen; 
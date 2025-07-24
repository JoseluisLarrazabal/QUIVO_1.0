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
  Text,
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import { colors, typography } from '../theme';

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
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.header}>
        <Text variant="titleLarge" style={[typography.title, styles.title]}>Registrar Nueva Tarjeta</Text>
        <Text variant="bodyMedium" style={[typography.subtitle, styles.subtitle]}>
          Agrega una nueva tarjeta NFC a tu cuenta
        </Text>
      </View>
      {/* Información del Usuario */}
      <Card style={[styles.userCard, { backgroundColor: colors.backgroundAlt }]}>
        <Card.Content>
          <Text variant="titleMedium" style={[typography.subtitle, styles.sectionTitle]}>Tu Información</Text>
          <View style={styles.userInfo}>
            <Text variant="titleMedium" style={[typography.body, styles.userName]}>{user.nombre}</Text>
            <Text variant="titleSmall" style={[typography.body, styles.userType]}>
              Tipo: {getCardTypeLabel(user.tipo_tarjeta)}
            </Text>
          </View>
        </Card.Content>
      </Card>
      {/* Formulario de Registro */}
      <Card style={[styles.formCard, { backgroundColor: colors.backgroundAlt }]}>
        <Card.Content>
          <Text variant="titleMedium" style={[typography.subtitle, styles.sectionTitle]}>Información de la Tarjeta</Text>
          {/* UID de la Tarjeta */}
          <TextInput
            label="UID de la Tarjeta *"
            value={formData.uid}
            onChangeText={(value) => handleInputChange('uid', value)}
            mode="outlined"
            placeholder="Ej: A1B2C3D4"
            autoCapitalize="characters"
            style={[styles.input, { backgroundColor: colors.backgroundInput, color: colors.text }]}
            maxLength={50}
            theme={{ colors: { primary: colors.primary, text: colors.text, placeholder: colors.secondaryText } }}
            underlineColor={colors.primary}
          />
          {/* Alias de la Tarjeta */}
          <TextInput
            label="Alias (Opcional)"
            value={formData.alias}
            onChangeText={(value) => handleInputChange('alias', value)}
            mode="outlined"
            placeholder="Ej: Mi Tarjeta Principal"
            style={[styles.input, { backgroundColor: colors.backgroundInput, color: colors.text }]}
            maxLength={50}
            theme={{ colors: { primary: colors.primary, text: colors.text, placeholder: colors.secondaryText } }}
            underlineColor={colors.primary}
          />
          {/* Tipo de Tarjeta */}
          <View style={styles.typeSection}>
            <Text variant="titleSmall" style={[typography.body, styles.typeLabel]}>Tipo de Tarjeta:</Text>
            <SegmentedButtons
              value={formData.tipo_tarjeta}
              onValueChange={(value) => handleInputChange('tipo_tarjeta', value)}
              buttons={[
                {
                  value: 'adulto',
                  label: 'Adulto',
                  style: { minWidth: 90, backgroundColor: formData.tipo_tarjeta === 'adulto' ? colors.primary : undefined, color: colors.background }
                },
                {
                  value: 'estudiante',
                  label: 'Estudiante',
                  style: { minWidth: 110, backgroundColor: formData.tipo_tarjeta === 'estudiante' ? '#4CAF50' : undefined, color: colors.background }
                },
                {
                  value: 'adulto_mayor',
                  label: 'Adulto Mayor',
                  style: { minWidth: 120, backgroundColor: formData.tipo_tarjeta === 'adulto_mayor' ? colors.accent : undefined, color: colors.primary }
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
            theme={{ colors: { primary: colors.primary, text: colors.text, placeholder: colors.primary } }}
            underlineColor={colors.primary}
          />
          <Text style={[typography.body, styles.helpText]}>
            * El UID es el identificador único de tu tarjeta NFC
          </Text>
        </Card.Content>
      </Card>
      {/* Resumen */}
      {formData.uid && (
        <Card style={[styles.summaryCard, { backgroundColor: colors.backgroundAlt }]}>
          <Card.Content>
            <Text variant="titleMedium" style={[typography.subtitle, styles.sectionTitle]}>Resumen</Text>
            <View style={styles.summaryRow}>
              <Text style={typography.body}>UID:</Text>
              <Text style={[typography.body, styles.summaryValue]}>{formData.uid.toUpperCase()}</Text>
            </View>
            {formData.alias && (
              <View style={styles.summaryRow}>
                <Text style={typography.body}>Alias:</Text>
                <Text style={[typography.body, styles.summaryValue]}>{formData.alias}</Text>
              </View>
            )}
            <View style={styles.summaryRow}>
              <Text style={typography.body}>Tipo:</Text>
              <Text style={[typography.body, styles.summaryValue, { color: getCardTypeColor(formData.tipo_tarjeta) }]}>{getCardTypeLabel(formData.tipo_tarjeta)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={typography.body}>Saldo inicial:</Text>
              <Text style={[typography.body, styles.summaryValue]}>
                {formData.saldo_inicial ? `${parseFloat(formData.saldo_inicial).toFixed(2)} Bs` : '0.00 Bs'}
              </Text>
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
          labelStyle={{ color: colors.accent, fontFamily: 'Montserrat_400Regular', fontSize: 18 }}
        >
          {loading ? 'Registrando...' : 'Registrar Tarjeta'}
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          disabled={loading}
          style={styles.cancelButton}
          contentStyle={styles.buttonContent}
          labelStyle={{ color: colors.primary, fontFamily: 'Montserrat_400Regular', fontSize: 18 }}
        >
          Cancelar
        </Button>
      </View>
      <View style={styles.footer}>
        <Text style={[typography.body, styles.footerText]}>
          La tarjeta será registrada en tu cuenta y podrás gestionarla desde "Mis Tarjetas"
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 24,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 12,
    elevation: 4,
    alignItems: 'center',
  },
  title: {
    color: colors.background,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    color: colors.accent,
    textAlign: 'center',
    marginBottom: 0,
  },
  userCard: {
    margin: 20,
    marginTop: 10,
    elevation: 4,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F3F0FF',
    backgroundColor: colors.background,
  },
  userInfo: {
    marginTop: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    fontFamily: 'Montserrat_400Regular',
  },
  userType: {
    color: colors.accent,
    marginTop: 5,
    fontFamily: 'Chicalo-Regular',
  },
  formCard: {
    margin: 20,
    marginTop: 0,
    elevation: 4,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F3F0FF',
    backgroundColor: colors.background,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 15,
    color: colors.primary,
    fontFamily: 'Montserrat_400Regular',
  },
  input: {
    marginBottom: 15,
    backgroundColor: colors.background,
    fontFamily: 'Montserrat_400Regular',
  },
  typeSection: {
    marginBottom: 15,
  },
  typeLabel: {
    marginBottom: 10,
    color: colors.primary,
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
  },
  segmentedButtons: {
    marginBottom: 10,
  },
  divider: {
    marginVertical: 15,
    backgroundColor: '#EEE',
  },
  helpText: {
    color: colors.accent,
    fontSize: 12,
    fontStyle: 'italic',
    fontFamily: 'Montserrat_400Regular',
  },
  summaryCard: {
    margin: 20,
    marginTop: 0,
    elevation: 4,
    backgroundColor: '#f8f9fa',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F3F0FF',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryValue: {
    fontWeight: 'bold',
    fontFamily: 'Montserrat_400Regular',
    color: colors.primary,
  },
  buttonContainer: {
    padding: 20,
    paddingTop: 10,
  },
  registerButton: {
    backgroundColor: colors.primary,
    marginBottom: 10,
    borderRadius: 12,
    elevation: 0,
  },
  cancelButton: {
    borderColor: colors.primary,
    borderRadius: 12,
    elevation: 0,
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
    color: colors.accent,
    fontSize: 12,
    fontStyle: 'italic',
    fontFamily: 'Montserrat_400Regular',
  },
});

export default RegisterCardScreen; 
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
  RadioButton,
  Divider,
  ActivityIndicator,
  Chip,
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import CenteredLoader from '../components/CenteredLoader';

const RechargeScreen = () => {
  const { user, refreshUserCards, loading } = useAuth();
  const [selectedCard, setSelectedCard] = useState(null);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [loadingLocal, setLoadingLocal] = useState(false);

  const predefinedAmounts = [10, 20, 50, 100];

  const handleRecharge = async () => {
    if (!selectedCard) {
      Alert.alert('Error', 'Por favor selecciona una tarjeta');
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
            setSelectedCard(null);
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
    switch (method) {
      case 'efectivo': return 'Efectivo';
      case 'qr': return 'QR Bancario';
      case 'tigo_money': return 'Tigo Money';
      default: return 'Desconocido';
    }
  };

  const selectPredefinedAmount = (value) => {
    setAmount(value.toString());
  };

  // Retorno temprano DESPUÉS de todos los hooks
  if (loading || !user) {
    return <CenteredLoader />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>Recargar Tarjeta</Title>
        <Paragraph style={styles.subtitle}>
          Selecciona una tarjeta para recargar
        </Paragraph>
      </View>

      {/* Selección de Tarjeta */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Seleccionar Tarjeta</Title>
          {user.cards && user.cards.length > 0 ? (
            <View style={styles.cardsContainer}>
              {user.cards.map((card, index) => (
                <Button
                  key={index}
                  mode={selectedCard?.uid === card.uid ? 'contained' : 'outlined'}
                  onPress={() => setSelectedCard(card)}
                  style={styles.cardButton}
                >
                  <View style={styles.cardButtonContent}>
                    <Paragraph style={styles.cardUid}>{card.uid}</Paragraph>
                    <Paragraph style={styles.cardBalance}>
                      Saldo: {card.saldo_actual.toFixed(2)} Bs
                    </Paragraph>
                  </View>
                </Button>
              ))}
            </View>
          ) : (
            <Paragraph style={styles.noCards}>
              No tienes tarjetas registradas
            </Paragraph>
          )}
        </Card.Content>
      </Card>

      {/* Montos Predefinidos */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Montos Rápidos</Title>
          <View style={styles.predefinedAmounts}>
            {predefinedAmounts.map((value) => (
              <Button
                key={value}
                mode={amount === value.toString() ? 'contained' : 'outlined'}
                onPress={() => selectPredefinedAmount(value)}
                style={styles.amountButton}
              >
                {value} Bs
              </Button>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Monto Personalizado */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Monto Personalizado</Title>
          <TextInput
            label="Monto a recargar (Bs)"
            value={amount}
            onChangeText={setAmount}
            mode="outlined"
            keyboardType="numeric"
            placeholder="0.00"
            style={styles.input}
          />
          <Paragraph style={styles.helpText}>
            Monto mínimo: 5 Bs
          </Paragraph>
        </Card.Content>
      </Card>

      {/* Método de Pago */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Método de Pago</Title>
          
          <View style={styles.paymentOption}>
            <RadioButton
              value="efectivo"
              status={paymentMethod === 'efectivo' ? 'checked' : 'unchecked'}
              onPress={() => setPaymentMethod('efectivo')}
            />
            <View style={styles.paymentInfo}>
              <Paragraph style={styles.paymentTitle}>Efectivo</Paragraph>
              <Paragraph style={styles.paymentDescription}>
                Recarga en puntos físicos autorizados
              </Paragraph>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.paymentOption}>
            <RadioButton
              value="qr"
              status={paymentMethod === 'qr' ? 'checked' : 'unchecked'}
              onPress={() => setPaymentMethod('qr')}
            />
            <View style={styles.paymentInfo}>
              <Paragraph style={styles.paymentTitle}>QR Bancario</Paragraph>
              <Paragraph style={styles.paymentDescription}>
                Pago mediante código QR de tu banco
              </Paragraph>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.paymentOption}>
            <RadioButton
              value="tigo_money"
              status={paymentMethod === 'tigo_money' ? 'checked' : 'unchecked'}
              onPress={() => setPaymentMethod('tigo_money')}
            />
            <View style={styles.paymentInfo}>
              <Paragraph style={styles.paymentTitle}>Tigo Money</Paragraph>
              <Paragraph style={styles.paymentDescription}>
                Pago con billetera móvil Tigo Money
              </Paragraph>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Resumen */}
      {amount && parseFloat(amount) > 0 && selectedCard && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Resumen</Title>
            <View style={styles.summaryRow}>
              <Paragraph>Tarjeta:</Paragraph>
              <Paragraph>{selectedCard.uid}</Paragraph>
            </View>
            <View style={styles.summaryRow}>
              <Paragraph>Monto a recargar:</Paragraph>
              <Paragraph style={styles.summaryAmount}>
                {parseFloat(amount).toFixed(2)} Bs
              </Paragraph>
            </View>
            <View style={styles.summaryRow}>
              <Paragraph>Saldo actual:</Paragraph>
              <Paragraph>{selectedCard.saldo_actual.toFixed(2)} Bs</Paragraph>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.summaryRow}>
              <Paragraph style={styles.summaryTotal}>Nuevo saldo:</Paragraph>
              <Paragraph style={styles.summaryTotal}>
                {(selectedCard.saldo_actual + parseFloat(amount)).toFixed(2)} Bs
              </Paragraph>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Botón de Recarga */}
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleRecharge}
          loading={loadingLocal}
          disabled={loadingLocal || !amount || parseFloat(amount) <= 0 || !selectedCard}
          style={styles.rechargeButton}
          contentStyle={styles.rechargeButtonContent}
        >
          {loadingLocal ? 'Procesando...' : 'Recargar Tarjeta'}
        </Button>
      </View>

      <View style={styles.footer}>
        <Paragraph style={styles.footerText}>
          Las recargas pueden tardar hasta 5 minutos en reflejarse
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
  },
  subtitle: {
    color: '#666',
    marginTop: 5,
  },
  card: {
    margin: 20,
    marginTop: 10,
  },
  cardsContainer: {
    gap: 10,
  },
  cardButton: {
    marginBottom: 10,
  },
  cardButtonContent: {
    alignItems: 'center',
  },
  cardUid: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  cardBalance: {
    color: '#666',
    fontSize: 14,
  },
  noCards: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 15,
  },
  predefinedAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  amountButton: {
    flex: 1,
    minWidth: '45%',
  },
  input: {
    marginBottom: 10,
  },
  helpText: {
    color: '#666',
    fontSize: 12,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  paymentInfo: {
    flex: 1,
    marginLeft: 10,
  },
  paymentTitle: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  paymentDescription: {
    color: '#666',
    fontSize: 12,
  },
  divider: {
    marginVertical: 5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryAmount: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  summaryTotal: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonContainer: {
    padding: 20,
    paddingTop: 10,
  },
  rechargeButton: {
    backgroundColor: '#4CAF50',
  },
  rechargeButtonContent: {
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

export default RechargeScreen;
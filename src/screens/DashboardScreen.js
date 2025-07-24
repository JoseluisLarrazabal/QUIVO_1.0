import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  Divider,
  IconButton,
  Banner,
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import CenteredLoader from '../components/CenteredLoader';

const DashboardScreen = ({ navigation }) => {
  const { user, logout, refreshUserCards, loading } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    if (user && user.selectedCard) {
      loadRecentTransactions();
    }
  }, [user]);

  const loadRecentTransactions = async () => {
    try {
      if (user.selectedCard) {
        const response = await apiService.getTransactionHistory(user.selectedCard);
        setRecentTransactions(response.data.slice(0, 3)); // Últimas 3 transacciones
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshUserCards();
      await loadRecentTransactions();
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la información');
    } finally {
      setRefreshing(false);
    }
  };

  const getCardColor = (tipo) => {
    switch (tipo) {
      case 'adulto': return '#2196F3';
      case 'estudiante': return '#4CAF50';
      case 'adulto_mayor': return '#FF9800';
      default: return '#757575';
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

  const getTarifa = (tipo) => {
    switch (tipo) {
      case 'adulto': return '2.50';
      case 'estudiante': return '1.00';
      case 'adulto_mayor': return '1.50';
      default: return '0.00';
    }
  };

  const getCurrentCard = () => {
    if (!user || !user.cards || !user.selectedCard) return null;
    return user.cards.find(card => card.uid === user.selectedCard);
  };

  const handleQuickAction = (action) => {
    const currentCard = getCurrentCard();
    if (!currentCard) {
      Alert.alert('Error', 'No hay tarjeta seleccionada');
      return;
    }

    switch (action) {
      case 'recharge':
        navigation.navigate('Recharge', { selectedCard: currentCard });
        break;
      case 'history':
        navigation.navigate('History', { selectedCard: currentCard });
        break;
      case 'cards':
        if (user.authMode === 'credentials' && user.isMultiCard) {
          navigation.navigate('Cards');
        } else {
          Alert.alert('Información', 'Modo tarjeta única - no hay más tarjetas disponibles');
        }
        break;
      default:
        break;
    }
  };

  if (loading || !user) {
    return <CenteredLoader />;
  }

  const currentCard = getCurrentCard();

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      testID="ScrollView"
    >
      {/* Banner de Modo de Autenticación */}
      {user.authMode === 'card_uid' && (
        <Banner
          visible={true}
          actions={[
            {
              label: 'Cambiar a Credenciales',
              onPress: () => {
                logout();
                navigation.replace('Login');
              },
            },
          ]}
          icon="credit-card"
          style={styles.banner}
        >
          Modo Tarjeta NFC - Acceso limitado a una sola tarjeta
        </Banner>
      )}

      <View style={styles.header}>
        <Title style={styles.welcomeText}>¡Hola, {user.nombre}!</Title>
        <IconButton
          icon="logout"
          size={24}
          onPress={logout}
          style={styles.logoutButton}
          testID="logout-btn"
        />
      </View>

      {/* Información del Usuario */}
      <Card style={styles.userCard}>
        <Card.Content>
          <View style={styles.userInfo}>
            <Title style={styles.userName}>{user.nombre}</Title>
            <Chip 
              mode="outlined" 
              style={[styles.typeChip, { borderColor: getCardColor(user.tipo_tarjeta) }]}
            >
              {getCardTypeLabel(user.tipo_tarjeta)}
            </Chip>
          </View>
          {user.email && (
            <Paragraph style={styles.userEmail}>{user.email}</Paragraph>
          )}
          {user.authMode === 'card_uid' && (
            <Paragraph style={styles.modeInfo}>
              Modo: Acceso por Tarjeta NFC
            </Paragraph>
          )}
        </Card.Content>
      </Card>

      {/* Tarjeta Actual */}
      {currentCard && (
        <Card style={styles.cardsCard}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Title style={styles.sectionTitle}>
                {user.authMode === 'credentials' ? 'Tarjeta Seleccionada' : 'Mi Tarjeta'}
              </Title>
              {user.authMode === 'credentials' && user.isMultiCard && (
                <Button
                  mode="text"
                  onPress={() => handleQuickAction('cards')}
                  style={styles.manageCardsButton}
                >
                  Gestionar Tarjetas
                </Button>
              )}
            </View>
            
            <Card style={[styles.cardItem, { borderLeftColor: getCardColor(user.tipo_tarjeta) }]}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View>
                    <Title style={styles.balanceTitle}>Saldo</Title>
                    <Title style={[styles.balance, { color: getCardColor(user.tipo_tarjeta) }]}>
                      {currentCard.saldo_actual.toFixed(2)} Bs
                    </Title>
                  </View>
                  <Chip mode="outlined" style={styles.uidChip}>
                    {currentCard.uid}
                  </Chip>
                </View>
                
                <Divider style={styles.divider} />
                
                <View style={styles.cardInfo}>
                  <Paragraph style={styles.infoText}>
                    Tarifa por viaje: {getTarifa(user.tipo_tarjeta)} Bs
                  </Paragraph>
                  <Paragraph style={styles.infoText}>
                    Viajes disponibles: {Math.floor(currentCard.saldo_actual / parseFloat(getTarifa(user.tipo_tarjeta)))}
                  </Paragraph>
                </View>
              </Card.Content>
            </Card>
          </Card.Content>
        </Card>
      )}

      {/* Acciones Rápidas */}
      <Card style={styles.actionsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Acciones Rápidas</Title>
          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              icon="credit-card-plus"
              style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
              onPress={() => handleQuickAction('recharge')}
            >
              Recargar
            </Button>
            <Button
              mode="outlined"
              icon="history"
              style={styles.actionButton}
              onPress={() => handleQuickAction('history')}
            >
              Ver Historial
            </Button>
          </View>
          {user.authMode === 'credentials' && user.isMultiCard && (
            <Button
              mode="outlined"
              icon="credit-card-multiple"
              style={[styles.actionButton, { marginTop: 10 }]}
              onPress={() => handleQuickAction('cards')}
            >
              Gestionar Todas las Tarjetas
            </Button>
          )}
        </Card.Content>
      </Card>

      {/* Transacciones Recientes */}
      <Card style={styles.transactionsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Últimas Transacciones</Title>
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction, index) => (
              <View key={index} style={styles.transactionItem}>
                <View style={styles.transactionInfo}>
                  <Paragraph style={styles.transactionDate}>
                    {new Date(transaction.fecha_hora).toLocaleDateString('es-BO')}
                  </Paragraph>
                  <Paragraph style={styles.transactionLocation}>
                    {transaction.ubicacion || 'Ubicación no disponible'}
                  </Paragraph>
                </View>
                <Paragraph style={[
                  styles.transactionAmount,
                  { color: transaction.monto < 0 ? '#F44336' : '#4CAF50' }
                ]}>
                  {transaction.monto > 0 ? '+' : ''}{transaction.monto.toFixed(2)} Bs
                </Paragraph>
              </View>
            ))
          ) : (
            <Paragraph style={styles.noTransactions}>
              No hay transacciones recientes
            </Paragraph>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  banner: {
    backgroundColor: '#fff3cd',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  welcomeText: {
    color: '#333',
  },
  logoutButton: {
    margin: 0,
  },
  userCard: {
    margin: 20,
    marginTop: 10,
    elevation: 4,
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  userName: {
    fontSize: 20,
    color: '#333',
  },
  userEmail: {
    color: '#666',
    fontSize: 14,
  },
  modeInfo: {
    color: '#2196F3',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 5,
  },
  cardsCard: {
    margin: 20,
    marginTop: 0,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
  },
  manageCardsButton: {
    margin: 0,
  },
  cardItem: {
    marginBottom: 15,
    borderLeftWidth: 6,
    elevation: 2,
  },
  uidChip: {
    marginTop: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  balanceTitle: {
    fontSize: 16,
    color: '#666',
  },
  balance: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  typeChip: {
    marginTop: 5,
  },
  divider: {
    marginVertical: 15,
  },
  cardInfo: {
    gap: 5,
  },
  infoText: {
    color: '#666',
    fontSize: 14,
  },
  actionsCard: {
    margin: 20,
    marginTop: 0,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
  },
  transactionsCard: {
    margin: 20,
    marginTop: 0,
    marginBottom: 40,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDate: {
    fontWeight: 'bold',
    color: '#333',
  },
  transactionLocation: {
    color: '#666',
    fontSize: 12,
  },
  transactionAmount: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  noTransactions: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
});

export default DashboardScreen;
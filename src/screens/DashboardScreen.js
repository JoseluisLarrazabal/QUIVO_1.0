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
import { appTheme, fonts, colors } from '../theme';

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
      style={{ flex: 1, backgroundColor: colors.background }}
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

      {/* Header */}
      <View style={styles.headerContainer}>
        <Title style={fonts.title}>¡Hola, {user.nombre}!</Title>
        <IconButton
          icon="logout"
          size={28}
          onPress={logout}
          style={styles.logoutButton}
          color={colors.accent}
          testID="logout-btn"
        />
      </View>

      {/* Información del Usuario */}
      <Card style={styles.cardMinimal}>
        <Card.Content>
          <View style={styles.userInfoRow}>
            <Title style={fonts.title}>{user.nombre}</Title>
            <Chip mode="outlined" style={[styles.chip, { borderColor: colors.primary, color: colors.primary }]}> 
              {getCardTypeLabel(user.tipo_tarjeta)}
            </Chip>
          </View>
          {user.email && (
            <Paragraph style={fonts.body}>{user.email}</Paragraph>
          )}
          {user.authMode === 'card_uid' && (
            <Paragraph style={styles.modeInfo}>Modo: Acceso por Tarjeta NFC</Paragraph>
          )}
        </Card.Content>
      </Card>

      {/* Tarjeta Actual */}
      {currentCard && (
        <Card style={styles.cardMinimal}>
          <Card.Content>
            <View style={styles.sectionHeaderRow}>
              <Title style={fonts.subtitle}>{user.authMode === 'credentials' ? 'Tarjeta Seleccionada' : 'Mi Tarjeta'}</Title>
              {user.authMode === 'credentials' && user.isMultiCard && (
                <Button
                  mode="text"
                  onPress={() => handleQuickAction('cards')}
                  style={styles.linkButton}
                  labelStyle={{ color: colors.primary, fontFamily: 'Montserrat_400Regular', fontSize: 16 }}
                >
                  Gestionar Tarjetas
                </Button>
              )}
            </View>
            <Card style={[styles.cardItem, { borderLeftColor: colors.primary }]}> 
              <Card.Content>
                <View style={styles.cardHeaderRow}>
                  <View>
                    <Title style={[fonts.title, { fontSize: 22 }]}>Saldo</Title>
                    <Title style={[fonts.title, { color: colors.primary, fontSize: 28 }]}>
                      {currentCard.saldo_actual.toFixed(2)} Bs
                    </Title>
                  </View>
                  <Chip mode="outlined" style={[styles.chip, { borderColor: colors.accent, color: colors.accent }]}> 
                    {currentCard.uid}
                  </Chip>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.cardInfoRow}>
                  <Paragraph style={fonts.body}>
                    Tarifa por viaje: {getTarifa(user.tipo_tarjeta)} Bs
                  </Paragraph>
                  <Paragraph style={fonts.body}>
                    Viajes disponibles: {Math.floor(currentCard.saldo_actual / parseFloat(getTarifa(user.tipo_tarjeta)))}
                  </Paragraph>
                </View>
              </Card.Content>
            </Card>
          </Card.Content>
        </Card>
      )}

      {/* Acciones Rápidas */}
      <Card style={styles.cardMinimal}>
        <Card.Content>
          <Title style={fonts.subtitle}>Acciones Rápidas</Title>
          <View style={styles.actionButtonsRow}>
            <Button
              mode="contained"
              icon="credit-card-plus"
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              labelStyle={{ color: colors.accent, fontFamily: 'Montserrat_400Regular', fontSize: 16 }}
              onPress={() => handleQuickAction('recharge')}
            >
              Recargar
            </Button>
            <Button
              mode="outlined"
              icon="history"
              style={styles.actionButton}
              labelStyle={{ color: colors.primary, fontFamily: 'Montserrat_400Regular', fontSize: 16 }}
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
              labelStyle={{ color: colors.primary, fontFamily: 'Montserrat_400Regular', fontSize: 16 }}
              onPress={() => handleQuickAction('cards')}
            >
              Gestionar Todas las Tarjetas
            </Button>
          )}
        </Card.Content>
      </Card>

      {/* Transacciones Recientes */}
      <Card style={styles.cardMinimal}>
        <Card.Content>
          <Title style={fonts.subtitle}>Últimas Transacciones</Title>
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction, index) => (
              <View key={index} style={styles.transactionItemRow}>
                <View style={styles.transactionInfoCol}>
                  <Paragraph style={[fonts.body, { fontWeight: 'bold' }]}> 
                    {new Date(transaction.fecha_hora).toLocaleDateString('es-BO')}
                  </Paragraph>
                  <Paragraph style={fonts.body}>
                    {transaction.ubicacion || 'Ubicación no disponible'}
                  </Paragraph>
                </View>
                <Paragraph style={[
                  fonts.body,
                  { color: transaction.monto < 0 ? '#F44336' : colors.primary, fontWeight: 'bold' }
                ]}>
                  {transaction.monto > 0 ? '+' : ''}{transaction.monto.toFixed(2)} Bs
                </Paragraph>
              </View>
            ))
          ) : (
            <Paragraph style={[fonts.body, { fontStyle: 'italic', color: '#888' }]}>No hay transacciones recientes</Paragraph>
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 12,
    elevation: 4,
  },
  logoutButton: {
    backgroundColor: 'transparent',
    margin: 0,
  },
  cardMinimal: {
    backgroundColor: colors.background,
    borderRadius: 18,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: colors.primary,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: '#F3F0FF',
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  chip: {
    borderRadius: 8,
    borderWidth: 1.5,
    paddingHorizontal: 8,
    fontFamily: 'Montserrat_400Regular',
    fontSize: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  divider: {
    marginVertical: 10,
    backgroundColor: '#EEE',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    elevation: 0,
    borderWidth: 1.5,
    borderColor: colors.primary,
    marginHorizontal: 2,
  },
  linkButton: {
    paddingHorizontal: 0,
    margin: 0,
    minWidth: 0,
  },
  transactionItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F0FF',
  },
  transactionInfoCol: {
    flex: 1,
  },
  modeInfo: {
    fontFamily: 'Chicalo-Regular',
    fontSize: 16,
    color: colors.accent,
    marginTop: 4,
  },
});

export default DashboardScreen;
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
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';

const DashboardScreen = () => {
  const { user, logout, updateUserBalance } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    loadRecentTransactions();
  }, []);

  const loadRecentTransactions = async () => {
    try {
      const response = await apiService.getTransactionHistory(user.uid);
      setRecentTransactions(response.data.slice(0, 3)); // Últimas 3 transacciones
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await apiService.getCardInfo(user.uid);
      updateUserBalance(response.data.saldo_actual);
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

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Title style={styles.welcomeText}>¡Hola, {user.nombre}!</Title>
        <IconButton
          icon="logout"
          size={24}
          onPress={logout}
          style={styles.logoutButton}
        />
      </View>

      {/* Tarjeta Principal */}
      <Card style={[styles.mainCard, { borderLeftColor: getCardColor(user.tipo_tarjeta) }]}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View>
              <Title style={styles.balanceTitle}>Saldo Actual</Title>
              <Title style={[styles.balance, { color: getCardColor(user.tipo_tarjeta) }]}>
                {user.saldo_actual.toFixed(2)} Bs
              </Title>
            </View>
            <Chip 
              mode="outlined" 
              style={[styles.typeChip, { borderColor: getCardColor(user.tipo_tarjeta) }]}
            >
              {getCardTypeLabel(user.tipo_tarjeta)}
            </Chip>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.cardInfo}>
            <Paragraph style={styles.infoText}>
              UID: {user.uid}
            </Paragraph>
            <Paragraph style={styles.infoText}>
              Tarifa por viaje: {getTarifa(user.tipo_tarjeta)} Bs
            </Paragraph>
            <Paragraph style={styles.infoText}>
              Viajes disponibles: {Math.floor(user.saldo_actual / parseFloat(getTarifa(user.tipo_tarjeta)))}
            </Paragraph>
          </View>
        </Card.Content>
      </Card>

      {/* Acciones Rápidas */}
      <Card style={styles.actionsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Acciones Rápidas</Title>
          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              icon="credit-card-plus"
              style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
              onPress={() => {/* Navegar a recarga */}}
            >
              Recargar
            </Button>
            <Button
              mode="outlined"
              icon="history"
              style={styles.actionButton}
              onPress={() => {/* Navegar a historial */}}
            >
              Ver Historial
            </Button>
          </View>
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
  mainCard: {
    margin: 20,
    marginTop: 10,
    borderLeftWidth: 6,
    elevation: 4,
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
  sectionTitle: {
    fontSize: 18,
    marginBottom: 15,
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
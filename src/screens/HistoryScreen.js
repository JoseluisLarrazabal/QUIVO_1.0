import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Chip,
  Searchbar,
  ActivityIndicator,
  Button,
  Banner,
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import CenteredLoader from '../components/CenteredLoader';

const HistoryScreen = ({ navigation, route }) => {
  const { user, loading } = useAuth();
  const [selectedCard, setSelectedCard] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loadingLocal, setLoadingLocal] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Obtener tarjeta seleccionada del contexto o de los parámetros de navegación
    const cardFromRoute = route.params?.selectedCard;
    const cardFromContext = user?.cards && user.selectedCard ? 
      user.cards.find(card => card.uid === user.selectedCard) : null;
    
    setSelectedCard(cardFromRoute || cardFromContext);
  }, [user, route.params]);

  useEffect(() => {
    if (selectedCard) {
      loadTransactions();
    }
  }, [selectedCard]);

  useEffect(() => {
    filterTransactions();
  }, [searchQuery, transactions]);

  const loadTransactions = async () => {
    if (!selectedCard) return;
    
    try {
      setLoadingLocal(true);
      const response = await apiService.getTransactionHistory(selectedCard.uid);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoadingLocal(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const filterTransactions = () => {
    if (!searchQuery) {
      setFilteredTransactions(transactions);
      return;
    }

    const filtered = transactions.filter(transaction =>
      transaction.ubicacion?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      new Date(transaction.fecha_hora).toLocaleDateString('es-BO').includes(searchQuery)
    );
    setFilteredTransactions(filtered);
  };

  const getTransactionTypeLabel = (monto) => {
    return monto > 0 ? 'Recarga' : 'Viaje';
  };

  const getTransactionTypeColor = (monto) => {
    return monto > 0 ? '#4CAF50' : '#F44336';
  };

  const renderTransaction = ({ item }) => (
    <Card style={styles.transactionCard}>
      <Card.Content>
        <View style={styles.transactionHeader}>
          <View style={styles.transactionInfo}>
            <Title style={styles.transactionTitle}>
              {item.ubicacion || 'Ubicación no disponible'}
            </Title>
            <Paragraph style={styles.transactionDate}>
              {new Date(item.fecha_hora).toLocaleString('es-BO')}
            </Paragraph>
          </View>
          <View style={styles.transactionAmount}>
            <Chip
              mode="flat"
              style={[
                styles.typeChip,
                { backgroundColor: getTransactionTypeColor(item.monto) + '20' }
              ]}
              textStyle={{ color: getTransactionTypeColor(item.monto) }}
            >
              {getTransactionTypeLabel(item.monto)}
            </Chip>
            <Title style={[
              styles.amount,
              { color: getTransactionTypeColor(item.monto) }
            ]}>
              {item.monto > 0 ? '+' : ''}{item.monto.toFixed(2)} Bs
            </Title>
          </View>
        </View>
        
        {item.resultado && (
          <Paragraph style={styles.transactionResult}>
            Estado: {item.resultado}
          </Paragraph>
        )}
      </Card.Content>
    </Card>
  );

  if (loading || !user) {
    return <CenteredLoader />;
  }

  if (!selectedCard) {
    return (
      <View style={styles.errorContainer}>
        <Paragraph style={styles.errorText}>
          No hay tarjeta seleccionada para ver el historial
        </Paragraph>
        <Button
          mode="contained"
          onPress={() => navigation.goBack()}
          style={styles.errorButton}
        >
          Volver
        </Button>
      </View>
    );
  }

  if (loadingLocal) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Paragraph style={styles.loadingText}>Cargando historial...</Paragraph>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Banner de Modo de Autenticación */}
      {user.authMode === 'card_uid' && (
        <Banner
          visible={true}
          actions={[
            {
              label: 'Cambiar a Credenciales',
              onPress: () => {
                navigation.navigate('Login');
              },
            },
          ]}
          icon="credit-card"
          style={styles.banner}
        >
          Modo Tarjeta NFC - Historial de una sola tarjeta
        </Banner>
      )}

      <View style={styles.header}>
        <Title style={styles.title}>Historial de Transacciones</Title>
        
        {/* Información de la Tarjeta */}
        <View style={styles.cardInfo}>
          <Paragraph style={styles.cardInfoLabel}>Tarjeta:</Paragraph>
          <Chip mode="outlined" style={styles.cardUidChip}>
            {selectedCard.uid}
          </Chip>
        </View>
        
        <Paragraph style={styles.selectedCardInfo}>
          Saldo actual: {selectedCard.saldo_actual.toFixed(2)} Bs
        </Paragraph>
        
        {/* Selector de Tarjeta (solo en modo credenciales con múltiples tarjetas) */}
        {user.authMode === 'credentials' && user.cards && user.cards.length > 1 && (
          <View style={styles.cardSelector}>
            <Paragraph style={styles.cardSelectorLabel}>Cambiar tarjeta:</Paragraph>
            <View style={styles.cardButtons}>
              {user.cards.map((card, index) => (
                <Button
                  key={index}
                  mode={selectedCard?.uid === card.uid ? 'contained' : 'outlined'}
                  onPress={() => setSelectedCard(card)}
                  style={styles.cardButton}
                  compact
                >
                  {card.uid}
                </Button>
              ))}
            </View>
          </View>
        )}
        
        <Searchbar
          placeholder="Buscar por ubicación o fecha..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      <FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Paragraph style={styles.emptyText}>
              No se encontraron transacciones
            </Paragraph>
          </View>
        }
      />
    </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: '#2196F3',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    elevation: 2,
  },
  title: {
    marginBottom: 15,
    color: '#333',
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardInfoLabel: {
    marginRight: 10,
    color: '#666',
    fontSize: 14,
  },
  cardUidChip: {
    backgroundColor: '#f0f0f0',
  },
  selectedCardInfo: {
    marginBottom: 15,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  cardSelector: {
    marginBottom: 15,
  },
  cardSelectorLabel: {
    marginBottom: 10,
    color: '#666',
    fontSize: 14,
  },
  cardButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  cardButton: {
    marginBottom: 5,
  },
  searchbar: {
    elevation: 0,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 20,
    paddingTop: 10,
  },
  transactionCard: {
    marginBottom: 10,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  transactionInfo: {
    flex: 1,
    marginRight: 10,
  },
  transactionTitle: {
    fontSize: 16,
    marginBottom: 5,
  },
  transactionDate: {
    color: '#666',
    fontSize: 12,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  typeChip: {
    marginBottom: 5,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  transactionResult: {
    marginTop: 10,
    color: '#666',
    fontSize: 12,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
  },
});

export default HistoryScreen;
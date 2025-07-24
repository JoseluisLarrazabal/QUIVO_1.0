import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Animated,
  Dimensions,
} from 'react-native';
import { 
  TextInput, 
  Button, 
  Card, 
  Divider, 
  SegmentedButtons, 
  ActivityIndicator, 
  Chip, 
  Banner, 
  Searchbar, 
  Text,
  IconButton,
  FAB
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import CenteredLoader from '../components/CenteredLoader';
import { colors, typography, spacing, shadows } from '../theme';

const { width: screenWidth } = Dimensions.get('window');

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
    <Card style={[styles.transactionCard, { backgroundColor: colors.backgroundAlt }]}>
      <Card.Content>
        <View style={styles.transactionHeader}>
          <View style={styles.transactionInfo}>
            <Text variant="titleMedium" style={styles.transactionTitle}>
              {item.ubicacion || 'Ubicación no disponible'}
            </Text>
            <Text style={styles.transactionDate}>
              {new Date(item.fecha_hora).toLocaleString('es-BO')}
            </Text>
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
            <Text style={[
              styles.amount,
              { color: getTransactionTypeColor(item.monto) }
            ]}>
              {item.monto > 0 ? '+' : ''}{item.monto.toFixed(2)} Bs
            </Text>
          </View>
        </View>
        
        {item.resultado && (
          <Text style={styles.transactionResult}>
            Estado: {item.resultado}
          </Text>
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
        <Text style={styles.errorText}>
          No hay tarjeta seleccionada para ver el historial
        </Text>
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
        <Text style={styles.loadingText}>Cargando historial...</Text>
      </View>
    );
  }

  // Mejoras visuales en el render principal:
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
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
          <Text style={{ color: colors.primary, fontFamily: 'Montserrat_400Regular', fontSize: 15 }}>Modo Tarjeta NFC - Historial de una sola tarjeta</Text>
        </Banner>
      )}
      <View style={styles.header}>
        <Text variant="titleLarge" style={[typography.title, styles.title]}>Historial de Transacciones</Text>
        {/* Información de la Tarjeta */}
        <View style={styles.cardInfo}>
          <Text style={typography.body}>Tarjeta:</Text>
          <Chip mode="outlined" style={[styles.chip, { borderColor: colors.primary, color: colors.primary }]}> 
            {selectedCard.uid}
          </Chip>
        </View>
        <Text style={[typography.body, styles.selectedCardInfo]}>
          Saldo actual: {selectedCard.saldo_actual.toFixed(2)} Bs
        </Text>
        {/* Selector de Tarjeta (solo en modo credenciales con múltiples tarjetas) */}
        {user.authMode === 'credentials' && user.cards && user.cards.length > 1 && (
          <View style={styles.cardSelector}>
            <Text style={typography.body}>Cambiar tarjeta:</Text>
            <View style={styles.cardButtons}>
              {user.cards.map((card, index) => (
                <Button
                  key={index}
                  mode={selectedCard?.uid === card.uid ? 'contained' : 'outlined'}
                  onPress={() => setSelectedCard(card)}
                  style={styles.cardButton}
                  compact
                  labelStyle={{ color: selectedCard?.uid === card.uid ? colors.accent : colors.primary, fontFamily: 'Montserrat_400Regular' }}
                  contentStyle={{ backgroundColor: selectedCard?.uid === card.uid ? colors.primary : colors.background, borderRadius: 10 }}
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
          style={[styles.searchbar, { backgroundColor: colors.backgroundInput, borderColor: colors.primary, borderWidth: 1, borderRadius: 12 }]}
          inputStyle={{ fontFamily: 'Montserrat_400Regular', color: colors.text }}
          iconColor={colors.primary}
        />
      </View>
      <FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ ...styles.listContainer, backgroundColor: colors.background }}
        testID="flat-list"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[typography.body, styles.emptyText]}>
              No se encontraron transacciones
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#fff3cd',
  },
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
    marginBottom: 8,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  chip: {
    borderRadius: 8,
    borderWidth: 1.5,
    paddingHorizontal: 8,
    fontFamily: 'Montserrat_400Regular',
    fontSize: 14,
    marginLeft: 8,
  },
  selectedCardInfo: {
    marginBottom: 15,
    color: colors.accent,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cardSelector: {
    marginBottom: 15,
    alignItems: 'center',
  },
  cardButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  cardButton: {
    marginBottom: 5,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.primary,
    elevation: 0,
    marginHorizontal: 2,
  },
  searchbar: {
    elevation: 0,
    marginTop: 8,
    marginBottom: 0,
  },
  listContainer: {
    padding: 20,
    paddingTop: 10,
  },
  transactionCard: {
    marginBottom: 10,
    elevation: 2,
    borderRadius: 14,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: '#F3F0FF',
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
    fontFamily: 'Montserrat_400Regular',
    color: colors.primary,
  },
  transactionDate: {
    color: colors.text,
    fontSize: 12,
    fontFamily: 'Montserrat_400Regular',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  typeChip: {
    marginBottom: 5,
    fontFamily: 'Montserrat_400Regular',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Montserrat_400Regular',
  },
  transactionResult: {
    marginTop: 10,
    color: colors.primary,
    fontSize: 12,
    fontStyle: 'italic',
    fontFamily: 'Montserrat_400Regular',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: colors.text,
    fontFamily: 'Montserrat_400Regular',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    color: colors.accent,
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular',
  },
});

export default HistoryScreen;
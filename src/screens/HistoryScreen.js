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
  const [filterType, setFilterType] = useState('all');
  const [transactionAnimations] = useState(() => new Map());

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
  }, [searchQuery, transactions, filterType]);

  const loadTransactions = async () => {
    if (!selectedCard) return;
    
    try {
      setLoadingLocal(true);
      const response = await apiService.getTransactionHistory(selectedCard.uid);
      setTransactions(response.data);

      // Configurar animaciones para nuevas transacciones
      response.data.forEach((transaction, index) => {
        if (!transactionAnimations.has(transaction.id)) {
          transactionAnimations.set(transaction.id, new Animated.Value(0));
        }
      });

      // Animar entrada de transacciones
      const animations = response.data.slice(0, 10).map((transaction, index) => {
        const anim = transactionAnimations.get(transaction.id);
        return Animated.timing(anim, {
          toValue: 1,
          duration: 300,
          delay: index * 50,
          useNativeDriver: true,
        });
      });
      
      Animated.stagger(50, animations).start();

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
    let filtered = transactions;

    // Filtrar por texto de búsqueda
    if (searchQuery) {
      filtered = filtered.filter(transaction =>
        transaction.ubicacion?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        new Date(transaction.fecha_hora).toLocaleDateString('es-BO').includes(searchQuery)
      );
    }

    // Filtrar por tipo
    if (filterType === 'recharge') {
      filtered = filtered.filter(transaction => transaction.monto > 0);
    } else if (filterType === 'trip') {
      filtered = filtered.filter(transaction => transaction.monto < 0);
    }

    setFilteredTransactions(filtered);
  };

  const getTransactionTypeLabel = (monto) => {
    return monto > 0 ? 'Recarga' : 'Viaje';
  };

  const getTransactionTypeColor = (monto) => {
    return monto > 0 ? colors.success[500] : colors.error[500];
  };

  const getTransactionIcon = (monto) => {
    return monto > 0 ? 'credit-card-plus' : 'bus';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Hoy ${date.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Ayer ${date.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('es-BO', { 
        day: '2-digit', 
        month: 'short', 
        hour: '2-digit', 
        minute: '2-digit'
      });
    }
  };

  const renderStatsCard = () => {
    const totalRecharges = transactions.filter(t => t.monto > 0).reduce((sum, t) => sum + t.monto, 0);
    const totalTrips = transactions.filter(t => t.monto < 0).length;
    const totalSpent = Math.abs(transactions.filter(t => t.monto < 0).reduce((sum, t) => sum + t.monto, 0));

    return (
      <View style={styles.statsContainer}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.statsGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <BlurView intensity={20} style={styles.statsBlur}>
            <View style={styles.statsContent}>
              <View style={styles.statItem}>
                <View style={styles.statIcon}>
                  <Text style={styles.statEmoji}>💰</Text>
                </View>
                <Text style={styles.statValue}>{totalRecharges.toFixed(2)} Bs</Text>
                <Text style={styles.statLabel}>Total Recargas</Text>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <View style={styles.statIcon}>
                  <Text style={styles.statEmoji}>🚌</Text>
                </View>
                <Text style={styles.statValue}>{totalTrips}</Text>
                <Text style={styles.statLabel}>Viajes Realizados</Text>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <View style={styles.statIcon}>
                  <Text style={styles.statEmoji}>💸</Text>
                </View>
                <Text style={styles.statValue}>{totalSpent.toFixed(2)} Bs</Text>
                <Text style={styles.statLabel}>Total Gastado</Text>
              </View>
            </View>
          </BlurView>
        </LinearGradient>
      </View>
    );
  };

  const renderTransaction = ({ item, index }) => {
    const animation = transactionAnimations.get(item.id) || new Animated.Value(1);
    const animatedStyle = {
      opacity: animation,
      transform: [{
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [30, 0],
        })
      }]
    };

    const isRecharge = item.monto > 0;

    return (
      <Animated.View style={[styles.transactionItemContainer, animatedStyle]}>
        <Card style={[styles.transactionCard, isRecharge && styles.rechargeCard]}>
          <LinearGradient
            colors={isRecharge 
              ? [colors.success[500] + '10', colors.success[500] + '05'] 
              : [colors.error[500] + '10', colors.error[500] + '05']
            }
            style={styles.transactionGradient}
          >
            <Card.Content style={styles.transactionContent}>
              <View style={styles.transactionHeader}>
                <View style={styles.transactionIconContainer}>
                  <View style={[
                    styles.transactionIcon, 
                    { backgroundColor: getTransactionTypeColor(item.monto) + '20' }
                  ]}>
                    <IconButton 
                      icon={getTransactionIcon(item.monto)}
                      iconColor={getTransactionTypeColor(item.monto)}
                      size={20}
                      style={{ margin: 0 }}
                    />
                  </View>
                </View>
                
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionTitle}>
                    {item.ubicacion || 'Ubicación no disponible'}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {formatDate(item.fecha_hora)}
                  </Text>
                  {item.resultado && (
                    <Chip 
                      mode="flat" 
                      style={styles.statusChip}
                      textStyle={styles.statusChipText}
                      compact
                    >
                      {item.resultado}
                    </Chip>
                  )}
                </View>
                
                <View style={styles.transactionAmount}>
                  <Text style={[
                    styles.amount,
                    { color: getTransactionTypeColor(item.monto) }
                  ]}>
                    {item.monto > 0 ? '+' : ''}{item.monto.toFixed(2)} Bs
                  </Text>
                  <Chip
                    mode="flat"
                    style={[
                      styles.typeChip,
                      { backgroundColor: getTransactionTypeColor(item.monto) + '15' }
                    ]}
                    textStyle={{ 
                      color: getTransactionTypeColor(item.monto),
                      fontSize: 10,
                      fontWeight: '600'
                    }}
                    compact
                  >
                    {getTransactionTypeLabel(item.monto)}
                  </Chip>
                </View>
              </View>
            </Card.Content>
          </LinearGradient>
        </Card>
      </Animated.View>
    );
  };

  if (loading || !user) {
    return <CenteredLoader />;
  }

  if (!selectedCard) {
    return (
      <View style={styles.errorContainer}>
        <LinearGradient
          colors={[colors.error[500] + '20', colors.error[500] + '10']}
          style={styles.errorGradient}
        >
          <View style={styles.errorContent}>
            <View style={styles.errorIcon}>
              <Text style={styles.errorEmoji}>⚠️</Text>
            </View>
            <Text style={styles.errorTitle}>Sin Tarjeta Seleccionada</Text>
            <Text style={styles.errorText}>
              No hay tarjeta seleccionada para ver el historial
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.goBack()}
              style={styles.errorButton}
              labelStyle={styles.errorButtonText}
            >
              Volver
            </Button>
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (loadingLocal) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={[colors.primary[500] + '20', colors.primary[500] + '10']}
          style={styles.loadingGradient}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando historial...</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header con gradiente */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>Historial de Transacciones</Text>
        
        {/* Información de la Tarjeta */}
        <View style={styles.cardInfoContainer}>
          <View style={styles.cardInfo}>
            <Text style={styles.cardLabel}>Tarjeta:</Text>
            <Chip 
              mode="flat" 
              style={styles.cardChip}
              textStyle={styles.cardChipText}
            >
              {selectedCard.uid}
            </Chip>
          </View>
          <Text style={styles.balanceInfo}>
            Saldo: {selectedCard.saldo_actual.toFixed(2)} Bs
          </Text>
        </View>

        {/* Selector de Tarjeta */}
        {user.authMode === 'credentials' && user.cards && user.cards.length > 1 && (
          <View style={styles.cardSelector}>
            <Text style={styles.selectorLabel}>Cambiar tarjeta:</Text>
            <View style={styles.cardButtons}>
              {user.cards.map((card, index) => (
                <Button
                  key={index}
                  mode={selectedCard?.uid === card.uid ? 'contained' : 'outlined'}
                  onPress={() => setSelectedCard(card)}
                  style={[
                    styles.cardButton,
                    selectedCard?.uid === card.uid && styles.selectedCardButton
                  ]}
                  labelStyle={[
                    styles.cardButtonText,
                    selectedCard?.uid === card.uid && styles.selectedCardButtonText
                  ]}
                  compact
                >
                  {card.uid}
                </Button>
              ))}
            </View>
          </View>
        )}

        {/* Barra de búsqueda */}
        <Searchbar
          placeholder="Buscar por ubicación o fecha..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={styles.searchbarInput}
          iconColor={colors.primary}
          placeholderTextColor={colors.textSecondary}
        />
      </LinearGradient>

      {/* Banner de modo NFC */}
      {user.authMode === 'card_uid' && (
        <Banner
          visible={true}
          actions={[
            {
              label: 'Cambiar Modo',
              onPress: () => navigation.navigate('Login'),
            },
          ]}
          icon="nfc"
          style={styles.banner}
        >
          <Text style={styles.bannerText}>
            Modo Tarjeta NFC - Historial de una sola tarjeta
          </Text>
        </Banner>
      )}

      {/* Filtros de tipo */}
      <View style={styles.filtersContainer}>
        <SegmentedButtons
          value={filterType}
          onValueChange={setFilterType}
          buttons={[
            { value: 'all', label: 'Todas', icon: 'view-list' },
            { value: 'recharge', label: 'Recargas', icon: 'credit-card-plus' },
            { value: 'trip', label: 'Viajes', icon: 'bus' },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      {/* Estadísticas */}
      {transactions.length > 0 && renderStatsCard()}

      {/* Lista de transacciones */}
      <FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
              <Text style={styles.emptyStateEmoji}>📊</Text>
            </View>
            <Text style={styles.emptyStateTitle}>Sin Transacciones</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery || filterType !== 'all' 
                ? 'No se encontraron transacciones con los filtros aplicados'
                : 'No hay transacciones registradas para esta tarjeta'
              }
            </Text>
            {(searchQuery || filterType !== 'all') && (
              <Button
                mode="outlined"
                onPress={() => {
                  setSearchQuery('');
                  setFilterType('all');
                }}
                style={styles.clearFiltersButton}
                labelStyle={styles.clearFiltersButtonText}
              >
                Limpiar Filtros
              </Button>
            )}
          </View>
        }
      />

      {/* FAB para nueva recarga */}
      <FAB
        icon="credit-card-plus"
        style={styles.fab}
        onPress={() => navigation.navigate('Recharge', { selectedCard })}
        label="Recargar"
        mode="elevated"
        variant="primary"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },

  // Header
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...shadows.large,
  },
  headerTitle: {
    ...typography.headlineMedium,
    color: colors.white,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },

  // Card info
  cardInfoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardLabel: {
    ...typography.bodyMedium,
    color: colors.white,
    marginRight: 8,
  },
  cardChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardChipText: {
    color: colors.white,
    fontWeight: '600',
  },
  balanceInfo: {
    ...typography.titleMedium,
    color: colors.accent,
    fontWeight: '600',
  },

  // Card selector
  cardSelector: {
    alignItems: 'center',
    marginBottom: 20,
  },
  selectorLabel: {
    ...typography.bodyMedium,
    color: colors.white,
    marginBottom: 8,
  },
  cardButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  cardButton: {
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 12,
  },
  selectedCardButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardButtonText: {
    color: colors.white,
    fontSize: 12,
  },
  selectedCardButtonText: {
    color: colors.white,
    fontWeight: '600',
  },

  // Searchbar
  searchbar: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    elevation: 0,
  },
  searchbarInput: {
    ...typography.bodyMedium,
    color: colors.text,
  },

  // Banner
  banner: {
    backgroundColor: colors.warning[500] + '20',
    borderRadius: 0,
  },
  bannerText: {
    ...typography.bodyMedium,
    color: colors.primary,
    fontWeight: '500',
  },

  // Filters
  filtersContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  segmentedButtons: {
    backgroundColor: colors.surface,
    borderRadius: 12,
  },

  // Stats
  statsContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    ...shadows.medium,
  },
  statsGradient: {
    borderRadius: 20,
  },
  statsBlur: {
    padding: 20,
    borderRadius: 20,
  },
  statsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statEmoji: {
    fontSize: 20,
  },
  statValue: {
    ...typography.titleMedium,
    color: colors.white,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    ...typography.bodySmall,
    color: colors.white,
    opacity: 0.8,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 16,
  },

  // Transactions list
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  transactionItemContainer: {
    marginBottom: 12,
  },
  transactionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.small,
  },
  rechargeCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  transactionGradient: {
    borderRadius: 16,
  },
  transactionContent: {
    padding: 16,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  transactionIconContainer: {
    marginRight: 12,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionInfo: {
    flex: 1,
    marginRight: 12,
  },
  transactionTitle: {
    ...typography.titleMedium,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionDate: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  statusChip: {
    backgroundColor: colors.info[500] + '20',
    alignSelf: 'flex-start',
  },
  statusChipText: {
    color: colors.info,
    fontSize: 10,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    ...typography.titleLarge,
    fontWeight: '700',
    marginBottom: 4,
  },
  typeChip: {
    borderRadius: 8,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyStateEmoji: {
    fontSize: 40,
  },
  emptyStateTitle: {
    ...typography.titleLarge,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  clearFiltersButton: {
    borderColor: colors.primary,
    borderRadius: 12,
  },
  clearFiltersButtonText: {
    color: colors.primary,
  },

  // Error state
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorGradient: {
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    width: '100%',
  },
  errorContent: {
    alignItems: 'center',
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.error[500] + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  errorEmoji: {
    fontSize: 40,
  },
  errorTitle: {
    ...typography.titleLarge,
    color: colors.error,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  errorButton: {
    backgroundColor: colors.error,
    borderRadius: 12,
  },
  errorButtonText: {
    color: colors.white,
  },

  // Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingGradient: {
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    ...typography.bodyMedium,
    color: colors.primary,
    marginTop: 16,
    fontWeight: '500',
  },

  // FAB
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
    borderRadius: 20,
    ...shadows.large,
  },
});

export default HistoryScreen;
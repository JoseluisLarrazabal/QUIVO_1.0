import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Dimensions,
  StatusBar,
  Platform,
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
  Text,
  FAB,
  Surface,
  Avatar,
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import CenteredLoader from '../components/CenteredLoader';
import { colors, typography, spacing, shadows, borderRadius } from '../theme';

const { width } = Dimensions.get('window');

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

  const getCardTypeConfig = (tipo) => {
    const configs = {
      adulto: {
        color: colors.info[500],
        backgroundColor: colors.info[50],
        label: 'Adulto',
        tarifa: '2.50',
        icon: 'account',
      },
      estudiante: {
        color: colors.success[500],
        backgroundColor: colors.success[50],
        label: 'Estudiante',
        tarifa: '1.00',
        icon: 'school',
      },
      adulto_mayor: {
        color: colors.warning[500],
        backgroundColor: colors.warning[50],
        label: 'Adulto Mayor',
        tarifa: '1.50',
        icon: 'account-supervisor',
      },
    };
    return configs[tipo] || {
      color: colors.textSecondary,
      backgroundColor: colors.surfaceVariant,
      label: 'Desconocido',
      tarifa: '0.00',
      icon: 'help-circle',
    };
  };

  const getCurrentCard = () => {
    if (!user || !user.cards || !user.selectedCard) return null;
    return user.cards.find(card => card.uid === user.selectedCard);
  };

  const handleQuickAction = (action) => {
    const currentCard = getCurrentCard();
    // eslint-disable-next-line no-console
    console.log('[handleQuickAction]', { action, currentCard, navigation });
    if (!currentCard) {
      Alert.alert('Error', 'No hay tarjeta seleccionada');
      return;
    }

    switch (action) {
      case 'recharge':
        // eslint-disable-next-line no-console
        console.log('Llamando navigation.navigate: Recharge');
        navigation.navigate('Recharge', { selectedCard: currentCard });
        break;
      case 'history':
        // eslint-disable-next-line no-console
        console.log('Llamando navigation.navigate: History');
        navigation.navigate('History', { selectedCard: currentCard });
        break;
      case 'cards':
        if (user.authMode === 'credentials' && user.isMultiCard) {
          // eslint-disable-next-line no-console
          console.log('Llamando navigation.navigate: Cards');
          navigation.navigate('Cards');
        } else {
          Alert.alert('Información', 'Modo tarjeta única - no hay más tarjetas disponibles');
        }
        break;
      default:
        break;
    }
  };

  const getTransactionIcon = (monto) => {
    return monto > 0 ? 'plus-circle' : 'minus-circle';
  };

  const getTransactionColor = (monto) => {
    return monto > 0 ? colors.success[500] : colors.error[500];
  };

  if (loading || !user) {
    return <CenteredLoader />;
  }

  const currentCard = getCurrentCard();
  const cardConfig = getCardTypeConfig(user.tipo_tarjeta);
  const availableTrips = currentCard ? Math.floor(currentCard.saldo_actual / parseFloat(cardConfig.tarifa)) : 0;

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={colors.primary}
        translucent={false}
      />
      
      {/* Banner de Modo de Autenticación */}
      {user.authMode === 'card_uid' && (
        <Banner
          visible={true}
          actions={[
            {
              label: 'Cambiar Modo',
              onPress: () => {
                logout();
                navigation.replace('Login');
              },
            },
          ]}
          icon="contactless-payment"
          style={styles.banner}
          contentStyle={styles.bannerContent}
        >
          <Text variant="bodyMedium" style={styles.bannerText}>
            Modo Tarjeta NFC - Acceso limitado a una sola tarjeta
          </Text>
        </Banner>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        testID="ScrollView"
      >
        {/* Header con Información del Usuario */}
        <Surface style={styles.headerSurface} elevation={0}>
          <View style={styles.headerContent}>
            <View style={styles.userSection}>
              <Avatar.Icon 
                size={60} 
                icon={cardConfig.icon}
                style={[styles.avatar, { backgroundColor: cardConfig.backgroundColor }]}
                color={cardConfig.color}
              />
              <View style={styles.userInfo}>
                <Text variant="headlineSmall" style={styles.welcomeText}>
                  ¡Hola, {user.nombre}!
                </Text>
                <View style={styles.userDetails}>
                  {user.email && (
                    <Text variant="bodyMedium" style={styles.emailText}>
                      {user.email}
                    </Text>
                  )}
                  <Chip 
                    mode="flat"
                    icon={cardConfig.icon}
                    style={[styles.userTypeChip, { backgroundColor: cardConfig.backgroundColor }]}
                    textStyle={[styles.chipText, { color: cardConfig.color }]}
                  >
                    {cardConfig.label}
                  </Chip>
                </View>
              </View>
            </View>
            <IconButton
              icon="logout"
              size={28}
              onPress={logout}
              style={styles.logoutButton}
              iconColor={colors.backgroundAlt}
              testID="logout-btn"
            />
          </View>
        </Surface>

        {/* Balance Card - Destacada */}
        {currentCard && (
          <Card style={styles.balanceCard}>
            <Card.Content style={styles.balanceCardContent}>
              <View style={styles.balanceHeader}>
                <View style={styles.balanceInfo}>
                  <Text variant="titleMedium" style={styles.balanceLabel}>
                    Saldo Actual
                  </Text>
                  <Text variant="displaySmall" style={styles.balanceAmount}>
                    {currentCard.saldo_actual.toFixed(2)} Bs
                  </Text>
                  <View style={styles.cardMetrics}>
                    <View style={styles.metric}>
                      <Text variant="labelSmall" style={styles.metricLabel}>
                        Tarifa por viaje
                      </Text>
                      <Text variant="titleSmall" style={styles.metricValue}>
                        {cardConfig.tarifa} Bs
                      </Text>
                    </View>
                    <View style={styles.metricDivider} />
                    <View style={styles.metric}>
                      <Text variant="labelSmall" style={styles.metricLabel}>
                        Viajes disponibles
                      </Text>
                      <Text variant="titleSmall" style={styles.metricValue}>
                        {availableTrips}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.cardVisual}>
                  <Surface style={styles.cardPreview} elevation={4}>
                    <View style={styles.cardPreviewContent}>
                      <Text variant="labelSmall" style={styles.cardUidLabel}>
                        UID
                      </Text>
                      <Text variant="titleSmall" style={styles.cardUid}>
                        {currentCard.uid}
                      </Text>
                      <View style={styles.cardTypeIndicator}>
                        <IconButton
                          icon={cardConfig.icon}
                          size={20}
                          iconColor={cardConfig.color}
                          style={{ margin: 0 }}
                        />
                      </View>
                    </View>
                  </Surface>
                </View>
              </View>
              
              {/* Indicador de bajo saldo */}
              {availableTrips < 3 && (
                <Surface style={styles.warningBanner} elevation={0}>
                  <IconButton
                    icon="alert-circle"
                    size={20}
                    iconColor={colors.warning}
                    style={{ margin: 0, marginRight: 8 }}
                  />
                  <Text variant="bodySmall" style={styles.warningText}>
                    Saldo bajo - Te quedan {availableTrips} viaje{availableTrips !== 1 ? 's' : ''}
                  </Text>
                </Surface>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Acciones Rápidas */}
        <View style={styles.quickActionsSection}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Acciones Rápidas
          </Text>
          <View style={styles.quickActionsGrid}>
            <Surface style={styles.quickActionCard} elevation={2}>
              <IconButton
                icon="credit-card-plus"
                size={32}
                iconColor={colors.primary}
                style={styles.quickActionIcon}
                onPress={() => handleQuickAction('recharge')}
                testID="quick-action-recharge"
              />
              <Text variant="titleSmall" style={styles.quickActionTitle}>
                Recargar
              </Text>
              <Text variant="bodySmall" style={styles.quickActionSubtitle}>
                Añadir saldo a tu tarjeta
              </Text>
            </Surface>

            <Surface style={styles.quickActionCard} elevation={2}>
              <IconButton
                icon="history"
                size={32}
                iconColor={colors.primary}
                style={styles.quickActionIcon}
                onPress={() => handleQuickAction('history')}
                testID="quick-action-history"
              />
              <Text variant="titleSmall" style={styles.quickActionTitle}>
                Historial
              </Text>
              <Text variant="bodySmall" style={styles.quickActionSubtitle}>
                Ver transacciones
              </Text>
            </Surface>

            {user.authMode === 'credentials' && user.isMultiCard && (
              <Surface style={styles.quickActionCard} elevation={2}>
                <IconButton
                  icon="credit-card-multiple"
                  size={32}
                  iconColor={colors.primary}
                  style={styles.quickActionIcon}
                  onPress={() => handleQuickAction('cards')}
                  testID="quick-action-cards"
                />
                <Text variant="titleSmall" style={styles.quickActionTitle}>
                  Tarjetas
                </Text>
                <Text variant="bodySmall" style={styles.quickActionSubtitle}>
                  Gestionar todas
                </Text>
              </Surface>
            )}
          </View>
        </View>

        {/* Transacciones Recientes */}
        <Card style={styles.transactionsCard}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Últimas Transacciones
              </Text>
              <Button
                mode="text"
                compact
                onPress={() => handleQuickAction('history')}
                labelStyle={styles.seeAllLabel}
              >
                Ver todas
              </Button>
            </View>
            
            {recentTransactions.length > 0 ? (
              <View style={styles.transactionsList}>
                {recentTransactions.map((transaction, index) => (
                  <Surface key={index} style={styles.transactionItem} elevation={1}>
                    <View style={styles.transactionIcon}>
                      <IconButton
                        icon={getTransactionIcon(transaction.monto)}
                        size={24}
                        iconColor={getTransactionColor(transaction.monto)}
                        style={{ margin: 0 }}
                      />
                    </View>
                    <View style={styles.transactionDetails}>
                      <Text variant="titleSmall" style={styles.transactionDate}>
                        {new Date(transaction.fecha_hora).toLocaleDateString('es-BO', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </Text>
                      <Text variant="bodySmall" style={styles.transactionLocation}>
                        {transaction.ubicacion || 'Ubicación no disponible'}
                      </Text>
                      <Text variant="labelSmall" style={styles.transactionTime}>
                        {new Date(transaction.fecha_hora).toLocaleTimeString('es-BO', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                    </View>
                    <View style={styles.transactionAmount}>
                      <Text 
                        variant="titleMedium" 
                        style={[
                          styles.amountText,
                          { color: getTransactionColor(transaction.monto) }
                        ]}
                      >
                        {transaction.monto > 0 ? '+' : ''}{transaction.monto.toFixed(2)}
                      </Text>
                      <Text variant="labelSmall" style={styles.currencyText}>
                        Bs
                      </Text>
                    </View>
                  </Surface>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <IconButton
                  icon="history"
                  size={40}
                  iconColor={colors.textSecondary}
                  style={{ margin: 0, marginBottom: 8 }}
                />
                <Text variant="bodyMedium" style={styles.emptyStateText}>
                  No hay transacciones recientes
                </Text>
                <Text variant="bodySmall" style={styles.emptyStateSubtext}>
                  Tus movimientos aparecerán aquí
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Gestión de Tarjetas (solo si es multi-tarjeta) */}
        {user.authMode === 'credentials' && user.isMultiCard && (
          <Card style={styles.cardsManagementCard}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Gestión de Tarjetas
                </Text>
                <Chip 
                  mode="flat"
                  style={styles.cardCountChip}
                  textStyle={styles.cardCountText}
                >
                  {user.cards?.length || 0} tarjeta{(user.cards?.length || 0) !== 1 ? 's' : ''}
                </Chip>
              </View>
              <Text variant="bodyMedium" style={styles.cardsDescription}>
                Tienes acceso a múltiples tarjetas. Gestiona tus tarjetas, cambia entre ellas y revisa sus saldos.
              </Text>
              <Button
                mode="contained"
                icon="credit-card-multiple"
                style={styles.manageCardsButton}
                labelStyle={styles.manageCardsLabel}
                onPress={() => handleQuickAction('cards')}
              >
                Gestionar Todas las Tarjetas
              </Button>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* FAB para recarga rápida */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => handleQuickAction('recharge')}
        color={colors.backgroundAlt}
        customSize={56}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceVariant,
  },
  banner: {
    backgroundColor: colors.warningLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.warning + '20',
  },
  bannerContent: {
    paddingVertical: 8,
  },
  bannerText: {
    color: colors.warning,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  headerSurface: {
    backgroundColor: colors.primary,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    ...shadows.medium,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    marginRight: spacing.md,
    borderWidth: 3,
    borderColor: colors.backgroundAlt + '20',
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    ...typography.headlineSmall,
    color: colors.backgroundAlt,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  emailText: {
    color: colors.backgroundAlt + 'CC',
    fontSize: 14,
  },
  userTypeChip: {
    height: 24,
    borderRadius: 12,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: colors.backgroundAlt + '15',
    borderRadius: borderRadius.full,
  },
  balanceCard: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: borderRadius.xl,
    marginHorizontal: spacing.md,
    marginTop: -spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.large,
    borderWidth: 1,
    borderColor: colors.primary + '10',
  },
  balanceCardContent: {
    padding: spacing.lg,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  balanceInfo: {
    flex: 1,
  },
  balanceLabel: {
    color: colors.textSecondary,
    marginBottom: 4,
  },
  balanceAmount: {
    ...typography.displaySmall,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  cardMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  metric: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  metricLabel: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  metricValue: {
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  cardVisual: {
    alignItems: 'center',
  },
  cardPreview: {
    width: 80,
    height: 50,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    padding: spacing.xs,
    justifyContent: 'space-between',
  },
  cardPreviewContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardUidLabel: {
    color: colors.backgroundAlt + '80',
    fontSize: 8,
  },
  cardUid: {
    color: colors.backgroundAlt,
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardTypeIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: colors.backgroundAlt,
    borderRadius: borderRadius.full,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  warningBanner: {
    backgroundColor: colors.warningLight,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningText: {
    color: colors.warning,
    flex: 1,
    fontWeight: '500',
  },
  quickActionsSection: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  quickActionIcon: {
    backgroundColor: colors.primary + '15',
    margin: 0,
    marginBottom: spacing.xs,
  },
  quickActionTitle: {
    color: colors.text,
    fontWeight: '600',
    marginBottom: 2,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontFamily: 'Chicalo-Regular',
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: 11,
  },
  transactionsCard: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: borderRadius.xl,
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.medium,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  seeAllLabel: {
    color: colors.primary,
    fontSize: 14,
  },
  transactionsList: {
    gap: spacing.sm,
  },
  transactionItem: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIcon: {
    marginRight: spacing.sm,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDate: {
    color: colors.text,
    fontWeight: '600',
    marginBottom: 2,
  },
  transactionLocation: {
    color: colors.textSecondary,
    marginBottom: 2,
  },
  transactionTime: {
    color: colors.textSecondary,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontWeight: 'bold',
  },
  currencyText: {
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyStateText: {
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    color: colors.textSecondary,
  },
  cardsManagementCard: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: borderRadius.xl,
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.medium,
  },
  cardCountChip: {
    backgroundColor: colors.primary + '15',
    height: 28,
  },
  cardCountText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  cardsDescription: {
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  manageCardsButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
  },
  manageCardsLabel: {
    color: colors.backgroundAlt,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    margin: spacing.md,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    ...shadows.large,
  },
});

export default DashboardScreen;
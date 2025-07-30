import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  Divider,
  IconButton,
  FAB,
  Modal,
  Portal,
  TextInput,
  ActivityIndicator,
  Text,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import CenteredLoader from '../components/CenteredLoader';
import { colors, typography, spacing, shadows } from '../theme';

const { width: screenWidth } = Dimensions.get('window');

const CardsScreen = ({ navigation }) => {
  const { user, refreshUserCards, selectCard, loading } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [editingAlias, setEditingAlias] = useState('');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [cardAnimations] = useState(() => 
    user?.cards?.map(() => new Animated.Value(0)) || []
  );

  useEffect(() => {
    if (user && user.authMode === 'card_uid') {
      navigation.replace('Dashboard');
    }
  }, [user, navigation]);

  useEffect(() => {
    // Animar entrada de tarjetas
    if (user?.cards?.length > 0) {
      const animations = cardAnimations.slice(0, user.cards.length).map((anim, index) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 300,
          delay: index * 100,
          useNativeDriver: true,
        })
      );
      Animated.stagger(100, animations).start();
    }
  }, [user?.cards, cardAnimations]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshUserCards();
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la información');
    } finally {
      setRefreshing(false);
    }
  };

  const handleCardSelect = async (cardUid) => {
    try {
      await selectCard(cardUid);
      Alert.alert(
        'Tarjeta Seleccionada',
        'La tarjeta ha sido seleccionada como activa',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar la tarjeta');
    }
  };

  const handleEditAlias = (card) => {
    setEditingCard(card);
    setEditingAlias(card.alias || '');
  };

  const handleSaveAlias = async () => {
    if (!editingCard || !editingAlias.trim()) {
      Alert.alert('Error', 'El alias no puede estar vacío');
      return;
    }

    if (editingAlias.trim().length > 50) {
      Alert.alert('Error', 'El alias no puede tener más de 50 caracteres');
      return;
    }

    setActionLoading(true);
    try {
      const response = await apiService.updateCardAlias(editingCard.uid, editingAlias.trim());
      
      if (response.success) {
        await refreshUserCards();
        Alert.alert('Éxito', 'Alias actualizado correctamente');
        setEditingCard(null);
        setEditingAlias('');
      } else {
        Alert.alert('Error', response.error || 'No se pudo actualizar el alias');
      }
    } catch (error) {
      console.error('Error updating alias:', error);
      Alert.alert('Error', 'No se pudo conectar con el servidor');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCard = (card) => {
    setCardToDelete(card);
    setDeleteModalVisible(true);
  };

  const confirmDeleteCard = async () => {
    if (!cardToDelete) return;

    setActionLoading(true);
    try {
      const response = await apiService.deleteCard(cardToDelete.uid);
      
      if (response.success) {
        await refreshUserCards();
        Alert.alert('Éxito', 'Tarjeta eliminada correctamente');
        setDeleteModalVisible(false);
        setCardToDelete(null);
      } else {
        Alert.alert('Error', response.error || 'No se pudo eliminar la tarjeta');
      }
    } catch (error) {
      console.error('Error deleting card:', error);
      Alert.alert('Error', 'No se pudo conectar con el servidor');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCardAction = (action, card) => {
    switch (action) {
      case 'recharge':
        navigation.navigate('Recharge', { selectedCard: card });
        break;
      case 'history':
        navigation.navigate('History', { selectedCard: card });
        break;
      case 'edit':
        handleEditAlias(card);
        break;
      case 'delete':
        handleDeleteCard(card);
        break;
      default:
        break;
    }
  };

  const getCardGradient = (tipo, isActive = false) => {
    const gradients = {
      adulto: isActive ? ['#667eea', '#764ba2'] : ['#2196F3', '#21CBF3'],
      estudiante: isActive ? ['#11998e', '#38ef7d'] : ['#4CAF50', '#8BC34A'],
      adulto_mayor: isActive ? ['#ff9a9e', '#fecfef'] : ['#FF9800', '#FFC107'],
    };
    return gradients[tipo] || ['#757575', '#9E9E9E'];
  };

  const getCardTypeLabel = (tipo) => {
    const labels = {
      adulto: 'Adulto',
      estudiante: 'Estudiante',
      adulto_mayor: 'Adulto Mayor',
    };
    return labels[tipo] || 'Desconocido';
  };

  const getTarifa = (tipo) => {
    const tarifas = {
      adulto: '2.50',
      estudiante: '1.00',
      adulto_mayor: '1.50',
    };
    return tarifas[tipo] || '0.00';
  };

  const renderActiveCard = () => {
    if (!user.selectedCard || !user.cards) return null;

    const activeCard = user.cards.find(card => card.uid === user.selectedCard);
    if (!activeCard) return null;

    return (
      <View style={styles.activeCardContainer}>
        <LinearGradient
          colors={getCardGradient(user.tipo_tarjeta, true)}
          style={styles.activeCardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <BlurView intensity={20} style={styles.activeCardBlur}>
            <View style={styles.activeCardHeader}>
              <View style={styles.activeCardHeaderLeft}>
                <Text style={styles.activeCardTitle}>Mi Tarjeta Activa</Text>
                <Chip 
                  mode="flat" 
                  style={styles.activeChip}
                  textStyle={styles.activeChipText}
                >
                  ✨ Activa
                </Chip>
              </View>
              <View style={styles.cardTypeContainer}>
                <Text style={styles.cardTypeText}>
                  {getCardTypeLabel(user.tipo_tarjeta)}
                </Text>
              </View>
            </View>
            
            <View style={styles.activeCardContent}>
              <View style={styles.cardNumberContainer}>
                <Text style={styles.cardNumber}>{activeCard.uid}</Text>
                {activeCard.alias && (
                  <Text style={styles.cardNickname}>{activeCard.alias}</Text>
                )}
              </View>
              
              <View style={styles.balanceContainer}>
                <Text style={styles.balanceAmount}>
                  {activeCard.saldo_actual.toFixed(2)} Bs
                </Text>
                <Text style={styles.balanceLabel}>Saldo Disponible</Text>
              </View>
              
              <View style={styles.cardStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {Math.floor(activeCard.saldo_actual / parseFloat(getTarifa(user.tipo_tarjeta)))}
                  </Text>
                  <Text style={styles.statLabel}>Viajes</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{getTarifa(user.tipo_tarjeta)} Bs</Text>
                  <Text style={styles.statLabel}>Tarifa</Text>
                </View>
              </View>
            </View>
          </BlurView>
        </LinearGradient>
      </View>
    );
  };

  const renderCardItem = (card, index) => {
    const isSelected = card.uid === user.selectedCard;
    const animatedStyle = {
      opacity: cardAnimations[index] || 1,
      transform: [{
        translateY: cardAnimations[index]?.interpolate({
          inputRange: [0, 1],
          outputRange: [50, 0],
        }) || 0
      }]
    };

    return (
      <Animated.View key={card.uid} style={[styles.cardItemContainer, animatedStyle]}>
        <Card style={[styles.cardItem, isSelected && styles.selectedCardItem]}>
          <LinearGradient
            colors={getCardGradient(user.tipo_tarjeta, isSelected)}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0.8 }}
          >
            <Card.Content style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardUid}>{card.uid}</Text>
                  {card.alias && (
                    <Text style={styles.cardAlias}>{card.alias}</Text>
                  )}
                  <Chip 
                    mode="flat" 
                    style={styles.typeChip}
                    textStyle={styles.typeChipText}
                  >
                    {getCardTypeLabel(user.tipo_tarjeta)}
                  </Chip>
                </View>
                
                <View style={styles.cardActions}>
                  {isSelected ? (
                    <Chip 
                      mode="flat" 
                      style={styles.selectedChip}
                      textStyle={styles.selectedChipText}
                    >
                      ✓ Seleccionada
                    </Chip>
                  ) : (
                    <Button
                      mode="contained"
                      onPress={() => handleCardSelect(card.uid)}
                      style={styles.selectButton}
                      labelStyle={styles.selectButtonText}
                      compact
                    >
                      Seleccionar
                    </Button>
                  )}
                </View>
              </View>

              <View style={styles.cardBalance}>
                <Text style={styles.balance}>
                  {card.saldo_actual.toFixed(2)} Bs
                </Text>
                <Text style={styles.balanceSubtitle}>
                  {Math.floor(card.saldo_actual / parseFloat(getTarifa(user.tipo_tarjeta)))} viajes disponibles
                </Text>
              </View>

              <View style={styles.actionButtons}>
                <Button
                  mode="contained"
                  icon="credit-card-plus"
                  onPress={() => handleCardAction('recharge', card)}
                  style={styles.primaryAction}
                  labelStyle={styles.primaryActionText}
                  compact
                >
                  Recargar
                </Button>
                <Button
                  mode="outlined"
                  icon="history"
                  onPress={() => handleCardAction('history', card)}
                  style={styles.secondaryAction}
                  labelStyle={styles.secondaryActionText}
                  compact
                >
                  Historial
                </Button>
                <IconButton
                  icon="pencil"
                  mode="contained-tonal"
                  onPress={() => handleCardAction('edit', card)}
                  style={styles.iconAction}
                  iconColor={colors.white}
                />
                <IconButton
                  icon="delete"
                  mode="contained-tonal"
                  onPress={() => handleCardAction('delete', card)}
                  style={[styles.iconAction, styles.deleteAction]}
                  iconColor={colors.white}
                />
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

  if (user.authMode === 'card_uid') {
    return <CenteredLoader />;
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
        <Text style={styles.headerTitle}>Mis Tarjetas</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Tarjeta Activa */}
        {renderActiveCard()}

        {/* Lista de Tarjetas */}
        <View style={styles.cardsSection}>
          <Text style={styles.sectionTitle}>Todas las Tarjetas</Text>
          
          {user.cards && user.cards.length > 0 ? (
            user.cards.map((card, index) => renderCardItem(card, index))
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIcon}>
                <Text style={styles.emptyStateEmoji}>💳</Text>
              </View>
              <Text style={styles.emptyStateTitle}>No tienes tarjetas</Text>
              <Text style={styles.emptyStateSubtitle}>
                Registra tu primera tarjeta para comenzar
              </Text>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('RegisterCard')}
                style={styles.emptyStateButton}
                labelStyle={styles.emptyStateButtonText}
              >
                Registrar Nueva Tarjeta
              </Button>
            </View>
          )}
        </View>
      </ScrollView>

      {/* FAB mejorado */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('RegisterCard')}
        label="Nueva"
        mode="elevated"
        variant="primary"
      />

      {/* Modal de Edición - Mejorado */}
      <Portal>
        <Modal
          visible={editingCard !== null}
          onDismiss={() => {
            setEditingCard(null);
            setEditingAlias('');
          }}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView intensity={100} style={styles.modalBlur}>
            <Card style={styles.modalCard}>
              <Card.Content>
                <Text style={styles.modalTitle}>Editar Alias</Text>
                <Text style={styles.modalSubtitle}>
                  Tarjeta: {editingCard?.uid}
                </Text>
                <TextInput
                  label="Alias de la Tarjeta"
                  value={editingAlias}
                  onChangeText={setEditingAlias}
                  mode="outlined"
                  placeholder="Ej: Mi Tarjeta Principal"
                  style={styles.modalInput}
                  maxLength={50}
                />
                <View style={styles.modalButtons}>
                  <Button
                    mode="outlined"
                    onPress={() => {
                      setEditingCard(null);
                      setEditingAlias('');
                    }}
                    style={styles.modalCancelButton}
                    disabled={actionLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    mode="contained"
                    onPress={handleSaveAlias}
                    loading={actionLoading}
                    disabled={actionLoading || !editingAlias.trim()}
                    style={styles.modalSaveButton}
                  >
                    Guardar
                  </Button>
                </View>
              </Card.Content>
            </Card>
          </BlurView>
        </Modal>
      </Portal>

      {/* Modal de Eliminación - Mejorado */}
      <Portal>
        <Modal
          visible={deleteModalVisible}
          onDismiss={() => {
            setDeleteModalVisible(false);
            setCardToDelete(null);
          }}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView intensity={100} style={styles.modalBlur}>
            <Card style={styles.modalCard}>
              <Card.Content>
                <Text style={styles.modalTitle}>⚠️ Confirmar Eliminación</Text>
                <Text style={styles.modalSubtitle}>
                  ¿Estás seguro de que quieres eliminar esta tarjeta?
                </Text>
                {cardToDelete && (
                  <View style={styles.deleteCardInfo}>
                    <Text style={styles.deleteCardUid}>UID: {cardToDelete.uid}</Text>
                    {cardToDelete.alias && (
                      <Text style={styles.deleteCardAlias}>Alias: {cardToDelete.alias}</Text>
                    )}
                    <Text style={styles.deleteCardBalance}>
                      Saldo: {cardToDelete.saldo_actual.toFixed(2)} Bs
                    </Text>
                  </View>
                )}
                <Text style={styles.deleteWarning}>
                  Esta acción desactivará la tarjeta. No se eliminará físicamente.
                </Text>
                <View style={styles.modalButtons}>
                  <Button
                    mode="outlined"
                    onPress={() => {
                      setDeleteModalVisible(false);
                      setCardToDelete(null);
                    }}
                    style={styles.modalCancelButton}
                    disabled={actionLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    mode="contained"
                    onPress={confirmDeleteCard}
                    loading={actionLoading}
                    disabled={actionLoading}
                    style={styles.modalDeleteButton}
                  >
                    Eliminar
                  </Button>
                </View>
              </Card.Content>
            </Card>
          </BlurView>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  
  // Header mejorado
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...shadows.large,
  },
  headerTitle: {
    ...typography.headlineMedium,
    color: colors.white,
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 20,
  },
  headerSubtitle: {
    fontFamily: 'Chicalo-Regular',
    ...typography.bodyMedium,
    color: colors.accent,
    textAlign: 'center',
    opacity: 0.9,
  },

  // Scroll view
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
    paddingTop: 20,
  },

  // Tarjeta activa mejorada
  activeCardContainer: {
    margin: 20,
    marginTop: 6,
    borderRadius: 20,
    overflow: 'hidden',
    ...shadows.large,
  },
  activeCardGradient: {
    borderRadius: 20,
  },
  activeCardBlur: {
    padding: 24,
    borderRadius: 20,
  },
  activeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  activeCardHeaderLeft: {
    flex: 1,
  },
  activeCardTitle: {
    ...typography.titleLarge,
    color: colors.white,
    fontWeight: '600',
    marginBottom: 8,
  },
  activeChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
  },
  activeChipText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
  cardTypeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  cardTypeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
  activeCardContent: {
    alignItems: 'center',
  },
  cardNumberContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cardNumber: {
    ...typography.headlineSmall,
    color: colors.white,
    fontWeight: '700',
    letterSpacing: 2,
  },
  cardNickname: {
    ...typography.bodyMedium,
    color: colors.white,
    opacity: 0.8,
    marginTop: 4,
    fontStyle: 'italic',
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceAmount: {
    ...typography.displaySmall,
    color: colors.white,
    fontWeight: '700',
  },
  balanceLabel: {
    ...typography.bodySmall,
    color: colors.white,
    opacity: 0.8,
    marginTop: 4,
  },
  cardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...typography.titleMedium,
    color: colors.white,
    fontWeight: '600',
  },
  statLabel: {
    ...typography.bodySmall,
    color: colors.white,
    opacity: 0.8,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 16,
  },

  // Sección de tarjetas
  cardsSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    ...typography.titleLarge,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 16,
  },

  // Items de tarjeta mejorados
  cardItemContainer: {
    marginBottom: 16,
  },
  cardItem: {
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.medium,
  },
  selectedCardItem: {
    ...shadows.large,
  },
  cardGradient: {
    borderRadius: 16,
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardInfo: {
    flex: 1,
  },
  cardUid: {
    ...typography.titleMedium,
    color: colors.white,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardAlias: {
    ...typography.bodySmall,
    color: colors.white,
    opacity: 0.8,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  typeChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
  },
  typeChipText: {
    color: colors.white,
    fontSize: 11,
  },
  cardActions: {
    alignItems: 'flex-end',
  },
  selectedChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  selectedChipText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '500',
  },
  selectButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
  },
  selectButtonText: {
    color: colors.white,
    fontSize: 12,
  },
  cardBalance: {
    alignItems: 'center',
    marginBottom: 16,
  },
  balance: {
    ...typography.headlineMedium,
    color: colors.white,
    fontWeight: '700',
  },
  balanceSubtitle: {
    fontFamily: 'Chicalo-Regular',
    ...typography.bodySmall,
    color: colors.white,
    opacity: 0.8,
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryAction: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    flex: 1,
  },
  primaryActionText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  secondaryAction: {
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 12,
    flex: 1,
  },
  secondaryActionText: {
    color: colors.white,
    fontSize: 12,
  },
  iconAction: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    margin: 0,
  },
  deleteAction: {
    backgroundColor: 'rgba(244, 67, 54, 0.3)',
  },

  // Estado vacío mejorado
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
  emptyStateSubtitle: {
    fontFamily: 'Chicalo-Regular',
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingHorizontal: 32,
  },
  emptyStateButtonText: {
    color: colors.white,
    fontWeight: '500',
  },

  // FAB mejorado
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
    borderRadius: 20,
    ...shadows.large,
  },

  // Modales mejorados
  modalContainer: {
    padding: 20,
  },
  modalBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalCard: {
    borderRadius: 20,
    ...shadows.extraLarge,
  },
  modalTitle: {
    ...typography.titleLarge,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontFamily: 'Chicalo-Regular',
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalInput: {
    marginBottom: 24,
    backgroundColor: colors.surface,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    borderColor: colors.border,
    borderRadius: 12,
  },
  modalSaveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  modalDeleteButton: {
    flex: 1,
    backgroundColor: colors.error,
    borderRadius: 12,
  },
  deleteCardInfo: {
    backgroundColor: colors.errorLight,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  deleteCardUid: {
    ...typography.bodyMedium,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  deleteCardAlias: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  deleteCardBalance: {
    ...typography.bodyMedium,
    color: colors.primary,
    fontWeight: '600',
  },
  deleteWarning: {
    ...typography.bodySmall,
    color: colors.error,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 20,
  },
});

export default CardsScreen;
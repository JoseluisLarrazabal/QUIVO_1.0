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
      adulto: isActive ? [colors.info[600], colors.info[700]] : [colors.info[500], colors.info[600]],
      estudiante: isActive ? [colors.success[600], colors.success[700]] : [colors.success[500], colors.success[600]],
      adulto_mayor: isActive ? [colors.warning[500], colors.warning[700]] : [colors.warning[400], colors.warning[500]],
    };
    return gradients[tipo] || [colors.gray[500], colors.gray[700]];
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
        <Text style={styles.headerSubtitle}>
          Gestiona todas tus tarjetas de transporte
        </Text>
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
  header: {
    padding: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 12,
    elevation: 4,
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.background,
    textAlign: 'center',
    marginBottom: 4,
    fontSize: 24,
    fontFamily: 'Montserrat_400Regular',
  },
  headerSubtitle: {
    color: colors.accent,
    textAlign: 'center',
    marginBottom: 0,
    fontSize: 16,
    fontFamily: 'Montserrat_400Regular',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80, // Add padding to the bottom for the FAB
  },
  activeCardContainer: {
    margin: 20,
    marginTop: 10,
    elevation: 4,
    borderRadius: 18,
    overflow: 'hidden',
  },
  activeCardGradient: {
    flex: 1,
    borderRadius: 18,
  },
  activeCardBlur: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: 'transparent',
  },
  activeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  activeCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeCardTitle: {
    fontSize: 18,
    color: colors.background,
    fontFamily: 'Montserrat_400Regular',
  },
  activeChip: {
    backgroundColor: colors.accent,
    color: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginLeft: 10,
  },
  activeChipText: {
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
  },
  cardTypeContainer: {
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 10,
  },
  cardTypeText: {
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
    color: colors.primary,
  },
  activeCardContent: {
    padding: 15,
    backgroundColor: colors.background,
    borderRadius: 18,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  cardNumberContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  cardNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'Montserrat_400Regular',
    color: colors.background,
  },
  cardNickname: {
    fontSize: 16,
    color: colors.background,
    fontStyle: 'italic',
    fontFamily: 'Chicalo-Regular',
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    fontFamily: 'Montserrat_400Regular',
    color: colors.background,
  },
  balanceLabel: {
    color: colors.background,
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
  },
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Montserrat_400Regular',
    color: colors.background,
  },
  statLabel: {
    color: colors.background,
    fontSize: 12,
    fontFamily: 'Montserrat_400Regular',
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: colors.background,
    marginHorizontal: 10,
  },
  cardsSection: {
    margin: 20,
    marginTop: 0,
    elevation: 4,
    borderRadius: 18,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: '#F3F0FF',
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 15,
    color: colors.primary,
    fontFamily: 'Montserrat_400Regular',
    paddingHorizontal: 15,
  },
  cardItemContainer: {
    marginBottom: 15,
  },
  cardItem: {
    marginBottom: 15,
    borderLeftWidth: 6,
    elevation: 2,
    borderRadius: 14,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: '#F3F0FF',
  },
  selectedCardItem: {
    borderLeftColor: colors.primary,
    borderWidth: 2,
  },
  cardGradient: {
    flex: 1,
    borderRadius: 14,
  },
  cardContent: {
    padding: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardInfo: {
    flex: 1,
  },
  cardUid: {
    fontSize: 18,
    marginBottom: 5,
    fontFamily: 'Montserrat_400Regular',
    color: colors.primary,
  },
  cardAlias: {
    color: colors.accent,
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 5,
    fontFamily: 'Chicalo-Regular',
  },
  typeChip: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    borderWidth: 1.5,
    paddingHorizontal: 8,
    fontFamily: 'Montserrat_400Regular',
    fontSize: 14,
    color: colors.primary,
  },
  typeChipText: {
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
  },
  cardActions: {
    alignItems: 'flex-end',
  },
  selectedChip: {
    backgroundColor: colors.accent,
    color: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  selectedChipText: {
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
  },
  selectButton: {
    marginTop: 5,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.primary,
    elevation: 0,
    marginHorizontal: 2,
  },
  selectButtonText: {
    color: colors.primary,
    fontFamily: 'Montserrat_400Regular',
  },
  divider: {
    marginVertical: 15,
    backgroundColor: '#EEE',
  },
  cardBalance: {
    alignItems: 'center',
    marginBottom: 10,
  },
  balance: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Montserrat_400Regular',
    color: colors.primary,
  },
  balanceSubtitle: {
    color: colors.primary,
    fontSize: 12,
    fontFamily: 'Montserrat_400Regular',
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  primaryAction: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 10,
    marginHorizontal: 2,
    borderWidth: 1.5,
    borderColor: colors.primary,
    elevation: 0,
    backgroundColor: colors.primary,
  },
  primaryActionText: {
    color: colors.accent,
    fontFamily: 'Montserrat_400Regular',
  },
  secondaryAction: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 10,
    marginHorizontal: 2,
    borderWidth: 1.5,
    borderColor: colors.primary,
    elevation: 0,
  },
  secondaryActionText: {
    color: colors.primary,
    fontFamily: 'Montserrat_400Regular',
  },
  iconAction: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 10,
    marginHorizontal: 2,
    borderWidth: 1.5,
    borderColor: colors.primary,
    elevation: 0,
    backgroundColor: colors.primary,
  },
  deleteAction: {
    backgroundColor: '#F44336',
  },
  noCardsContainer: {
    alignItems: 'center',
    padding: 20,
  },
  noCards: {
    textAlign: 'center',
    color: colors.accent,
    fontStyle: 'italic',
    marginBottom: 15,
    fontFamily: 'Montserrat_400Regular',
  },
  addCardButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    marginTop: 8,
    elevation: 0,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
    color: colors.primary,
  },
  modalContainer: {
    backgroundColor: colors.background,
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  modalBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 5,
    color: colors.primary,
    fontFamily: 'Montserrat_400Regular',
  },
  modalSubtitle: {
    color: colors.accent,
    marginBottom: 20,
    fontFamily: 'Montserrat_400Regular',
  },
  modalInput: {
    marginBottom: 20,
    backgroundColor: colors.background,
    fontFamily: 'Montserrat_400Regular',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalCancelButton: {
    flex: 1,
    borderRadius: 10,
    marginHorizontal: 2,
    borderWidth: 1.5,
    borderColor: colors.primary,
    elevation: 0,
  },
  modalSaveButton: {
    flex: 1,
    borderRadius: 10,
    marginHorizontal: 2,
    borderWidth: 1.5,
    borderColor: colors.primary,
    elevation: 0,
    backgroundColor: colors.primary,
  },
  deleteCardInfo: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  deleteCardUid: {
    fontWeight: 'bold',
    marginBottom: 5,
    fontFamily: 'Montserrat_400Regular',
    color: colors.primary,
  },
  deleteCardAlias: {
    color: colors.accent,
    marginBottom: 5,
    fontFamily: 'Chicalo-Regular',
  },
  deleteCardBalance: {
    color: colors.primary,
    fontWeight: 'bold',
    fontFamily: 'Montserrat_400Regular',
  },
  deleteWarning: {
    color: '#F44336',
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular',
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyStateIcon: {
    fontSize: 60,
    marginBottom: 10,
  },
  emptyStateEmoji: {
    fontSize: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    color: colors.accent,
    fontFamily: 'Montserrat_400Regular',
    marginBottom: 5,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: colors.primary,
    fontFamily: 'Montserrat_400Regular',
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyStateButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    marginTop: 8,
    elevation: 0,
  },
  emptyStateButtonText: {
    color: colors.accent,
    fontFamily: 'Montserrat_400Regular',
  },
});

export default CardsScreen; 
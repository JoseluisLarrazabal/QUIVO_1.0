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
  FAB,
  Modal,
  Portal,
  TextInput,
  ActivityIndicator,
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import CenteredLoader from '../components/CenteredLoader';

const CardsScreen = ({ navigation }) => {
  const { user, refreshUserCards, selectCard, loading } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [editingAlias, setEditingAlias] = useState('');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (user && user.authMode === 'card_uid') {
      // Si está en modo tarjeta, redirigir al dashboard
      navigation.replace('Dashboard');
    }
  }, [user, navigation]);

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

  if (loading || !user) {
    return <CenteredLoader />;
  }

  if (user.authMode === 'card_uid') {
    return <CenteredLoader />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Title style={styles.title}>Mis Tarjetas</Title>
          <Paragraph style={styles.subtitle}>
            Gestiona todas tus tarjetas de transporte
          </Paragraph>
        </View>

        {/* Tarjeta Activa */}
        {user.selectedCard && (
          <Card style={styles.activeCard}>
            <Card.Content>
              <View style={styles.activeCardHeader}>
                <Title style={styles.activeCardTitle}>Tarjeta Activa</Title>
                <Chip mode="flat" style={styles.activeChip}>
                  Activa
                </Chip>
              </View>
              {user.cards && user.cards.map((card) => {
                if (card.uid === user.selectedCard) {
                  return (
                    <View key={card.uid} style={styles.activeCardContent}>
                      <View style={styles.cardInfo}>
                        <Title style={styles.cardUid}>{card.uid}</Title>
                        {card.alias && (
                          <Paragraph style={styles.cardAlias}>{card.alias}</Paragraph>
                        )}
                        <Chip 
                          mode="outlined" 
                          style={[styles.typeChip, { borderColor: getCardColor(user.tipo_tarjeta) }]}
                        >
                          {getCardTypeLabel(user.tipo_tarjeta)}
                        </Chip>
                      </View>
                      <Title style={[styles.balance, { color: getCardColor(user.tipo_tarjeta) }]}>
                        {card.saldo_actual.toFixed(2)} Bs
                      </Title>
                      <Paragraph style={styles.balanceLabel}>Saldo Actual</Paragraph>
                    </View>
                  );
                }
                return null;
              })}
            </Card.Content>
          </Card>
        )}

        {/* Lista de Tarjetas */}
        <Card style={styles.cardsListCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Todas las Tarjetas</Title>
            {user.cards && user.cards.length > 0 ? (
              user.cards.map((card, index) => (
                <Card 
                  key={index} 
                  style={[
                    styles.cardItem, 
                    { 
                      borderLeftColor: getCardColor(user.tipo_tarjeta),
                      backgroundColor: card.uid === user.selectedCard ? '#f0f8ff' : 'white'
                    }
                  ]}
                >
                  <Card.Content>
                    <View style={styles.cardHeader}>
                      <View style={styles.cardInfo}>
                        <Title style={styles.cardUid}>{card.uid}</Title>
                        {card.alias && (
                          <Paragraph style={styles.cardAlias}>{card.alias}</Paragraph>
                        )}
                        <Chip 
                          mode="outlined" 
                          style={[styles.typeChip, { borderColor: getCardColor(user.tipo_tarjeta) }]}
                        >
                          {getCardTypeLabel(user.tipo_tarjeta)}
                        </Chip>
                      </View>
                      <View style={styles.cardActions}>
                        {card.uid === user.selectedCard ? (
                          <Chip mode="flat" style={styles.selectedChip}>
                            Seleccionada
                          </Chip>
                        ) : (
                          <Button
                            mode="outlined"
                            onPress={() => handleCardSelect(card.uid)}
                            style={styles.selectButton}
                          >
                            Seleccionar
                          </Button>
                        )}
                      </View>
                    </View>
                    
                    <Divider style={styles.divider} />
                    
                    <View style={styles.cardDetails}>
                      <View style={styles.balanceInfo}>
                        <Title style={[styles.balance, { color: getCardColor(user.tipo_tarjeta) }]}>
                          {card.saldo_actual.toFixed(2)} Bs
                        </Title>
                        <Paragraph style={styles.balanceLabel}>Saldo</Paragraph>
                      </View>
                      
                      <View style={styles.cardStats}>
                        <Paragraph style={styles.statText}>
                          Tarifa: {getTarifa(user.tipo_tarjeta)} Bs
                        </Paragraph>
                        <Paragraph style={styles.statText}>
                          Viajes: {Math.floor(card.saldo_actual / parseFloat(getTarifa(user.tipo_tarjeta)))}
                        </Paragraph>
                      </View>
                    </View>

                    <Divider style={styles.divider} />

                    <View style={styles.actionButtons}>
                      <Button
                        mode="contained"
                        icon="credit-card-plus"
                        onPress={() => handleCardAction('recharge', card)}
                        style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                        compact
                      >
                        Recargar
                      </Button>
                      <Button
                        mode="outlined"
                        icon="history"
                        onPress={() => handleCardAction('history', card)}
                        style={styles.actionButton}
                        compact
                      >
                        Historial
                      </Button>
                      <Button
                        mode="outlined"
                        icon="pencil"
                        onPress={() => handleCardAction('edit', card)}
                        style={styles.actionButton}
                        compact
                      >
                        Editar
                      </Button>
                      <Button
                        mode="outlined"
                        icon="delete"
                        onPress={() => handleCardAction('delete', card)}
                        style={[styles.actionButton, { borderColor: '#F44336' }]}
                        textColor="#F44336"
                        compact
                      >
                        Eliminar
                      </Button>
                    </View>
                  </Card.Content>
                </Card>
              ))
            ) : (
              <View style={styles.noCardsContainer}>
                <Paragraph style={styles.noCards}>
                  No tienes tarjetas registradas
                </Paragraph>
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate('RegisterCard')}
                  style={styles.addCardButton}
                >
                  Registrar Nueva Tarjeta
                </Button>
              </View>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('RegisterCard')}
        label="Nueva Tarjeta"
      />

      {/* Modal de Edición de Alias */}
      <Portal>
        <Modal
          visible={editingCard !== null}
          onDismiss={() => {
            setEditingCard(null);
            setEditingAlias('');
          }}
          contentContainerStyle={styles.modalContainer}
        >
          <Card>
            <Card.Content>
              <Title style={styles.modalTitle}>Editar Alias</Title>
              <Paragraph style={styles.modalSubtitle}>
                Tarjeta: {editingCard?.uid}
              </Paragraph>
              
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
                  style={styles.modalButton}
                  disabled={actionLoading}
                >
                  Cancelar
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSaveAlias}
                  loading={actionLoading}
                  disabled={actionLoading || !editingAlias.trim()}
                  style={styles.modalButton}
                >
                  Guardar
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>

      {/* Modal de Confirmación de Eliminación */}
      <Portal>
        <Modal
          visible={deleteModalVisible}
          onDismiss={() => {
            setDeleteModalVisible(false);
            setCardToDelete(null);
          }}
          contentContainerStyle={styles.modalContainer}
        >
          <Card>
            <Card.Content>
              <Title style={styles.modalTitle}>Confirmar Eliminación</Title>
              <Paragraph style={styles.modalSubtitle}>
                ¿Estás seguro de que quieres eliminar la tarjeta?
              </Paragraph>
              
              {cardToDelete && (
                <View style={styles.deleteCardInfo}>
                  <Paragraph style={styles.deleteCardUid}>UID: {cardToDelete.uid}</Paragraph>
                  {cardToDelete.alias && (
                    <Paragraph style={styles.deleteCardAlias}>Alias: {cardToDelete.alias}</Paragraph>
                  )}
                  <Paragraph style={styles.deleteCardBalance}>
                    Saldo: {cardToDelete.saldo_actual.toFixed(2)} Bs
                  </Paragraph>
                </View>
              )}
              
              <Paragraph style={styles.deleteWarning}>
                ⚠️ Esta acción desactivará la tarjeta. No se eliminará físicamente.
              </Paragraph>
              
              <View style={styles.modalButtons}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setDeleteModalVisible(false);
                    setCardToDelete(null);
                  }}
                  style={styles.modalButton}
                  disabled={actionLoading}
                >
                  Cancelar
                </Button>
                <Button
                  mode="contained"
                  onPress={confirmDeleteCard}
                  loading={actionLoading}
                  disabled={actionLoading}
                  style={[styles.modalButton, { backgroundColor: '#F44336' }]}
                >
                  Eliminar
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    elevation: 2,
  },
  title: {
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    color: '#666',
  },
  activeCard: {
    margin: 20,
    marginTop: 10,
    elevation: 4,
    backgroundColor: '#e3f2fd',
  },
  activeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  activeCardTitle: {
    fontSize: 18,
    color: '#1976d2',
  },
  activeChip: {
    backgroundColor: '#4caf50',
  },
  activeCardContent: {
    alignItems: 'center',
  },
  cardsListCard: {
    margin: 20,
    marginTop: 0,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 15,
  },
  cardItem: {
    marginBottom: 15,
    borderLeftWidth: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardInfo: {
    flex: 1,
  },
  cardUid: {
    fontSize: 18,
    marginBottom: 5,
  },
  cardAlias: {
    color: '#666',
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 5,
  },
  typeChip: {
    alignSelf: 'flex-start',
  },
  cardActions: {
    alignItems: 'flex-end',
  },
  selectedChip: {
    backgroundColor: '#4caf50',
  },
  selectButton: {
    marginTop: 5,
  },
  divider: {
    marginVertical: 15,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceInfo: {
    alignItems: 'center',
  },
  balance: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  balanceLabel: {
    color: '#666',
    fontSize: 12,
  },
  cardStats: {
    alignItems: 'flex-end',
  },
  statText: {
    color: '#666',
    fontSize: 12,
    marginBottom: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
  },
  noCardsContainer: {
    alignItems: 'center',
    padding: 20,
  },
  noCards: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 15,
  },
  addCardButton: {
    backgroundColor: '#2196F3',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 5,
  },
  modalSubtitle: {
    color: '#666',
    marginBottom: 20,
  },
  modalInput: {
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalButton: {
    flex: 1,
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
  },
  deleteCardAlias: {
    color: '#666',
    marginBottom: 5,
  },
  deleteCardBalance: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  deleteWarning: {
    color: '#F44336',
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default CardsScreen; 
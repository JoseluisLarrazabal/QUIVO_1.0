import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Paragraph } from 'react-native-paper';

const CenteredLoader = ({ message = 'Cargando...' }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2196F3" />
      <Paragraph style={styles.message}>{message}</Paragraph>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});

export default CenteredLoader; 
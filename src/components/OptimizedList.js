import React, { memo, useCallback } from 'react';
import { FlatList, View } from 'react-native';

/**
 * Componente optimizado para renderizar listas con performance mejorada
 */
const OptimizedList = memo(({
  data,
  renderItem,
  keyExtractor,
  onRefresh,
  refreshing = false,
  onEndReached,
  onEndReachedThreshold = 0.1,
  ListEmptyComponent,
  ListHeaderComponent,
  ListFooterComponent,
  contentContainerStyle,
  style,
  showsVerticalScrollIndicator = false,
  showsHorizontalScrollIndicator = false,
  ...props
}) => {
  const memoizedRenderItem = useCallback(({ item, index }) => {
    return renderItem({ item, index });
  }, [renderItem]);

  const memoizedKeyExtractor = useCallback((item, index) => {
    return keyExtractor ? keyExtractor(item, index) : item.id || index.toString();
  }, [keyExtractor]);

  const memoizedOnRefresh = useCallback(() => {
    if (onRefresh) {
      onRefresh();
    }
  }, [onRefresh]);

  const memoizedOnEndReached = useCallback(() => {
    if (onEndReached) {
      onEndReached();
    }
  }, [onEndReached]);

  return (
    <FlatList
      data={data}
      renderItem={memoizedRenderItem}
      keyExtractor={memoizedKeyExtractor}
      onRefresh={memoizedOnRefresh}
      refreshing={refreshing}
      onEndReached={memoizedOnEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      ListEmptyComponent={ListEmptyComponent}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      contentContainerStyle={contentContainerStyle}
      style={style}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={5}
      {...props}
    />
  );
});

OptimizedList.displayName = 'OptimizedList';

export default OptimizedList; 
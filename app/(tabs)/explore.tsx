import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useFavorites } from '@/contexts/favorites-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Meal } from '@/types/meal';
import { router } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_MARGIN = 8;
const CONTAINER_PADDING = 8;
const CARD_WIDTH = (SCREEN_WIDTH - CONTAINER_PADDING * 2 - CARD_MARGIN * 4) / 2;

export default function FavoritesScreen() {
  const { favorites } = useFavorites();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const renderMealCard = ({ item }: { item: Meal }) => {
    return (
      <TouchableOpacity
        style={[styles.mealCard, { backgroundColor: colors.background }]}
        onPress={() => router.push(`/meal/${item.idMeal}`)}>
        <Image source={{ uri: item.strMealThumb }} style={styles.mealImage} />
        <View style={styles.mealInfo}>
          <Text
            style={[styles.mealName, { color: colors.text }]}
            numberOfLines={2}>
            {item.strMeal}
          </Text>
          {item.strCategory && (
            <Text style={[styles.mealCategory, { color: colors.text + '80' }]}>
              {item.strCategory}
            </Text>
          )}
        </View>
        <View style={styles.favoriteIndicator}>
          <IconSymbol name='heart.fill' size={20} color='#ff4444' />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          My Favorites
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.text + '80' }]}>
          {favorites.length} {favorites.length === 1 ? 'meal' : 'meals'} saved
        </Text>
      </View>

      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconSymbol name='heart' size={64} color={colors.text + '40'} />
          <Text style={[styles.emptyText, { color: colors.text + '60' }]}>
            No favorite meals yet
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.text + '60' }]}>
            Tap the heart icon on any meal to add it to your favorites
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderMealCard}
          keyExtractor={(item) => item.idMeal}
          numColumns={2}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  listContent: {
    padding: 8,
  },
  mealCard: {
    width: CARD_WIDTH,
    margin: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mealImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  mealInfo: {
    padding: 12,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  mealCategory: {
    fontSize: 14,
  },
  favoriteIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 6,
  },
});

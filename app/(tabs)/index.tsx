import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useFavorites } from '@/contexts/favorites-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { api } from '@/services/api';
import { Category, Meal } from '@/types/meal';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_MARGIN = 8;
const CONTAINER_PADDING = 8;
const CARD_WIDTH = (SCREEN_WIDTH - CONTAINER_PADDING * 2 - CARD_MARGIN * 4) / 2;

const ITEMS_PER_PAGE = 20;

export default function HomeScreen() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [displayedMeals, setDisplayedMeals] = useState<Meal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [isSearching, setIsSearching] = useState(false);

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isFavorite } = useFavorites();

  const loadMealsByCategory = useCallback(async (category: string) => {
    const mealsData = await api.getMealsByCategory(category);
    setMeals(mealsData);
    setPage(1);
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    console.log(`🔍 Search triggered (debounced) for: "${query}"`);
    setLoading(true);
    const searchResults = await api.searchMeals(query);
    setMeals(searchResults);
    setPage(1);
    setLoading(false);
  }, []);

  // Initial load - runs only once on mount
  useEffect(() => {
    const loadInitialData = async () => {
      console.log('🚀 App started - Loading initial data...');
      setLoading(true);
      const categoriesData = await api.getCategories();
      setCategories(categoriesData);

      if (categoriesData.length > 0) {
        const firstCategory = categoriesData[0].strCategory;
        console.log(`🎯 Auto-selecting first category: "${firstCategory}"`);
        setSelectedCategory(firstCategory);
        const mealsData = await api.getMealsByCategory(firstCategory);
        setMeals(mealsData);
        setPage(1);
      }

      setLoading(false);
      console.log('✅ Initial data load complete');
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    // Debounced search - only runs when searchQuery changes
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim()) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(() => {
        handleSearch(searchQuery);
      }, 500);
    } else if (searchQuery === '' && isSearching) {
      // User cleared search, reload the current category
      setIsSearching(false);
      if (selectedCategory) {
        loadMealsByCategory(selectedCategory);
      }
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [
    searchQuery,
    isSearching,
    selectedCategory,
    handleSearch,
    loadMealsByCategory,
  ]);

  const paginateMeals = useCallback(() => {
    const endIndex = page * ITEMS_PER_PAGE;
    const newDisplayedMeals = meals.slice(0, endIndex);
    console.log(
      `📄 Pagination: Displaying ${newDisplayedMeals.length} of ${meals.length} meals (page ${page})`,
    );
    setDisplayedMeals(newDisplayedMeals);
  }, [meals, page]);

  useEffect(() => {
    paginateMeals();
  }, [paginateMeals]);

  const handleCategorySelect = useCallback(
    async (category: string) => {
      console.log(`🏷️ Category selected: "${category}"`);
      setSelectedCategory(category);
      setSearchQuery('');
      setIsSearching(false);
      setLoading(true);
      await loadMealsByCategory(category);
      setLoading(false);
    },
    [loadMealsByCategory],
  );

  const handleRefresh = useCallback(async () => {
    console.log('🔄 Pull-to-refresh triggered');
    setRefreshing(true);
    if (isSearching && searchQuery) {
      console.log(`🔄 Refreshing search results for: "${searchQuery}"`);
      await handleSearch(searchQuery);
    } else if (selectedCategory) {
      console.log(`🔄 Refreshing category: "${selectedCategory}"`);
      await loadMealsByCategory(selectedCategory);
    }
    setRefreshing(false);
    console.log('✅ Refresh complete');
  }, [
    isSearching,
    searchQuery,
    selectedCategory,
    handleSearch,
    loadMealsByCategory,
  ]);

  const loadMore = useCallback(() => {
    if (displayedMeals.length < meals.length) {
      console.log(
        `📜 Infinite scroll triggered - Loading more meals (currently showing ${displayedMeals.length} of ${meals.length})`,
      );
      setPage((prev) => prev + 1);
    } else {
      console.log('📜 Infinite scroll: All meals loaded');
    }
  }, [displayedMeals.length, meals.length]);

  const renderMealCard = useCallback(
    ({ item }: { item: Meal }) => {
      const isLiked = isFavorite(item.idMeal);

      return (
        <TouchableOpacity
          style={[styles.mealCard, { backgroundColor: colors.background }]}
          onPress={() => {
            console.log(
              `👆 Meal tapped: "${item.strMeal}" (ID: ${item.idMeal})`,
            );
            router.push(`/meal/${item.idMeal}`);
          }}>
          <Image source={{ uri: item.strMealThumb }} style={styles.mealImage} />
          <View style={styles.mealInfo}>
            <Text
              style={[styles.mealName, { color: colors.text }]}
              numberOfLines={2}>
              {item.strMeal}
            </Text>
            {item.strCategory && (
              <Text
                style={[styles.mealCategory, { color: colors.text + '80' }]}>
                {item.strCategory}
              </Text>
            )}
          </View>
          {isLiked && (
            <View style={styles.favoriteIndicator}>
              <IconSymbol name='heart.fill' size={20} color='#ff4444' />
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [colors.background, colors.text, isFavorite],
  );

  const renderCategoryChip = useCallback(
    (category: Category) => {
      const isSelected = category.strCategory === selectedCategory;

      return (
        <TouchableOpacity
          key={category.strCategory}
          style={[
            styles.categoryChip,
            {
              backgroundColor: isSelected ? colors.tint : 'transparent',
              borderColor: colors.tint,
            },
          ]}
          onPress={() => handleCategorySelect(category.strCategory)}>
          <Text
            style={[
              styles.categoryChipText,
              {
                color: isSelected
                  ? colorScheme === 'dark'
                    ? '#000'
                    : '#fff'
                  : colors.tint,
              },
            ]}>
            {category.strCategory}
          </Text>
        </TouchableOpacity>
      );
    },
    [selectedCategory, colors.tint, handleCategorySelect, colorScheme],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Meal Market
        </Text>

        <View
          style={[
            styles.searchContainer,
            { backgroundColor: colors.text + '10' },
          ]}>
          <IconSymbol
            name='magnifyingglass'
            size={20}
            color={colors.text + '60'}
          />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder='Search meals...'
            placeholderTextColor={colors.text + '60'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <IconSymbol
                name='xmark.circle.fill'
                size={20}
                color={colors.text + '60'}
              />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}>
          {categories.map(renderCategoryChip)}
        </ScrollView>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={colors.tint} />
        </View>
      ) : displayedMeals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconSymbol name='fork.knife' size={64} color={colors.text + '40'} />
          <Text style={[styles.emptyText, { color: colors.text + '60' }]}>
            {isSearching ? 'No meals found' : 'No meals available'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayedMeals}
          renderItem={renderMealCard}
          keyExtractor={(item) => item.idMeal}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.tint}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            displayedMeals.length < meals.length ? (
              <ActivityIndicator
                size='small'
                color={colors.tint}
                style={styles.footerLoader}
              />
            ) : null
          }
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
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  categoriesContainer: {
    marginHorizontal: -16,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    marginRight: 8,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 16,
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
  footerLoader: {
    marginVertical: 20,
  },
});

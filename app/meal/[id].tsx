import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useFavorites } from '@/contexts/favorites-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { api } from '@/services/api';
import { Ingredient, MealDetail } from '@/types/meal';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function MealDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [meal, setMeal] = useState<MealDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const { isFavorite, toggleFavorite } = useFavorites();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const loadMealDetails = useCallback(async () => {
    if (!id) return;
    console.log(`📖 Loading meal details for ID: ${id}`);
    setLoading(true);
    const data = await api.getMealById(id);
    setMeal(data);
    setLoading(false);
    if (data) {
      console.log(`✅ Meal details loaded: "${data.strMeal}"`);
    }
  }, [id]);

  useEffect(() => {
    loadMealDetails();
  }, [loadMealDetails]);

  const getIngredients = useCallback((): Ingredient[] => {
    if (!meal) return [];
    const ingredients: Ingredient[] = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}` as keyof MealDetail];
      const measure = meal[`strMeasure${i}` as keyof MealDetail];
      if (ingredient && ingredient.trim()) {
        ingredients.push({
          ingredient: ingredient as string,
          measure: (measure as string) || '',
        });
      }
    }
    return ingredients;
  }, [meal]);

  const handleToggleFavorite = useCallback(async () => {
    if (!meal) return;
    const willBeFavorite = !isFavorite(meal.idMeal);
    console.log(
      `${willBeFavorite ? '❤️' : '💔'} ${
        willBeFavorite ? 'Adding to' : 'Removing from'
      } favorites: "${meal.strMeal}"`,
    );
    await toggleFavorite({
      idMeal: meal.idMeal,
      strMeal: meal.strMeal,
      strMealThumb: meal.strMealThumb,
      strCategory: meal.strCategory,
      strArea: meal.strArea,
    });
  }, [meal, isFavorite, toggleFavorite]);

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size='large' color={colors.tint} />
      </View>
    );
  }

  if (!meal) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          Meal not found
        </Text>
      </View>
    );
  }

  const ingredients = getIngredients();
  const isLiked = isFavorite(meal.idMeal);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}>
      <Image source={{ uri: meal.strMealThumb }} style={styles.image} />

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text }]}>
              {meal.strMeal}
            </Text>
            <View style={styles.badges}>
              {meal.strCategory && (
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: colors.tint + '20' },
                  ]}>
                  <Text style={[styles.badgeText, { color: colors.tint }]}>
                    {meal.strCategory}
                  </Text>
                </View>
              )}
              {meal.strArea && (
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: colors.tint + '20' },
                  ]}>
                  <Text style={[styles.badgeText, { color: colors.tint }]}>
                    {meal.strArea}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <TouchableOpacity
            onPress={handleToggleFavorite}
            style={[
              styles.favoriteButton,
              { backgroundColor: colors.tint + '20' },
            ]}>
            <IconSymbol
              name={isLiked ? 'heart.fill' : 'heart'}
              size={28}
              color={isLiked ? '#ff4444' : colors.tint}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Ingredients
          </Text>
          <View style={styles.ingredientsList}>
            {ingredients.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.ingredientItem,
                  { borderBottomColor: colors.text + '20' },
                ]}>
                <Text style={[styles.ingredientName, { color: colors.text }]}>
                  {item.ingredient}
                </Text>
                <Text
                  style={[
                    styles.ingredientMeasure,
                    { color: colors.text + '80' },
                  ]}>
                  {item.measure}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Instructions
          </Text>
          <Text style={[styles.instructions, { color: colors.text + '99' }]}>
            {meal.strInstructions}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  favoriteButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  ingredientsList: {
    gap: 8,
  },
  ingredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  ingredientName: {
    fontSize: 16,
    flex: 1,
  },
  ingredientMeasure: {
    fontSize: 16,
    fontWeight: '600',
  },
  instructions: {
    fontSize: 16,
    lineHeight: 24,
  },
  errorText: {
    fontSize: 18,
  },
});

import { Category, Meal, MealDetail } from '@/types/meal';

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

export const api = {
  async getCategories(): Promise<Category[]> {
    try {
      console.log('📡 API: Fetching categories...');
      const response = await fetch(`${BASE_URL}/list.php?c=list`);
      const data = await response.json();
      console.log('✅ API: Categories received:', data.meals?.length || 0);
      return data.meals || [];
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      return [];
    }
  },

  async getMealsByCategory(category: string): Promise<Meal[]> {
    try {
      console.log(`📡 API: Fetching meals for category: "${category}"`);
      const response = await fetch(`${BASE_URL}/filter.php?c=${category}`);
      const data = await response.json();
      console.log(
        `✅ API: Received ${data.meals?.length || 0} meals for "${category}"`,
      );
      return data.meals || [];
    } catch (error) {
      console.error('❌ Error fetching meals by category:', error);
      return [];
    }
  },

  async searchMeals(term: string): Promise<MealDetail[]> {
    try {
      console.log(`📡 API: Searching meals for: "${term}"`);
      const response = await fetch(`${BASE_URL}/search.php?s=${term}`);
      const data = await response.json();
      console.log(
        `✅ API: Found ${data.meals?.length || 0} meals for "${term}"`,
      );
      return data.meals || [];
    } catch (error) {
      console.error('❌ Error searching meals:', error);
      return [];
    }
  },

  async getMealById(id: string): Promise<MealDetail | null> {
    try {
      console.log(`📡 API: Fetching meal details for ID: ${id}`);
      const response = await fetch(`${BASE_URL}/lookup.php?i=${id}`);
      const data = await response.json();
      console.log(
        `✅ API: Meal details received for: ${
          data.meals?.[0]?.strMeal || 'Unknown'
        }`,
      );
      return data.meals ? data.meals[0] : null;
    } catch (error) {
      console.error('❌ Error fetching meal by ID:', error);
      return null;
    }
  },
};

# Meal Market - React Native Case Study

A meal browsing application built with React Native, Expo Go (SDK 54), and TypeScript using TheMealDB API.

## Features Implemented

### ✅ Browse Meals

- Displays meals from the first available category on launch
- Two-column grid layout with infinite scroll (20 meals per load)
- Pull-to-refresh functionality
- Visual indicators for favorited meals

### ✅ Search

- Search bar with debounced API calls (500ms)
- Search results replace main list until cleared
- Clear button to reset search

### ✅ Filter by Category

- Horizontal scrolling category chips
- One-tap category switching
- Active category indicator

### ✅ Meal Details

- Large image, name, category, and area
- Complete ingredients list with measurements
- Step-by-step cooking instructions
- Favorite toggle button with optimistic updates

### ✅ Favorites (Saved Meals)

- Dedicated Favorites tab
- Local persistence using AsyncStorage
- Survives app restarts
- Real-time sync across screens

## Tech Stack

- React Native 0.81.4
- Expo SDK 54
- TypeScript 5.9.2
- Expo Router (file-based routing)
- AsyncStorage (local persistence)
- TheMealDB API

## Installation & Running

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start the development server:**

   ```bash
   npx expo start
   ```

3. **Test in Expo Go:**
   - Install [Expo Go](https://expo.dev/go) on your iOS or Android device
   - Scan the QR code with your device camera (iOS) or Expo Go app (Android)
   - The app will open in Expo Go

## Decisions

There was no trade off that can be mentioned, I implemented all the necessary features with the help of AI.

## AI Use

In this case I only used Cursor. As there was no strict rule on the AI use and limited time I just passed the entire task to the Cursor AI and I made sure that all functionalities were working well.
As usual I did like a code review.
Then I iterated over the parts that I didn't like, some of the prompts that I sent:

```
Let's follow the instruction and let's have only one, Readme.md file and include only necessary things that was mentioned in the initial prompt
```

```
let's add some logs on endpoints calls, to test endpoint calls. and add logs on infinite scroll and on pull refresh too
```

```
Good, Let's add memoisation on the functions as I don't like having dependency issues on Effects
```

```
the last item is getting shown on a full width, when it is odd array length, let's fix it with correct styling
```

```
initial loading doesn't work anymore, please check
```

```
on renderCategoryChip, when it is a dark mode the font has a wrong color
```

## Project Structure

```

app/
├── (tabs)/
│ ├── index.tsx # Browse screen (home)
│ └── explore.tsx # Favorites screen
├── meal/
│ └── [id].tsx # Meal details screen
└── \_layout.tsx # Root layout with providers
contexts/
└── favorites-context.tsx # Favorites state management
services/
└── api.ts # TheMealDB API integration
types/
└── meal.ts # TypeScript interfaces

```

## API Endpoints Used

- **List categories:** `list.php?c=list`
- **Filter by category:** `filter.php?c={category}`
- **Search by name:** `search.php?s={term}`
- **Lookup by ID:** `lookup.php?i={id}`

API Documentation: <https://www.themealdb.com/api.php>

## Testing the App

1. **Browse:** Scroll through meals, test infinite scroll
2. **Search:** Type "chicken" and wait for debounced results
3. **Filter:** Tap different category chips
4. **Details:** Tap any meal card to view full details
5. **Favorites:** Toggle heart icon, close/reopen app to verify persistence
6. **Refresh:** Pull down to refresh meal data

## Configuration

- **Expo Project ID:** `de549134-ee97-4456-9708-cfdb5a094b3b`
- **SDK Version:** Expo 54
- **Runtime:** Expo Go compatible (no custom native builds required)

## Notes

- All features run entirely in Expo Go without custom builds
- Supports both iOS and Android
- Dark mode and light mode support
- Full TypeScript type safety
- Error handling and loading states implemented

```

```

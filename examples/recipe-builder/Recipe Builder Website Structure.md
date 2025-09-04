# Recipe Builder Website Structure

## **Page Hierarchy & Routes**

### **Public Routes**
- `/` - **Homepage/Landing**
  - Featured recipes, trending, hero section
  - Search bar, quick category filters
  - Sign up/login CTAs

- `/recipes` - **Recipe Discovery**
  - Grid/list view toggle
  - Advanced filtering sidebar (cuisine, diet, time, difficulty)
  - Infinite scroll or pagination
  - Sort options (popular, newest, rating, cook time)

- `/recipe/[id]` - **Recipe Detail Page**
  - Full recipe view with ingredients, instructions, nutrition
  - Reviews and ratings
  - Related recipes
  - Share buttons, save to collection

- `/search` - **Search Results**
  - Query-based results
  - Search suggestions and autocomplete
  - Filter refinement

- `/collections/[id]` - **Public Recipe Collections**
  - Curated recipe lists (e.g., "Quick Weeknight Dinners")
  - Collection metadata and description

### **Authentication Routes**
- `/login` - **Sign In**
- `/register` - **Sign Up**
- `/forgot-password` - **Password Reset**

### **Protected User Routes**
- `/dashboard` - **User Dashboard**
  - Personal recipe overview
  - Recent activity, saved recipes
  - Quick actions (create recipe, view meal plans)

- `/create` - **Recipe Creation Wizard**
  - Step 1: Basic info (title, description, servings, time)
  - Step 2: Ingredients with search/autocomplete
  - Step 3: Instructions with drag-and-drop ordering
  - Step 4: Photos and final details
  - Step 5: Nutrition review and publish

- `/recipe/[id]/edit` - **Recipe Editor**
  - Same as creation but pre-populated
  - Version history/draft management

- `/my-recipes` - **Recipe Management**
  - User's created recipes
  - Draft/published status
  - Bulk actions, analytics

- `/my-collections` - **Personal Collections**
  - Saved recipes organized by collection
  - Create/edit collections
  - Meal planning integration

- `/shopping-list` - **Shopping List Generator**
  - Consolidated ingredients from selected recipes
  - Quantity optimization
  - Store organization
  - Check-off functionality

- `/meal-planner` - **Weekly Meal Planning**
  - Calendar view with drag-and-drop recipes
  - Grocery list generation
  - Nutrition overview for the week

- `/cook/[id]` - **Cooking Mode**
  - Step-by-step cooking interface
  - Multiple timers
  - Hands-free voice commands
  - Progress tracking

### **User Profile Routes**
- `/profile` - **Account Settings**
  - Personal info, dietary preferences
  - Notification settings
  - Account management

- `/profile/nutrition` - **Nutrition Goals**
  - Set macro/calorie targets
  - Dietary restrictions management
  - Health goal integration

- `/user/[username]` - **Public Profile**
  - User's public recipes
  - Bio and cooking style
  - Follower system

## **Component Architecture**

### **Layout Components**
- `Header` - Navigation, search, user menu
- `Footer` - Links, social, newsletter signup
- `Sidebar` - Filtering, categories, user menu
- `MobileNav` - Responsive navigation drawer

### **Recipe Components**
- `RecipeCard` - Grid/list item with image, title, metadata
- `RecipeHero` - Large featured recipe display
- `IngredientList` - Interactive ingredient checklist
- `InstructionSteps` - Numbered steps with media
- `NutritionPanel` - Charts and nutritional breakdown
- `RecipeRating` - Star rating with reviews
- `RecipeActions` - Save, share, cook buttons

### **Form Components**
- `RecipeWizard` - Multi-step creation flow
- `IngredientSearch` - Autocomplete ingredient selector
- `ImageUpload` - Drag-and-drop with crop tool
- `PortionAdjuster` - Serving size scaler
- `TimerWidget` - Multiple cooking timers
- `InstructionEditor` - Rich text with drag-and-drop

### **Interactive Components**
- `FilterSidebar` - Advanced search filters
- `SearchAutocomplete` - Intelligent search suggestions
- `CollectionManager` - Save/organize recipes
- `ShoppingCartSummary` - Ingredient consolidation
- `CookingModeUI` - Hands-free cooking interface
- `MealPlanCalendar` - Weekly planning grid

### **Data Components**
- `NutritionCalculator` - Real-time nutrition math
- `RecipeScaler` - Portion adjustment logic
- `CostEstimator` - Price calculation per serving
- `SubstitutionEngine` - Ingredient alternatives

This structure gives each framework plenty to showcase - complex routing, nested layouts, real-time calculations, rich interactions, and sophisticated state management!
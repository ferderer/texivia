# Recipe Builder - Project Specification

## Overview
A comprehensive recipe management application designed to showcase and compare different frontend frameworks. The app serves as both a functional recipe platform and a framework comparison case study, covering all major web development patterns and challenges.

## Project Goals
- **Primary**: Create a feature-rich recipe builder that demonstrates real-world application complexity
- **Secondary**: Provide identical functionality across multiple frameworks (Svelte 5, React, Vue, Angular, etc.)
- **Tertiary**: Generate comparative analysis content for framework evaluation videos

## Core Features

### Public Features
- **Recipe Discovery**: Browse, search, and filter recipes with advanced filtering
- **Recipe Viewing**: Detailed recipe pages with ingredients, instructions, nutrition, and reviews
- **Search & Categories**: Intelligent search with autocomplete and category-based browsing
- **Public Collections**: Curated recipe collections (e.g., "Quick Weeknight Dinners")

### Authenticated Features
- **Recipe Creation**: Multi-step wizard for creating recipes with rich media
- **Recipe Management**: Edit, delete, and organize personal recipes
- **Collections**: Save and organize favorite recipes into personal collections
- **Meal Planning**: Weekly calendar-based meal planning with drag-and-drop
- **Shopping Lists**: Auto-generated, consolidated shopping lists from selected recipes
- **Cooking Mode**: Step-by-step cooking interface with timers and voice commands
- **Nutrition Tracking**: Real-time nutritional calculations and goal tracking

### Advanced Features
- **Real-time Collaboration**: Collaborative recipe editing (stretch goal)
- **Recipe Scaling**: Automatic portion adjustments with live nutrition updates
- **Ingredient Substitutions**: Smart ingredient replacement suggestions
- **Cost Estimation**: Price calculations per serving
- **Social Features**: Recipe sharing, ratings, reviews, and user profiles

## Technical Requirements

### Framework Implementations
Each framework version must implement identical functionality:
1. **Native TypeScript** (vanilla TS with DOM manipulation)
2. **Svelte 5** (with Signals and Effects where applicable)
3. **React** (with modern hooks and context)
4. **Vue 3** (Composition API)
5. **Angular** (latest version with PrimeNG)
6. **Additional frameworks** as needed for comparison

### Key Technical Challenges
- **State Management**: Complex application state across multiple data domains
- **Real-time Updates**: Live nutrition calculations, collaborative features
- **Performance**: Large datasets, smooth animations, efficient re-renders
- **Form Handling**: Multi-step wizards, validation, file uploads
- **Data Visualization**: Charts, graphs, and interactive nutritional displays
- **Responsive Design**: Mobile-first approach with touch interactions
- **Accessibility**: Full WCAG compliance across all components

### Router Integration
- Integration with custom TypeScript router: https://github.com/ferderer/texivia
- Demonstrate router capabilities across different framework architectures
- Showcase route guards, nested routing, and dynamic route parameters

## Data Models

### Recipe
```typescript
interface Recipe {
  id: string
  title: string
  description: string
  servings: number
  prepTime: number // minutes
  cookTime: number
  difficulty: 'easy' | 'medium' | 'hard'
  cuisine: string
  dietaryTags: string[] // vegetarian, vegan, gluten-free, etc.
  ingredients: Ingredient[]
  instructions: Instruction[]
  nutrition: NutritionInfo
  images: string[]
  author: User
  ratings: Rating[]
  createdAt: Date
  updatedAt: Date
}
```

### User
```typescript
interface User {
  id: string
  username: string
  email: string
  profile: UserProfile
  nutritionGoals: NutritionGoals
  dietaryRestrictions: string[]
  collections: Collection[]
  createdRecipes: Recipe[]
}
```

### Other Models
- `Ingredient`: Name, quantity, unit, nutritional data
- `Instruction`: Step number, description, duration, media
- `Collection`: User-created recipe groupings
- `MealPlan`: Weekly meal planning data
- `ShoppingList`: Consolidated ingredient lists

## File Structure

```
recipe-builder/
├── public/
├── src/
│   ├── components/
│   │   ├── layout/     # Header, Footer, Sidebar, Navigation
│   │   ├── recipe/     # Recipe display components
│   │   ├── forms/      # Creation and editing forms
│   │   ├── interactive/ # Search, filters, meal planning
│   │   ├── ui/         # Reusable UI components
│   │   └── charts/     # Data visualization
│   ├── pages/          # Route components
│   ├── stores/         # State management
│   ├── lib/            # Utilities and business logic
│   ├── styles/         # CSS organization
│   └── data/           # Sample/mock data
└── [config files]
```

## Development Phases

### Phase 1: Core Infrastructure
- Project setup and routing
- Basic layout components
- Authentication system
- Recipe CRUD operations

### Phase 2: Recipe Management
- Recipe creation wizard
- Recipe display and editing
- Basic search and filtering
- User profiles

### Phase 3: Advanced Features
- Nutrition calculations
- Meal planning
- Shopping lists
- Collections management

### Phase 4: Interactive Features
- Cooking mode
- Real-time updates
- Advanced search
- Social features

### Phase 5: Polish & Optimization
- Performance optimization
- Accessibility improvements
- Mobile responsiveness
- Framework comparison documentation

## Success Metrics

### Functional Goals
- [ ] Complete recipe CRUD operations
- [ ] Real-time nutrition calculations
- [ ] Responsive design across devices
- [ ] Accessible to WCAG standards
- [ ] Smooth 60fps animations

### Comparison Goals
- [ ] Identical functionality across all frameworks
- [ ] Performance benchmarks documented
- [ ] Code complexity analysis
- [ ] Developer experience evaluation
- [ ] Bundle size comparisons

## Integration Points

### Health & Fitness Portal
- Nutrition goal synchronization
- Meal plan integration
- Calorie tracking connection
- Workout nutrition planning

## Backend Architecture

### Option 1: Frontend-Only (Mock Data)
- JSON files for sample data
- LocalStorage for persistence
- Simulated API delays
- Perfect for framework comparison focus

### Option 2: Spring Boot Backend
- RESTful API endpoints
- User authentication (JWT)
- Recipe and user data persistence
- Real-time features via WebSocket
- H2/PostgreSQL database

**Recommendation**: Start with Option 1 for rapid prototyping and framework comparison. Add Spring Boot backend in Phase 4 if real persistence is needed.

## Technical Stack

### Common Dependencies
- TypeScript for type safety
- Custom router (texivia)
- CSS-in-JS or CSS modules
- Chart library for data visualization
- Form validation library
- Date/time utilities

### Framework-Specific
- **Native TypeScript**: Vite, custom DOM utilities, Web Components
- **Svelte**: Vite, Svelte stores + Signals/Effects, SvelteKit (optional)
- **React**: Vite, Context API, native fetch (no React Query)
- **Vue**: Vite, Pinia, Vue Router, Composition API
- **Angular**: Angular CLI, minimal RxJS, PrimeNG UI library

This specification serves as the master reference for implementing the Recipe Builder across multiple frameworks, ensuring consistency and enabling meaningful comparisons.
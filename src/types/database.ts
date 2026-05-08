// Database types for SAZÓN

export type PantryCategory = 'protein' | 'vegetable' | 'dairy' | 'cereal' | 'sauce' | 'spice' | 'fruit' | 'other';

export type RecipeDifficulty = 'easy' | 'medium' | 'hard';

export type MemberRole = 'admin' | 'member';

export interface Family {
  id: string;
  email: string;
  name: string;
  created_at: string;
  settings: Record<string, unknown>;
}

export interface FamilyMember {
  id: string;
  family_id: string;
  name: string;
  avatar_url: string | null;
  role: MemberRole;
  preferences: {
    dislikes: string[];
    allergies: string[];
    goals: string[];
  };
  created_at: string;
}

export interface Session {
  id: string;
  family_id: string;
  device_id: string;
  device_name: string;
  device_type: string;
  last_seen: string;
  is_active: boolean;
  user_agent: string | null;
  created_at: string;
}

export interface PantryItem {
  id: string;
  family_id: string;
  name: string;
  category: PantryCategory;
  quantity: number;
  unit: string;
  expiry_date: string | null;
  barcode: string | null;
  added_by: string | null;
  added_at: string;
  low_threshold: number;
  photo_url: string | null;
}

export interface RecipeIngredient {
  name: string;
  quantity: number | string;
  unit: string;
}

export interface RecipeStep {
  order: number;
  text: string;
  timer_seconds?: number;
}

export interface RecipeMacros {
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  calories?: number;
  servings?: number;
}

export interface Recipe {
  id: string;
  family_id: string;
  title: string;
  description: string | null;
  source_url: string | null;
  cover_photo_url: string | null;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  macros: RecipeMacros;
  tags: string[];
  prep_time_min: number | null;
  difficulty: RecipeDifficulty;
  is_favorite: boolean;
  created_at: string;
  imported_from: string | null;
}

export interface CookHistory {
  id: string;
  family_id: string;
  recipe_id: string;
  cooked_at: string;
  cooked_by_member_id: string | null;
  rating: number | null;
  notes: string | null;
  photo_url: string | null;
}

export interface MealOption {
  id?: string;
  title: string;
  description: string;
  protein_g: number;
  prep_time_min: number;
  difficulty: RecipeDifficulty;
  cover_photo_url?: string;
  missing_ingredients: string[];
  recipe?: Recipe;
}

export interface DailyMenu {
  id: string;
  family_id: string;
  date: string;
  breakfast: MealOption[];
  lunch: MealOption[];
  dinner: MealOption[];
  is_accepted: boolean;
  generated_at: string;
  generation_context: Record<string, unknown> | null;
}

export interface WeeklyPlan {
  id: string;
  family_id: string;
  week_start_date: string;
  plan: Record<string, { lunch_id?: string; dinner_id?: string }>;
  shopping_list: {
    items: ShoppingItem[];
  };
  generated_at: string;
}

export interface ShoppingItem {
  name: string;
  qty: number;
  unit: string;
  category: string;
  checked: boolean;
}

export interface AIFamilyProfile {
  id: string;
  family_id: string;
  taste_vectors: Record<string, number>;
  ingredient_frequencies: Record<string, number>;
  disliked_ingredients: string[];
  preferred_cooking_times: Record<string, unknown>;
  seasonal_preferences: Record<string, unknown>;
  last_updated_at: string;
}

// Tab type
export type TabId = 'hoy' | 'despensa' | 'recetario' | 'familia';

// AI action types for the edge function proxy
export type AIAction = 'generate_briefing' | 'generate_recipe' | 'analyze_fridge' | 'surprise_me';

export interface AIRequest {
  action: AIAction;
  payload: Record<string, unknown>;
}

// Category metadata
export const PANTRY_CATEGORIES: Record<PantryCategory, { label: string; emoji: string; color: string }> = {
  protein: { label: 'Proteínas', emoji: '🥩', color: '#EF4444' },
  vegetable: { label: 'Verduras', emoji: '🥬', color: '#22C55E' },
  dairy: { label: 'Lácteos', emoji: '🧀', color: '#3B82F6' },
  cereal: { label: 'Cereales', emoji: '🌾', color: '#F59E0B' },
  sauce: { label: 'Salsas', emoji: '🫙', color: '#8B5CF6' },
  spice: { label: 'Especias', emoji: '🌶️', color: '#EC4899' },
  fruit: { label: 'Frutas', emoji: '🍎', color: '#F97316' },
  other: { label: 'Otros', emoji: '📦', color: '#6B7280' },
};

export const DIFFICULTY_CONFIG: Record<RecipeDifficulty, { label: string; emoji: string; color: string }> = {
  easy: { label: 'Fácil', emoji: '🟢', color: '#22C55E' },
  medium: { label: 'Medio', emoji: '🟡', color: '#F59E0B' },
  hard: { label: 'Difícil', emoji: '🔴', color: '#EF4444' },
};

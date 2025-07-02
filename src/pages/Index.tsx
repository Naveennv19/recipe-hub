// Import statements
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ChefHat, Salad, UtensilsCrossed, PlusCircle, BookUser, BarChart } from 'lucide-react';
import { FormSection, Input, Select, ChipSelect, RecipeCard } from '@/components/ui/form-components';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

// Supabase Configuration
const supabaseUrl = 'https://cifixxeuilssixjbiggk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpZml4eGV1aWxzc2l4amJpZ2drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NTAyMDIsImV4cCI6MjA2NzAyNjIwMn0.QKm8PwoSh9hspjds-hjSecsEr5sP3tEjVes_eL6s6PI';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const CUISINE_TYPES = ["Italian", "Mexican", "Indian", "Chinese", "Japanese", "French", "Thai", "Spanish", "Greek", "American", "Other"];
const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert", "Brunch"];
const COURSE_TYPES = ["Appetizer", "Main Course", "Side Dish", "Dessert", "Beverage", "Salad"];
const DIFFICULTY_LEVELS = ["Easy", "Medium", "Hard"];
const TASTE_PROFILES = ["Sweet", "Spicy", "Salty", "Sour", "Savory (Umami)", "Bitter", "Rich", "Tangy"];
const INGREDIENT_UNITS = ["cup(s)", "tbsp", "tsp", "g", "kg", "oz", "lb", "ml", "l", "piece(s)", "clove(s)"];
const GROCERY_UNITS = ["kg", "g", "L", "ml", "Pack", "Bottle", "Can", "Bunch", "Item"];
const TIME_UNITS = ["minutes", "hours"];
const SHELF_LIFE_UNITS = ["days", "weeks", "months", "years"];

const initialRecipeState = {
  recipeName: '', cuisineType: 'Italian', mealType: 'Dinner', courseType: 'Main Course',
  difficultyLevel: 'Medium', prepTime: '', prepTimeUnit: 'minutes', cookTime: '', cookTimeUnit: 'minutes',
  servingCount: '', tasteProfile: [], youtubeUrl: ''
};

const initialNutritionalState = {
  calories: '', carbohydrates: '', protein: '', fat: '', fiber: '', sodium: ''
};

const initialIngredientState = {
  name: '', quantity: '', unit: 'cup(s)', groceryItemName: '', groceryItemUnit: 'kg',
  groceryItemMOQ: '', groceryItemShelfLife: '', groceryItemShelfLifeUnit: 'days', conversionRatio: ''
};

const App = () => {
  const [recipe, setRecipe] = useState(initialRecipeState);
  const [nutrition, setNutrition] = useState(initialNutritionalState);
  const [ingredients, setIngredients] = useState([initialIngredientState]);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('form');
  const [session, setSession] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsAuthReady(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const resetForm = () => {
    setRecipe(initialRecipeState);
    setNutrition(initialNutritionalState);
    setIngredients([initialIngredientState]);
  };

  useEffect(() => {
    const storedId = localStorage.getItem('user_id');
    if (storedId) {
      setUserId(storedId);
    } else {
      const newId = crypto.randomUUID();
      localStorage.setItem('user_id', newId);
      setUserId(newId);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    const fetchRecipes = async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select('recipeName, cuisineType, mealType, courseType, difficultyLevel, prepTime, prepTimeUnit, cookTime, cookTimeUnit, servingCount, tasteProfile, youtubeUrl, nutrition, ingredients, createdAt, user_id')
        .eq('user_id', userId)
        .order('createdAt', { ascending: false });
  
      if (error) setError('Failed to fetch recipes.');
      else setSavedRecipes(data);
    };
    fetchRecipes();
  }, [userId]);
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) return;
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    const fullRecipeData = {
      ...recipe,
      nutrition,
      ingredients,
      createdAt: new Date().toISOString(),
      user_id: userId,
    };

    const { error } = await supabase.from('recipes').insert([fullRecipeData]);
    if (error) setError("Failed to save recipe. Please try again.");
    else {
      setSuccessMessage("Recipe saved successfully!");
      resetForm();
      setTimeout(() => setSuccessMessage(''), 3000);
    }
    setIsLoading(false);
  };

  const handleDeleteRecipe = async (recipeId) => {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', recipeId)
      .eq('user_id', userId);
    if (error) setError("Failed to delete recipe.");
    else {
      setSuccessMessage('Recipe deleted successfully!');
      setSavedRecipes(savedRecipes.filter(r => r.id !== recipeId));
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleRecipeChange = (e) => {
    const { name, value } = e.target;
    setRecipe((prev) => ({ ...prev, [name]: value }));
  };

  const handleNutritionChange = (e) => {
    const { name, value } = e.target;
    setNutrition((prev) => ({ ...prev, [name]: value }));
  };

  const handleIngredientChange = (index, e) => {
    const { name, value } = e.target;
    setIngredients((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [name]: value };
      return updated;
    });
  };

  const handleTasteProfileChange = (taste) => {
    setRecipe((prev) => {
      const alreadySelected = prev.tasteProfile.includes(taste);
      const updatedTasteProfile = alreadySelected
        ? prev.tasteProfile.filter((t) => t !== taste)
        : [...prev.tasteProfile, taste];
      return { ...prev, tasteProfile: updatedTasteProfile };
    });
  };

  const addIngredient = () => {
    setIngredients((prev) => [...prev, { ...initialIngredientState }]);
  };

  const removeIngredient = (index) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  if (!isAuthReady) {
    return <div className="p-4 text-center">Loading auth...</div>;
  }

  if (!session) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />
      </div>
    );
  }

  return (
        <div className="bg-gray-50 min-h-screen font-sans text-gray-900">
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <header className="text-center mb-8">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 tracking-tight">Recipe Hub</h1>
                    <p className="mt-2 text-lg text-gray-500">Your personal cookbook, powered by Firebase.</p>
                    {userId && <p className="mt-4 text-xs text-gray-400 font-mono bg-gray-100 px-2 py-1 rounded-md inline-block">User ID: {userId}</p>}
                </header>

                {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md" role="alert">{error}</div>}
                {successMessage && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md" role="alert">{successMessage}</div>}
                
                <div className="bg-white p-2 rounded-xl shadow-inner inline-flex mx-auto mb-8 border border-gray-200">
                     <button onClick={() => setActiveTab('form')} className={`px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'form' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                        Add New Recipe
                     </button>
                     <button onClick={() => setActiveTab('saved')} className={`px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'saved' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                        Saved Recipes ({savedRecipes.length})
                     </button>
                </div>

                {activeTab === 'form' && (
                    <form onSubmit={handleSubmit}>
                        {/* --- Section 1: Recipe Basic Details --- */}
                        <FormSection title="Recipe Details" icon={<ChefHat className="text-indigo-500" />}>
                            <div className="md:col-span-2">
                                <Input label="Recipe Name" name="recipeName" value={recipe.recipeName} onChange={handleRecipeChange} placeholder="e.g., Classic Lasagna" required />
                            </div>
                            <Select label="Cuisine Type" name="cuisineType" value={recipe.cuisineType} onChange={handleRecipeChange}>
                                {CUISINE_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                            </Select>
                            <Select label="Meal Type" name="mealType" value={recipe.mealType} onChange={handleRecipeChange}>
                                {MEAL_TYPES.map(m => <option key={m} value={m}>{m}</option>)}
                            </Select>
                            <Select label="Course Type" name="courseType" value={recipe.courseType} onChange={handleRecipeChange}>
                                {COURSE_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                            </Select>
                            <Select label="Difficulty Level" name="difficultyLevel" value={recipe.difficultyLevel} onChange={handleRecipeChange}>
                                {DIFFICULTY_LEVELS.map(d => <option key={d} value={d}>{d}</option>)}
                            </Select>
                            <div className="flex gap-2">
                                <Input label="Prep Time" name="prepTime" type="number" value={recipe.prepTime} onChange={handleRecipeChange} placeholder="e.g., 30" />
                                <Select label="Unit" name="prepTimeUnit" value={recipe.prepTimeUnit} onChange={handleRecipeChange}>
                                    {TIME_UNITS.map(t => <option key={t} value={t}>{t}</option>)}
                                </Select>
                            </div>
                             <div className="flex gap-2">
                                <Input label="Cook Time" name="cookTime" type="number" value={recipe.cookTime} onChange={handleRecipeChange} placeholder="e.g., 45" />
                                <Select label="Unit" name="cookTimeUnit" value={recipe.cookTimeUnit} onChange={handleRecipeChange}>
                                    {TIME_UNITS.map(t => <option key={t} value={t}>{t}</option>)}
                                </Select>
                            </div>
                            <Input label="Serving Count" name="servingCount" type="number" value={recipe.servingCount} onChange={handleRecipeChange} placeholder="e.g., 4" />
                            <Input label="YouTube URL" name="youtubeUrl" type="url" value={recipe.youtubeUrl} onChange={handleRecipeChange} placeholder="https://youtube.com/watch?v=..." />
                            <ChipSelect label="Taste Profile" options={TASTE_PROFILES} selected={recipe.tasteProfile} onChange={handleTasteProfileChange} />
                        </FormSection>

                        {/* --- Section 2: Nutritional Information --- */}
                        <FormSection title="Nutritional Information (per serving)" icon={<BarChart className="text-green-500" />}>
                            <Input label="Calories (kcal)" name="calories" type="number" value={nutrition.calories} onChange={handleNutritionChange} placeholder="e.g., 550" />
                            <Input label="Carbohydrates (g)" name="carbohydrates" type="number" value={nutrition.carbohydrates} onChange={handleNutritionChange} placeholder="e.g., 45" />
                            <Input label="Protein (g)" name="protein" type="number" value={nutrition.protein} onChange={handleNutritionChange} placeholder="e.g., 30" />
                            <Input label="Fat (g)" name="fat" type="number" value={nutrition.fat} onChange={handleNutritionChange} placeholder="e.g., 25" />
                            <Input label="Fiber (g)" name="fiber" type="number" value={nutrition.fiber} onChange={handleNutritionChange} placeholder="e.g., 8" />
                            <Input label="Sodium (mg)" name="sodium" type="number" value={nutrition.sodium} onChange={handleNutritionChange} placeholder="e.g., 800" />
                        </FormSection>

                        {/* --- Section 3: Ingredients --- */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80 mb-8">
                             <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <Salad className="text-teal-500" />
                                <span className="ml-3">Ingredients & Grocery Mapping</span>
                            </h2>
                            {ingredients.map((ing, index) => (
                                <div key={index} className="grid grid-cols-1 lg:grid-cols-4 gap-x-6 gap-y-4 border-t border-gray-200 py-6 first:border-t-0">
                                    <div className="lg:col-span-4 flex justify-between items-center">
                                        <h3 className="font-semibold text-lg text-gray-700">Ingredient #{index + 1}</h3>
                                        {ingredients.length > 1 && (
                                            <button type="button" onClick={() => removeIngredient(index)} className="text-red-500 hover:text-red-700 transition-colors flex items-center text-sm font-medium">
                                                <PlusCircle size={16} className="mr-1 rotate-45" /> Remove
                                            </button>
                                        )}
                                    </div>
                                    <Input label="Ingredient Name" name="name" value={ing.name} onChange={(e) => handleIngredientChange(index, e)} placeholder="e.g., Onion, chopped" />
                                    <div className="flex gap-2">
                                        <Input label="Quantity" name="quantity" type="number" value={ing.quantity} onChange={(e) => handleIngredientChange(index, e)} placeholder="e.g., 1.5" />
                                        <Select label="Unit" name="unit" value={ing.unit} onChange={(e) => handleIngredientChange(index, e)}>
                                            {INGREDIENT_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                        </Select>
                                    </div>
                                    <Input label="Grocery Item Name" name="groceryItemName" value={ing.groceryItemName} onChange={(e) => handleIngredientChange(index, e)} placeholder="e.g., Yellow Onions" />
                                    <div className="flex gap-2">
                                        <Input label="Grocery MOQ" name="groceryItemMOQ" type="number" value={ing.groceryItemMOQ} onChange={(e) => handleIngredientChange(index, e)} placeholder="e.g., 1" />
                                        <Select label="Unit" name="groceryItemUnit" value={ing.groceryItemUnit} onChange={(e) => handleIngredientChange(index, e)}>
                                            {GROCERY_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                        </Select>
                                    </div>
                                    <div className="flex gap-2">
                                        <Input label="Shelf Life" name="groceryItemShelfLife" type="number" value={ing.groceryItemShelfLife} onChange={(e) => handleIngredientChange(index, e)} placeholder="e.g., 2" />
                                        <Select label="Unit" name="groceryItemShelfLifeUnit" value={ing.groceryItemShelfLifeUnit} onChange={(e) => handleIngredientChange(index, e)}>
                                            {SHELF_LIFE_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                        </Select>
                                    </div>
                                    <Input label="Conversion Ratio" name="conversionRatio" type="number" value={ing.conversionRatio} onChange={(e) => handleIngredientChange(index, e)} placeholder="e.g., 8" />
                                </div>
                            ))}
                            <button type="button" onClick={addIngredient} className="mt-4 flex items-center px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-semibold">
                                <PlusCircle size={20} className="mr-2" /> Add Another Ingredient
                            </button>
                        </div>
                        
                        <div className="flex justify-end items-center gap-4 mt-8">
                             <button type="button" onClick={resetForm} className="px-6 py-3 text-sm font-semibold text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">
                                Clear Form
                            </button>
                            <button type="submit" disabled={isLoading || !isAuthReady} className="px-8 py-3 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center">
                                {isLoading ? (
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : <UtensilsCrossed size={20} className="mr-2"/>}
                                {isLoading ? 'Saving...' : 'Save Recipe'}
                            </button>
                        </div>
                    </form>
                )}
                
                {activeTab === 'saved' && (
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">My Saved Recipes</h2>
                        {savedRecipes.length > 0 ? (
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {savedRecipes.map(r => <RecipeCard key={r.id} r={r} onDelete={handleDeleteRecipe} />)}
                            </div>
                        ) : (
                            <div className="text-center py-16 px-6 bg-white rounded-2xl shadow-sm border border-gray-200/80">
                                <BookUser size={48} className="mx-auto text-gray-400" />
                                <h3 className="mt-4 text-xl font-semibold text-gray-700">No Recipes Yet</h3>
                                <p className="mt-1 text-gray-500">Use the 'Add New Recipe' tab to start building your collection.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default App;

import React, { useState, useEffect } from 'react';
import { RecipeCard, Input, Select } from '../components/ui/form-components';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, MoreHorizontal, BookUser } from 'lucide-react';
import './SavedRecipes.css';
import { supabase } from '../lib/supabaseClient';

// Constants for filter options
const CUISINE_TYPES = [
  "North Indian", "South Indian", "Andhra", "Kerala", "Tamil Nadu", "Chettinad", 
  "Malabar", "⁠Mughlai", "⁠Hyderabadi", "Punjabi", "Bengali", "Mughlai", 
  "⁠Jain", "Sattvic", "⁠Vaishnav", "⁠Udupi", "Rajasthani", "Kashmiri", 
  "Karnataka", "Jain", "Italian", "Mexican", "Chinese", "American", "French", "Thai"
];

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert", "Brunch"];
const COURSE_TYPES = ["Appetizer", "Main Course", "Side Dish", "Dessert", "Beverage", "Salad"];
const TASTE_PROFILES = ["Sweet", "Spicy", "Salty", "Sour", "Savory (Umami)", "Bitter", "Rich", "Tangy"];

// Supabase Configuration
// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// const supabase = createClient(supabaseUrl, supabaseAnonKey);

const SavedRecipes = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [viewType, setViewType] = useState<'grid' | 'table'>('grid');
  const [userId, setUserId] = useState(null);

  // Helper function to parse and display array data
  const parseArrayData = (data: any): string => {
    let parsedData = data;
    
    // Handle JSON string
    if (typeof parsedData === 'string') {
      try {
        const parsed = JSON.parse(parsedData);
        parsedData = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        parsedData = parsedData ? [parsedData] : [];
      }
    }
    
    // Handle array
    if (Array.isArray(parsedData)) {
      const filtered = parsedData.filter(item => item && item.trim() !== '');
      return filtered.length > 0 ? filtered.join(', ') : 'N/A';
    }
    
    // Handle single value
    return parsedData && parsedData.trim() !== '' ? parsedData : 'N/A';
  };

  const [mealTypeFilter, setMealTypeFilter] = useState('');
  const [tasteProfileFilter, setTasteProfileFilter] = useState('');
  const [cuisineTypeFilter, setCuisineTypeFilter] = useState('');
  const [courseTypeFilter, setCourseTypeFilter] = useState('');

  useEffect(() => {
    const getUserId = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        setUserId(session.user.id);
      }
    };
    getUserId();
  }, []);

  useEffect(() => {
    if (!userId) return;
    
    const fetchRecipes = async () => {
        const { data, error } = await supabase.from('recipes').select('*').eq('user_id', userId);
        if (!error) {
          // Sort by updated_at, then created_at, then createAt (descending)
          const sorted = [...data].sort((a, b) => {
            const getTime = (r) => new Date(r.updated_at || r.created_at || r.createAt || 0).getTime();
            return getTime(b) - getTime(a);
          });
          setRecipes(sorted);
        }
    };

    fetchRecipes();
  }, [userId]);

  const deleteRecipe = async (id: string) => {
    await supabase.from('recipes').delete().eq('id', id);
    setRecipes((prev) => prev.filter((r) => r.id !== id));
  };

  const handleEditRecipe = (recipeData: any) => {
    // Store the recipe data in localStorage to pass it to the home page
    localStorage.setItem('editingRecipe', JSON.stringify(recipeData));
    // Navigate to home page where the edit form will be loaded
    navigate('/');
  };

  const filteredRecipes = recipes.filter((r) => {
    const mealMatch = !mealTypeFilter || (Array.isArray(r.mealType) ? r.mealType.includes(mealTypeFilter) : r.mealType === mealTypeFilter);
    const tasteMatch = !tasteProfileFilter || (Array.isArray(r.tasteProfile) ? r.tasteProfile.includes(tasteProfileFilter) : r.tasteProfile === tasteProfileFilter);
    const cuisineMatch = !cuisineTypeFilter || r.cuisineType === cuisineTypeFilter;
    const courseMatch = !courseTypeFilter || r.courseType === courseTypeFilter;
    return mealMatch && tasteMatch && cuisineMatch && courseMatch;
  });

  return (
    <div className="p-6">
      <div className="page-header">
        <div className="flex justify-between items-center">
          <h1 className="page-title">Saved Recipes</h1>
          <div className="header-actions">
            <button
              onClick={() => navigate('/')}
              className="back-btn"
            >
              Home
            </button>
            <button
              onClick={() => setViewType(viewType === 'grid' ? 'table' : 'grid')}
              className="view-toggle-btn"
            >
              Switch to {viewType === 'grid' ? 'Table' : 'Grid'} View
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-select">
            <Select label="Cuisine Type" name="cuisineType" value={cuisineTypeFilter} onChange={(e) => setCuisineTypeFilter(e.target.value)}>
              <option value="">All Cuisines</option>
              {CUISINE_TYPES.map(cuisine => (
                <option key={cuisine} value={cuisine}>{cuisine}</option>
              ))}
            </Select>
          </div>

          <div className="filter-select">
            <Select label="Course Type" name="courseType" value={courseTypeFilter} onChange={(e) => setCourseTypeFilter(e.target.value)}>
              <option value="">All Courses</option>
              {COURSE_TYPES.map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </Select>
          </div>

          <div className="filter-select">
            <Select label="Meal Type" name="mealType" value={mealTypeFilter} onChange={(e) => setMealTypeFilter(e.target.value)}>
              <option value="">All Meals</option>
              {MEAL_TYPES.map(meal => (
                <option key={meal} value={meal}>{meal}</option>
              ))}
            </Select>
          </div>

          <div className="filter-select">
            <Select label="Taste Profile" name="tasteProfile" value={tasteProfileFilter} onChange={(e) => setTasteProfileFilter(e.target.value)}>
              <option value="">All Tastes</option>
              {TASTE_PROFILES.map(taste => (
                <option key={taste} value={taste}>{taste}</option>
              ))}
            </Select>
          </div>
        </div>

        {/* Clear Filters Button */}
        {(cuisineTypeFilter || courseTypeFilter || mealTypeFilter || tasteProfileFilter) && (
          <div className="mt-4">
            <button
              onClick={() => {
                setCuisineTypeFilter('');
                setCourseTypeFilter('');
                setMealTypeFilter('');
                setTasteProfileFilter('');
              }}
              className="clear-filters-btn"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Grid or Table view */}
      {viewType === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <div key={recipe.id}>
              <RecipeCard
                r={recipe}
                onDelete={deleteRecipe}
                onClick={() => handleEditRecipe(recipe)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="recipes-table-container overflow-x-auto">
          <table className="recipes-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Cuisine Type</th>
                <th>Course Type</th>
                <th>Meal Type</th>
                <th>Taste Profile</th>
                <th>Calories</th>
                <th>Ingredients</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecipes.map((r, index) => (
                <tr key={r.id}>
                  <td className="text-center font-medium text-gray-600">{index + 1}</td>
                  <td className="recipe-name">{r.recipeName}</td>
                  <td>{r.cuisineType || 'N/A'}</td>
                  <td>{r.courseType || 'N/A'}</td>
                  <td>{parseArrayData(r.mealType)}</td>
                  <td>{parseArrayData(r.tasteProfile)}</td>
                  <td className="font-medium">{r.nutrition?.calories ?? 'N/A'} kcal</td>
                  <td className="text-center">{r.ingredients?.length ?? 0}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleEditRecipe(r)}
                        className="edit-btn"
                        title="Edit Recipe"
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => deleteRecipe(r.id)}
                        className="delete-btn"
                        title="Delete Recipe"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRecipes.length === 0 && (
                <tr>
                  <td colSpan={9} className="empty-state">
                    <div className="empty-state-icon">
                      <BookUser size={24} className="text-gray-400" />
                    </div>
                    <p className="empty-state-title">No recipes found</p>
                    <p className="empty-state-subtitle">Try adjusting your filters or add some recipes</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SavedRecipes;

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Coffee, DollarSign, TrendingUp } from 'lucide-react';
import { recipeService } from '../services/api';

const Recipes = ({ refreshTrigger, onUpdate }) => {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecipes();
  }, [refreshTrigger]);

  useEffect(() => {
    filterRecipes();
  }, [searchTerm, recipes]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const data = await recipeService.getAll();
      setRecipes(data);
      setFilteredRecipes(data);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      alert('Failed to load recipes');
    } finally {
      setLoading(false);
    }
  };

  const filterRecipes = () => {
    if (!searchTerm) {
      setFilteredRecipes(recipes);
      return;
    }
    const filtered = recipes.filter((recipe) =>
      recipe.drinkName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRecipes(filtered);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) return;
    try {
      await recipeService.delete(id);
      fetchRecipes();
      onUpdate();
    } catch (error) {
      console.error('Error deleting recipe:', error);
      alert('Failed to delete recipe');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Coffee className="w-16 h-16 text-coffee-600 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-coffee-900">Recipe Management</h1>
          <p className="text-coffee-600 mt-2">Create and manage your coffee recipes with automatic costing</p>
        </div>
        <Link to="/recipes/new" className="btn-primary flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Create Recipe</span>
        </Link>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-coffee-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Recipes Grid */}
      {filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="card text-center py-16">
          <Coffee className="w-20 h-20 text-coffee-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-coffee-900 mb-2">No recipes found</h3>
          <p className="text-coffee-600 mb-6">
            {searchTerm ? 'Try a different search term' : 'Get started by creating your first recipe'}
          </p>
          {!searchTerm && (
            <Link to="/recipes/new" className="btn-primary inline-flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Create First Recipe</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

const RecipeCard = ({ recipe, onDelete }) => {
  const getComplexityColor = (level) => {
    switch (level) {
      case 'Simple':
        return 'bg-green-100 text-green-800';
      case 'Moderate':
        return 'bg-blue-100 text-blue-800';
      case 'Complex':
        return 'bg-orange-100 text-orange-800';
      case 'Very Complex':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  return (
    <div className="card group hover:shadow-2xl transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-coffee-900 mb-2 group-hover:text-coffee-700 transition-colors">
            {recipe.drinkName}
          </h3>
          <div className="flex flex-wrap gap-2">
            <span className={`badge ${getComplexityColor(recipe.complexityLevel)}`}>
              {recipe.complexityLevel}
            </span>
            <span className="badge badge-info">{recipe.pricingCategory}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between py-2 border-b border-coffee-100">
          <span className="text-sm text-coffee-600">Ingredients</span>
          <span className="font-semibold text-coffee-900">{recipe.ingredients.length}</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-coffee-100">
          <span className="text-sm text-coffee-600">Total Cost</span>
          <span className="font-mono text-coffee-900">${recipe.totalCost?.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-sm font-medium text-coffee-700 flex items-center">
            <DollarSign className="w-4 h-4 mr-1" />
            Selling Price
          </span>
          <span className="text-xl font-bold text-coffee-900">
            ${recipe.suggestedSellingPrice?.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-green-800 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" />
            Profit Margin
          </span>
          <span className="text-lg font-bold text-green-900">
            {recipe.actualMarginPercent?.toFixed(1)}%
          </span>
        </div>
        <p className="text-xs text-green-700 mt-1">
          Gross Profit: ${recipe.grossProfit?.toFixed(2)}
        </p>
      </div>

      <div className="flex space-x-2">
        <Link
          to={`/recipes/${recipe.id}`}
          className="flex-1 bg-coffee-600 text-white py-2 rounded-lg font-medium text-center hover:bg-coffee-700 transition-colors"
        >
          View Details
        </Link>
        <button
          onClick={() => onDelete(recipe.id)}
          className="px-4 py-2 bg-red-100 text-red-600 rounded-lg font-medium hover:bg-red-200 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default Recipes;
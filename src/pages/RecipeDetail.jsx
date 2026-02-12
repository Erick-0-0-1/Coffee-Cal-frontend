import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Coffee, DollarSign, TrendingUp, Trash2, ArrowRight } from 'lucide-react';
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

  const handleDelete = async (e, id) => {
    e.preventDefault(); // Prevent navigating to details when clicking delete
    if (!window.confirm('Are you sure you want to delete this recipe?')) return;
    try {
      await recipeService.delete(id);
      fetchRecipes();
      if (onUpdate) onUpdate();
    } catch (error) {
      alert('Failed to delete recipe');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1c1917]">
        <Coffee className="w-16 h-16 text-[#d4a373] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1c1917] text-stone-200 font-sans p-4 md:p-8 pb-24">

      {/* HEADER SECTION */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#d4a373]">Recipes</h1>
            <p className="text-stone-400 text-sm mt-1">Menu engineering and profit analysis.</p>
          </div>

          <Link
            to="/recipes/new"
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#9c4221] hover:bg-[#7c3218] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95"
          >
            <Plus size={20} />
            <span>Create Recipe</span>
          </Link>
        </div>

        {/* SEARCH BAR */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-stone-900 border border-stone-800 text-stone-200 pl-12 pr-4 py-3.5 rounded-xl focus:border-[#d4a373] outline-none transition-colors shadow-sm"
          />
        </div>

        {/* RECIPES GRID */}
        {filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecipes.map((recipe) => (
              <Link
                to={`/recipes/${recipe.id}`}
                key={recipe.id}
                className="block group relative bg-stone-900/40 border border-stone-800 rounded-2xl overflow-hidden hover:border-[#d4a373]/50 transition-all hover:shadow-xl active:scale-[0.98]"
              >
                {/* Card Header */}
                <div className="p-5 border-b border-stone-800/50">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-stone-100 group-hover:text-[#d4a373] transition-colors">
                      {recipe.drinkName}
                    </h3>
                    <ComplexityBadge level={recipe.complexityLevel} />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded bg-stone-800 text-stone-400 border border-stone-700">
                    {recipe.pricingCategory || 'Uncategorized'}
                  </span>
                </div>

                {/* Card Stats Grid */}
                <div className="grid grid-cols-3 divide-x divide-stone-800/50 bg-stone-950/30">
                  <div className="p-3 text-center">
                    <p className="text-[10px] text-stone-500 uppercase tracking-wider">Cost</p>
                    <p className="text-stone-300 font-mono text-sm">₱{recipe.totalCost?.toFixed(0)}</p>
                  </div>
                  <div className="p-3 text-center">
                    <p className="text-[10px] text-stone-500 uppercase tracking-wider">Price</p>
                    <p className="text-white font-bold font-mono text-sm">₱{recipe.suggestedSellingPrice?.toFixed(0)}</p>
                  </div>
                  <div className="p-3 text-center bg-stone-900/50">
                    <p className="text-[10px] text-stone-500 uppercase tracking-wider">Margin</p>
                    <p className={`font-bold font-mono text-sm ${recipe.actualMarginPercent >= 70 ? 'text-emerald-400' : recipe.actualMarginPercent >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {recipe.actualMarginPercent?.toFixed(0)}%
                    </p>
                  </div>
                </div>

                {/* Profit Section */}
                <div className="p-4 flex items-center justify-between bg-gradient-to-r from-stone-900 to-transparent">
                  <div className="flex items-center gap-2 text-emerald-500/80">
                    <TrendingUp size={16} />
                    <span className="text-xs font-medium">Profit: ₱{recipe.grossProfit?.toFixed(2)}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => handleDelete(e, recipe.id)}
                      className="p-2 text-stone-600 hover:text-red-400 hover:bg-red-900/20 rounded-full transition-colors z-10"
                    >
                      <Trash2 size={18} />
                    </button>
                    <div className="p-2 text-stone-500 group-hover:text-[#d4a373] transition-colors">
                      <ArrowRight size={18} />
                    </div>
                  </div>
                </div>

              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-stone-500 bg-stone-900/20 rounded-2xl border border-stone-800 border-dashed">
            <Coffee className="w-16 h-16 mb-4 opacity-20" />
            <h3 className="text-lg font-semibold text-stone-400">No recipes found</h3>
            <p className="text-sm mb-6">Create your first drink to see the magic.</p>
            {!searchTerm && (
              <Link to="/recipes/new" className="text-[#d4a373] hover:underline flex items-center gap-2">
                <Plus size={16} /> Create First Recipe
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper Component for the Badge color logic
const ComplexityBadge = ({ level }) => {
  let colorClass = 'bg-stone-800 text-stone-400 border-stone-700'; // Default

  if (level === 'Simple') colorClass = 'bg-emerald-900/30 text-emerald-400 border-emerald-900/50';
  if (level === 'Moderate') colorClass = 'bg-blue-900/30 text-blue-400 border-blue-900/50';
  if (level === 'Complex') colorClass = 'bg-amber-900/30 text-amber-400 border-amber-900/50';
  if (level === 'Very Complex') colorClass = 'bg-red-900/30 text-red-400 border-red-900/50';

  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${colorClass}`}>
      {level}
    </span>
  );
};

export default Recipes;
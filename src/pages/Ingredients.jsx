import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Package, X } from 'lucide-react';
import { ingredientService } from '../services/api';

const Ingredients = ({ onUpdate }) => {
  // --- 1. STATE MANAGEMENT ---
  const [ingredients, setIngredients] = useState([]);
  const [filteredIngredients, setFilteredIngredients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All'); // Added for the category buttons
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Beans',
    baseUnit: 'g',
    packSize: '',
    packPrice: '',
    notes: '',
  });

  const categories = ['All', 'Beans', 'Milk', 'Syrup', 'Powder', 'Sauce', 'Topping', 'Packaging'];

  // --- 2. EFFECTS ---
  useEffect(() => {
    fetchIngredients();
  }, []);

  // Re-run filter when search, category, or list changes
  useEffect(() => {
    filterIngredients();
  }, [searchTerm, activeFilter, ingredients]);

  // --- 3. API FUNCTIONS ---
  const fetchIngredients = async () => {
    try {
      setLoading(true);
      const data = await ingredientService.getAll();
      setIngredients(data);
      setFilteredIngredients(data);
    } catch (error) {
      console.error('Error fetching ingredients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterIngredients = () => {
    let result = ingredients;

    // Filter by Category Button
    if (activeFilter !== 'All') {
      result = result.filter(item => item.category === activeFilter);
    }

    // Filter by Search Term
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(
        (ing) =>
          ing.name.toLowerCase().includes(lowerTerm) ||
          ing.category.toLowerCase().includes(lowerTerm)
      );
    }

    setFilteredIngredients(result);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...formData,
        packSize: parseFloat(formData.packSize),
        packPrice: parseFloat(formData.packPrice),
      };

      if (editingId) {
        await ingredientService.update(editingId, dataToSubmit);
      } else {
        await ingredientService.create(dataToSubmit);
      }

      setShowModal(false);
      resetForm();
      fetchIngredients();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error saving ingredient:', error);
      alert('Failed to save ingredient');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this ingredient?')) return;
    try {
      await ingredientService.delete(id);
      fetchIngredients();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      alert('Failed to delete ingredient');
    }
  };

  const handleEdit = (ingredient) => {
    setFormData({
      name: ingredient.name,
      category: ingredient.category,
      baseUnit: ingredient.baseUnit,
      packSize: ingredient.packSize.toString(),
      packPrice: ingredient.packPrice.toString(),
      notes: ingredient.notes || '',
    });
    setEditingId(ingredient.id);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Beans',
      baseUnit: 'g',
      packSize: '',
      packPrice: '',
      notes: '',
    });
    setEditingId(null);
  };

  // --- 4. RENDER ---
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1c1917]">
        <Package className="w-16 h-16 text-[#d4a373] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1c1917] text-stone-200 p-4 md:p-8 font-sans">

      {/* HEADER */}
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#d4a373]">Inventory Items</h1>
            <p className="text-stone-400 text-sm mt-1">Manage your stock and pricing.</p>
          </div>

          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#9c4221] hover:bg-[#7c3218] text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg active:scale-95"
          >
            <Plus size={20} />
            <span>Add Ingredient</span>
          </button>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="flex flex-col gap-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search ingredients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-stone-900 border border-stone-700 text-stone-200 pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-[#d4a373] transition-colors"
            />
          </div>

          {/* Category Buttons (Scrollable) */}
          <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                  activeFilter === cat
                    ? 'bg-[#d4a373] text-[#1c1917] border-[#d4a373]'
                    : 'bg-stone-900/50 text-stone-400 border-stone-700 hover:border-stone-500'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="bg-stone-900/40 rounded-xl border border-stone-800 overflow-hidden">

          {/* A. DESKTOP VIEW (Table) */}
          <div className="hidden md:block">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-stone-900/80 text-stone-500 text-xs uppercase tracking-wider border-b border-stone-800">
                  <th className="p-4">Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Pack Info</th>
                  <th className="p-4">Cost/Unit</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {filteredIngredients.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-800/30 transition-colors">
                    <td className="p-4 font-medium text-stone-200">{item.name}</td>
                    <td className="p-4">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-stone-800 text-stone-400 border border-stone-700">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-4 text-stone-400">
                      {item.packSize} {item.baseUnit} • ₱{item.packPrice?.toFixed(2)}
                    </td>
                    <td className="p-4 text-amber-500 font-mono">
                      ₱{item.costPerBaseUnit?.toFixed(4)} / {item.baseUnit}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(item)} className="p-2 text-blue-400 hover:bg-blue-900/20 rounded-lg transition-colors">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* B. MOBILE VIEW (Cards) */}
          <div className="md:hidden flex flex-col divide-y divide-stone-800">
            {filteredIngredients.map((item) => (
              <div key={item.id} className="p-4 flex flex-col gap-3 active:bg-stone-800/40 transition-colors">
                {/* Top Row */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-stone-200">{item.name}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-stone-800 text-stone-400 border border-stone-700 mt-1 inline-block">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(item)} className="p-2 text-stone-500 hover:text-blue-400">
                      <Edit2 size={20} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 text-stone-500 hover:text-red-400">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="bg-stone-950/50 p-2 rounded border border-stone-800/50">
                    <p className="text-xs text-stone-500 mb-1">Pack Size</p>
                    <p className="text-stone-300 font-medium">{item.packSize} {item.baseUnit}</p>
                  </div>
                  <div className="bg-stone-950/50 p-2 rounded border border-stone-800/50">
                    <p className="text-xs text-stone-500 mb-1">Unit Cost</p>
                    <p className="text-amber-500 font-mono font-medium">₱{item.costPerBaseUnit?.toFixed(4)}</p>
                  </div>
                </div>
              </div>
            ))}
             {filteredIngredients.length === 0 && (
              <div className="p-12 text-center text-stone-500">
                <Package size={48} className="mx-auto mb-3 opacity-20" />
                <p>No ingredients found.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- MODAL (Dark Theme) --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1c1917] border border-stone-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#d4a373]">
                  {editingId ? 'Edit Ingredient' : 'New Ingredient'}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-stone-500 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-stone-400 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-stone-900 border border-stone-700 text-white rounded-lg p-3 focus:border-[#d4a373] focus:outline-none"
                    placeholder="e.g. Arabica Beans"
                  />
                </div>

                {/* Category & Unit */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-400 mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-stone-900 border border-stone-700 text-white rounded-lg p-3 focus:border-[#d4a373] focus:outline-none"
                    >
                      {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-400 mb-1">Base Unit</label>
                    <select
                      value={formData.baseUnit}
                      onChange={(e) => setFormData({ ...formData, baseUnit: e.target.value })}
                      className="w-full bg-stone-900 border border-stone-700 text-white rounded-lg p-3 focus:border-[#d4a373] focus:outline-none"
                    >
                      <option value="g">Grams (g)</option>
                      <option value="ml">Milliliters (ml)</option>
                      <option value="pc">Pieces (pc)</option>
                    </select>
                  </div>
                </div>

                {/* Price & Size */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-400 mb-1">Pack Size</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={formData.packSize}
                      onChange={(e) => setFormData({ ...formData, packSize: e.target.value })}
                      className="w-full bg-stone-900 border border-stone-700 text-white rounded-lg p-3 focus:border-[#d4a373] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-400 mb-1">Pack Price (₱)</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={formData.packPrice}
                      onChange={(e) => setFormData({ ...formData, packPrice: e.target.value })}
                      className="w-full bg-stone-900 border border-stone-700 text-white rounded-lg p-3 focus:border-[#d4a373] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-stone-800 text-stone-300 rounded-lg hover:bg-stone-700 font-semibold">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 py-3 bg-[#9c4221] text-white rounded-lg hover:bg-[#7c3218] font-semibold">
                    {editingId ? 'Save Changes' : 'Add Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Ingredients;
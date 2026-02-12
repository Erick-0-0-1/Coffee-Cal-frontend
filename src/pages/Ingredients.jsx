import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Package, X, ChevronDown } from 'lucide-react';
import { ingredientService } from '../services/api';

const Ingredients = ({ onUpdate }) => {
  // --- STATE ---
  const [ingredients, setIngredients] = useState([]);
  const [filteredIngredients, setFilteredIngredients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
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

  // --- EFFECTS ---
  useEffect(() => {
    fetchIngredients();
  }, []);

  useEffect(() => {
    filterIngredients();
  }, [searchTerm, activeFilter, ingredients]);

  // --- ACTIONS ---
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
    if (activeFilter !== 'All') {
      result = result.filter(item => item.category === activeFilter);
    }
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter((ing) =>
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
      alert('Failed to save ingredient');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await ingredientService.delete(id);
      fetchIngredients();
      if (onUpdate) onUpdate();
    } catch (error) {
      alert('Failed to delete');
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
    setFormData({ name: '', category: 'Beans', baseUnit: 'g', packSize: '', packPrice: '', notes: '' });
    setEditingId(null);
  };

  // --- UI RENDER ---
  if (loading) return <div className="flex justify-center items-center h-screen bg-[#1c1917]"><Package className="animate-pulse text-[#d4a373]" /></div>;

  return (
    <div className="min-h-screen bg-[#1c1917] text-stone-200 font-sans pb-24">

      {/* HEADER & CONTROLS */}
      <div className="sticky top-0 z-30 bg-[#1c1917]/95 backdrop-blur-sm border-b border-stone-800 p-4 shadow-lg">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-[#d4a373]">Inventory</h1>
            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="bg-[#9c4221] text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg active:scale-95 flex items-center gap-2"
            >
              <Plus size={18} /> Add Item
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-stone-900 border border-stone-700 text-stone-200 pl-9 pr-4 py-2.5 rounded-lg text-sm focus:border-[#d4a373] outline-none"
            />
          </div>

          <div className="flex overflow-x-auto gap-2 pb-1 no-scrollbar -mx-4 px-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  activeFilter === cat ? 'bg-[#d4a373] text-[#1c1917] border-[#d4a373]' : 'bg-stone-900 border-stone-700 text-stone-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT LIST */}
      <div className="max-w-4xl mx-auto p-4 space-y-3">
        {filteredIngredients.map((item) => (
          <div key={item.id} className="bg-stone-900/50 border border-stone-800 rounded-xl p-4 flex flex-col gap-3 shadow-sm active:border-[#d4a373]/30 transition-colors">
            {/* Top Row: Name & Action */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-base text-stone-100">{item.name}</h3>
                <span className="text-[10px] uppercase tracking-wider text-stone-500 bg-stone-950 px-2 py-0.5 rounded mt-1 inline-block border border-stone-800">
                  {item.category}
                </span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(item)} className="p-2 text-stone-500 hover:text-blue-400 active:bg-stone-800 rounded-lg"><Edit2 size={18} /></button>
                <button onClick={() => handleDelete(item.id)} className="p-2 text-stone-500 hover:text-red-400 active:bg-stone-800 rounded-lg"><Trash2 size={18} /></button>
              </div>
            </div>

            {/* Bottom Row: Stats */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-stone-950/30 p-2.5 rounded-lg border border-stone-800/50">
                <p className="text-xs text-stone-500">Pack</p>
                <p className="font-medium text-stone-300">{item.packSize}{item.baseUnit} • ₱{item.packPrice}</p>
              </div>
              <div className="bg-stone-950/30 p-2.5 rounded-lg border border-stone-800/50">
                <p className="text-xs text-stone-500">Unit Cost</p>
                <p className="font-mono text-amber-500">₱{item.costPerBaseUnit?.toFixed(4)}/{item.baseUnit}</p>
              </div>
            </div>
          </div>
        ))}

        {filteredIngredients.length === 0 && (
          <div className="text-center py-12 text-stone-500">
            <Package className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p>No items found</p>
          </div>
        )}
      </div>

      {/* MOBILE OPTIMIZED MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />

          <div className="relative w-full max-w-lg bg-[#1c1917] md:rounded-2xl rounded-t-2xl border-t md:border border-stone-700 shadow-2xl max-h-[90vh] flex flex-col animate-slide-up">

            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-stone-800 bg-[#1c1917] rounded-t-2xl">
              <h2 className="text-lg font-bold text-[#d4a373]">{editingId ? 'Edit Item' : 'New Item'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 text-stone-400 hover:text-white"><X size={24} /></button>
            </div>

            {/* Modal Form - Scrollable */}
            <div className="overflow-y-auto p-4 space-y-5 pb-32"> {/* Big padding bottom for keyboard */}

              <div className="space-y-1">
                <label className="text-xs font-medium text-stone-400 uppercase">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Full Cream Milk"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-700 text-white rounded-lg px-4 h-12 text-lg focus:border-[#d4a373] outline-none"
                />
              </div>

              {/* Stack Category and Unit on Mobile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-400 uppercase">Category</label>
                  <div className="relative">
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-stone-900 border border-stone-700 text-white rounded-lg px-4 h-12 appearance-none focus:border-[#d4a373] outline-none"
                    >
                      {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" size={16} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-400 uppercase">Base Unit</label>
                  <div className="relative">
                    <select
                      value={formData.baseUnit}
                      onChange={(e) => setFormData({ ...formData, baseUnit: e.target.value })}
                      className="w-full bg-stone-900 border border-stone-700 text-white rounded-lg px-4 h-12 appearance-none focus:border-[#d4a373] outline-none"
                    >
                      <option value="g">Grams (g)</option>
                      <option value="ml">Milliliters (ml)</option>
                      <option value="pc">Pieces (pc)</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" size={16} />
                  </div>
                </div>
              </div>

              {/* Price Calculation Section */}
              <div className="p-4 bg-stone-900/50 border border-stone-800 rounded-xl space-y-4">
                <p className="text-xs font-bold text-[#d4a373] uppercase tracking-widest">Purchase Details</p>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-400">Pack Size (Qty)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 1000"
                    value={formData.packSize}
                    onChange={(e) => setFormData({ ...formData, packSize: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-700 text-white rounded-lg px-4 h-12 focus:border-[#d4a373] outline-none"
                  />
                  <p className="text-[10px] text-stone-500">Enter "1000" for 1 Liter / 1 Kg</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-400">Total Price (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 120"
                    value={formData.packPrice}
                    onChange={(e) => setFormData({ ...formData, packPrice: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-700 text-white rounded-lg px-4 h-12 focus:border-[#d4a373] outline-none"
                  />
                </div>
              </div>

            </div>

            {/* Sticky Footer Button */}
            <div className="border-t border-stone-800 p-4 bg-[#1c1917] pb-8 md:pb-4 rounded-b-2xl">
              <button
                onClick={handleSubmit}
                className="w-full bg-[#d4a373] hover:bg-[#b08968] text-[#1c1917] h-14 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform"
              >
                {editingId ? 'Update Item' : 'Save Item'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Ingredients;
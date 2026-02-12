import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Package } from 'lucide-react';
import { ingredientService } from '../services/api';

const Ingredients = ({ onUpdate }) => {
  const [ingredients, setIngredients] = useState([]);
  const [filteredIngredients, setFilteredIngredients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
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

  useEffect(() => {
    fetchIngredients();
  }, []);

  useEffect(() => {
    filterIngredients();
  }, [searchTerm, ingredients]);

  const fetchIngredients = async () => {
    try {
      setLoading(true);
      const data = await ingredientService.getAll();
      setIngredients(data);
      setFilteredIngredients(data);
    } catch (error) {
      console.error('Error fetching ingredients:', error);
      alert('Failed to load ingredients');
    } finally {
      setLoading(false);
    }
  };

  const filterIngredients = () => {
    if (!searchTerm) {
      setFilteredIngredients(ingredients);
      return;
    }
    const filtered = ingredients.filter(
      (ing) =>
        ing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ing.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredIngredients(filtered);
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
      onUpdate();
    } catch (error) {
      console.error('Error saving ingredient:', error);
      alert('Failed to save ingredient');
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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this ingredient?')) return;
    try {
      await ingredientService.delete(id);
      fetchIngredients();
      onUpdate();
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      alert('Failed to delete ingredient');
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Package className="w-16 h-16 text-coffee-600 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-coffee-900">Supplies Management</h1>
          <p className="text-coffee-600 mt-2">Manage your coffee ingredients and pricing</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Ingredient</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-coffee-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search ingredients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Ingredients Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-coffee-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-coffee-900">Ingredient</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-coffee-900">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-coffee-900">Pack Size</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-coffee-900">Pack Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-coffee-900">Cost/Unit</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-coffee-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-coffee-100">
              {filteredIngredients.map((ingredient) => (
                <tr key={ingredient.id} className="hover:bg-coffee-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-coffee-900">{ingredient.name}</td>
                  <td className="px-6 py-4">
                    <span className="badge badge-primary">{ingredient.category}</span>
                  </td>
                  <td className="px-6 py-4 text-coffee-700">
                    {ingredient.packSize} {ingredient.baseUnit}
                  </td>
                  <td className="px-6 py-4 font-semibold text-coffee-900">
                    ₱{ingredient.packPrice?.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-coffee-700">
                    ₱{ingredient.costPerBaseUnit?.toFixed(4)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleEdit(ingredient)}
                        className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(ingredient.id)}
                        className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredIngredients.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-coffee-300 mx-auto mb-4" />
              <p className="text-coffee-600">No ingredients found</p>
            </div>
          )}
        </div>
      </div>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <h2 className="text-2xl font-bold text-coffee-900 mb-6">
              {editingId ? 'Edit Ingredient' : 'Add New Ingredient'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Ingredient Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Coffee Beans"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-field"
                  >
                    <option value="Beans">Beans</option>
                    <option value="Milk">Milk</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Packaging">Packaging</option>
                    <option value="Sauce">Sauce</option>
                    <option value="Powder">Powder</option>
                    <option value="Topping">Topping</option>
                  </select>
                </div>

                <div>
                  <label className="label">Base Unit</label>
                  <select
                    value={formData.baseUnit}
                    onChange={(e) => setFormData({ ...formData, baseUnit: e.target.value })}
                    className="input-field"
                  >
                    <option value="g">Grams (g)</option>
                    <option value="ml">Milliliters (ml)</option>
                    <option value="pc">Pieces (pc)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Pack Size</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.packSize}
                    onChange={(e) => setFormData({ ...formData, packSize: e.target.value })}
                    className="input-field"
                    placeholder="e.g., 1000"
                  />
                </div>

                <div>
                  <label className="label">Pack Price ($)</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.packPrice}
                    onChange={(e) => setFormData({ ...formData, packPrice: e.target.value })}
                    className="input-field"
                    placeholder="e.g., 1399.00"
                  />
                </div>
              </div>

              <div>
                <label className="label">Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input-field"
                  rows="3"
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingId ? 'Update' : 'Create'} Ingredient
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ingredients;
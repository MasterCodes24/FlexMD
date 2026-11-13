"use client";

import { useEffect, useState } from "react";
import {
  Search, Plus, AlertTriangle, Package, X, Loader2, Sparkles, Minus, CheckCircle2, AlertCircle
} from "lucide-react";
import { inventoryApi, type InventoryItem } from "../../src/lib/api";

const CATEGORY_OPTIONS = ["Medicine", "Consumable", "Equipment", "Other"];

interface AiInsight {
  insight_text: string;
  items_to_reorder: string[];
  batches_expiring_soon: string[];
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [aiInsight, setAiInsight] = useState<AiInsight | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", category: "Medicine", unit: "Strips", quantity: "", threshold: "" });
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchInventory = () => {
    inventoryApi.listRaw()
      .then((json: { ok: boolean; data: InventoryItem[]; aiInsight: AiInsight | null }) => {
        setItems(json.data ?? []);
        setAiInsight(json.aiInsight ?? null);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const filtered = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItems = items.length;
  const totalUnits = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const lowStockCount = items.filter((item) => item.quantity > 0 && item.quantity <= item.threshold).length;
  const outOfStockCount = items.filter((item) => Number(item.quantity) === 0).length;

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddItem = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const newItem = await inventoryApi.create({
        name: form.name.trim(),
        category: form.category,
        unit: form.unit,
        quantity: Number(form.quantity) || 0,
        threshold: Number(form.threshold) || 0,
      });
      setItems((prev) => [newItem, ...prev]);
      setForm({ name: "", category: "Medicine", unit: "Strips", quantity: "", threshold: "" });
      setShowModal(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to add item.");
    } finally {
      setSaving(false);
    }
  };

  // Quick count adjusters right inside the table
  const handleQuickAdjust = async (item: InventoryItem, delta: number) => {
    const newQty = Math.max(0, Number(item.quantity) + delta);
    setUpdatingId(item.id);
    try {
      const updated = await inventoryApi.updateQty(item.id, newQty);
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, quantity: updated.quantity, low_stock: updated.low_stock } : i))
      );
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to update quantity.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory & Pharmacy Stock</h1>
          <p className="text-sm text-gray-500">Track medicine counts left. Automatically reduced when prescribed to patients.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Item
        </button>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

      {/* Stock Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Items</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalItems}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Units in Stock</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{totalUnits.toLocaleString("en-IN")}</p>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-full">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Low Stock Items</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{lowStockCount}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-full">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Out of Stock</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{outOfStockCount}</p>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-full">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* AI Insight */}
      {aiInsight?.insight_text && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-lg border border-green-100 shadow-sm">
          <div className="flex items-center mb-2">
            <Sparkles className="w-5 h-5 text-green-600 mr-2" />
            <h3 className="text-sm font-bold text-green-900 uppercase tracking-wide">AI Inventory Intelligence</h3>
          </div>
          <p className="text-sm text-green-800 leading-relaxed font-medium">{aiInsight.insight_text}</p>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm text-gray-900"
          placeholder="Search medicines or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Inventory Table with Prominent Count Left */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Item Name</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">How Much Count is Left</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reorder Level</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Quick Adjust</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((item) => {
                const isOutOfStock = Number(item.quantity) === 0;
                const isLow = Number(item.quantity) > 0 && Number(item.quantity) <= Number(item.threshold);

                return (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    {/* Item Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-semibold text-gray-900">{item.name}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                        {item.category}
                      </span>
                    </td>

                    {/* Prominent Count Left */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className={`text-base font-extrabold ${
                          isOutOfStock ? "text-red-600" : isLow ? "text-amber-600" : "text-gray-900"
                        }`}>
                          {item.quantity} {item.unit} left
                        </span>

                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 animate-pulse">
                            <AlertCircle className="w-3 h-3" /> Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                            <AlertTriangle className="w-3 h-3" /> Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Healthy
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Threshold */}
                    <td className="px-6 py-4 text-sm text-gray-500">
                      Min {item.threshold} {item.unit}
                    </td>

                    {/* Quick Adjust Buttons */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleQuickAdjust(item, -1)}
                          disabled={updatingId === item.id || Number(item.quantity) === 0}
                          title="Deduct 1 unit"
                          className="p-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleQuickAdjust(item, 1)}
                          disabled={updatingId === item.id}
                          title="Add 1 unit"
                          className="px-2 py-1 rounded-md border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-40 transition-colors"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => handleQuickAdjust(item, 10)}
                          disabled={updatingId === item.id}
                          title="Restock +10 units"
                          className="px-2 py-1 rounded-md bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-40 transition-colors"
                        >
                          +10
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">
                    {searchTerm ? `No items matching "${searchTerm}".` : "No inventory items yet. Click '+ Add Item' above to track stock."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Item Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">Add New Stock Item</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medicine / Item Name</label>
                <input type="text" name="name" value={form.name} onChange={handleFormChange}
                  placeholder="e.g. Paracetamol 650mg, Dolo 650, Pan-D"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select name="category" value={form.category} onChange={handleFormChange}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white">
                  {CATEGORY_OPTIONS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Type</label>
                <input type="text" name="unit" value={form.unit} onChange={handleFormChange}
                  placeholder="e.g. Strips, Bottles, Vials, Tablets"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Initial Stock Count</label>
                  <input type="number" name="quantity" value={form.quantity} onChange={handleFormChange} min={0}
                    placeholder="e.g. 50"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Alert Level</label>
                  <input type="number" name="threshold" value={form.threshold} onChange={handleFormChange} min={0}
                    placeholder="e.g. 15"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button onClick={handleAddItem} disabled={saving || !form.name.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

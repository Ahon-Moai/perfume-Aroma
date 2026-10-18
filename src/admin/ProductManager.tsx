import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Image as ImageIcon, Check, X, Tag } from 'lucide-react';
import { getErrorMessage } from '../services/api';
import { ImageUploader } from './ImageUploader';

interface ProductVariant {
  id?: string;
  size: string;
  price: number;
  stock_qty: number;
}

interface Product {
  id: string;
  brand: string;
  name: string;
  category: string;
  gender: 'Him' | 'Her' | 'Unisex';
  concentration: string;
  starting_price: number;
  image: string;
  notes: string[];
  status: 'draft' | 'published' | 'archived';
  inventory_qty: number;
  is_featured: boolean;
  is_new_arrival: boolean;
  short_description?: string;
  variants?: ProductVariant[];
}

interface ProductManagerProps {
  csrfToken: string;
}

export const ProductManager: React.FC<ProductManagerProps> = ({ csrfToken }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [noteInput, setNoteInput] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/products.php');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setProducts(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch products', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenCreate = () => {
    setEditingProduct({
      id: 'prod-' + Math.random().toString(36).substr(2, 6),
      brand: 'ARRINA',
      name: '',
      category: 'Solar Floral Amber',
      gender: 'Unisex',
      concentration: 'Eau de Parfum',
      starting_price: 490,
      image: '/src/assets/images/element_pure_portions_bottle_1791911761812.jpg',
      notes: ['Neroli Blossom', 'Madagascar Vanilla'],
      status: 'published',
      inventory_qty: 100,
      is_featured: true,
      is_new_arrival: true,
      variants: [
        { size: '3ml', price: 350, stock_qty: 100 },
        { size: '5ml', price: 490, stock_qty: 100 },
        { size: '9ml', price: 850, stock_qty: 100 },
        { size: '15ml', price: 1350, stock_qty: 100 }
      ]
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct({
      ...p,
      variants: p.variants && p.variants.length > 0 ? p.variants : [
        { size: '5ml', price: p.starting_price, stock_qty: p.inventory_qty }
      ]
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name) return;

    setSaving(true);
    const isNew = !products.some(p => p.id === editingProduct.id);
    const method = isNew ? 'POST' : 'PUT';
    const url = isNew ? '/api/admin/products.php' : `/api/admin/products.php?id=${editingProduct.id}`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify(editingProduct)
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setEditingProduct(null);
        fetchProducts();
      } else {
        alert(getErrorMessage(data?.error || data, 'Failed to save product'));
      }
    } catch (err) {
      alert('Error saving product');
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm('Are you sure you want to archive this product?')) return;

    try {
      const res = await fetch(`/api/admin/products.php?id=${id}`, {
        method: 'DELETE',
        headers: { 'X-CSRF-Token': csrfToken }
      });
      const data = await res.json();
      if (data.success) {
        fetchProducts();
      }
    } catch (err) {
      alert('Error archiving product');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-6">
        <div>
          <h2 className="font-serif text-xl text-white font-normal">Fragrance Product Catalog</h2>
          <p className="text-xs text-zinc-400 font-sans mt-0.5">
            Manage decants, full bottles, sizes, prices, and stock levels
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-black text-xs font-semibold uppercase tracking-wider px-5 py-2.5 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products by brand, name, category or scent notes..."
          className="w-full bg-zinc-900 border border-zinc-800 pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
        />
      </div>

      {/* Product Table */}
      <div className="bg-zinc-900 border border-zinc-800 overflow-x-auto">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="bg-zinc-950 text-zinc-400 uppercase tracking-wider text-[10px] border-b border-zinc-800">
            <tr>
              <th className="py-3.5 px-4">Product</th>
              <th className="py-3.5 px-4">Brand</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Starting Price</th>
              <th className="py-3.5 px-4">Stock</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 font-sans">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-zinc-500">
                  Loading catalog from database...
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-zinc-500">
                  No products found.
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3.5 px-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-zinc-950 border border-zinc-800 p-1 shrink-0 flex items-center justify-center">
                      <img src={p.image} alt={p.name} className="max-h-full max-w-full object-contain" />
                    </div>
                    <div>
                      <p className="font-serif text-sm text-white font-normal">{p.name}</p>
                      <p className="text-[10px] text-zinc-500 font-mono">{p.id}</p>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-amber-300 font-medium">{p.brand}</td>
                  <td className="py-3.5 px-4 text-zinc-400">{p.category}</td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-white">৳ {p.starting_price}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 text-[10px] font-mono rounded ${p.inventory_qty < 10 ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-zinc-800 text-zinc-300'}`}>
                      {p.inventory_qty} in stock
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold ${p.status === 'published' ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800' : 'text-zinc-400 bg-zinc-800'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors"
                      title="Edit Product"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleArchive(p.id)}
                      className="p-1.5 text-zinc-400 hover:text-red-400 bg-zinc-800 hover:bg-red-950 transition-colors"
                      title="Archive Product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit / Create Product Modal */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 sm:p-8 space-y-6 text-white my-8">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="font-serif text-xl font-normal text-white">
                {products.some(p => p.id === editingProduct.id) ? 'Edit Fragrance Product' : 'Create New Product'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] tracking-widest text-zinc-400 uppercase mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={editingProduct.brand || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                    required
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-widest text-zinc-400 uppercase mb-1">Product Name</label>
                  <input
                    type="text"
                    value={editingProduct.name || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    required
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-widest text-zinc-400 uppercase mb-1">Category / Scent Profile</label>
                  <input
                    type="text"
                    value={editingProduct.category || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    required
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-widest text-zinc-400 uppercase mb-1">Gender Classification</label>
                  <select
                    value={editingProduct.gender || 'Unisex'}
                    onChange={e => setEditingProduct({ ...editingProduct, gender: e.target.value as any })}
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white focus:border-amber-400"
                  >
                    <option value="Unisex">Unisex</option>
                    <option value="Him">For Him</option>
                    <option value="Her">For Her</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] tracking-widest text-zinc-400 uppercase mb-1">Concentration</label>
                  <input
                    type="text"
                    value={editingProduct.concentration || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, concentration: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white focus:border-amber-400"
                    placeholder="Eau de Parfum / Extrait de Parfum"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-widest text-zinc-400 uppercase mb-1">Starting Price (৳ BDT)</label>
                  <input
                    type="number"
                    value={editingProduct.starting_price || 0}
                    onChange={e => setEditingProduct({ ...editingProduct, starting_price: Number(e.target.value) })}
                    required
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white focus:border-amber-400"
                  />
                </div>
              </div>

              <ImageUploader
                label="Product Image"
                value={editingProduct.image || ''}
                onChange={url => setEditingProduct({ ...editingProduct, image: url })}
                csrfToken={csrfToken}
              />

              <div>
                <label className="block text-[10px] tracking-widest text-zinc-400 uppercase mb-1">Short Editorial Description</label>
                <textarea
                  value={editingProduct.short_description || ''}
                  onChange={e => setEditingProduct({ ...editingProduct, short_description: e.target.value })}
                  rows={2}
                  className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white focus:border-amber-400"
                />
              </div>

              {/* Variants Section */}
              <div className="pt-2 border-t border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-amber-300 uppercase tracking-wider">Decant Size Variants & Pricing</h4>
                  <button
                    type="button"
                    onClick={() => {
                      const curr = editingProduct.variants || [];
                      setEditingProduct({
                        ...editingProduct,
                        variants: [...curr, { size: '5ml', price: 490, stock_qty: 100 }]
                      });
                    }}
                    className="text-[10px] bg-zinc-800 hover:bg-zinc-700 px-2 py-1 text-zinc-200 uppercase"
                  >
                    + Add Size Variant
                  </button>
                </div>

                <div className="space-y-2">
                  {(editingProduct.variants || []).map((v, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-zinc-950 p-2 border border-zinc-800">
                      <input
                        type="text"
                        value={v.size}
                        placeholder="Size (e.g. 5ml)"
                        onChange={e => {
                          const vars = [...(editingProduct.variants || [])];
                          vars[idx].size = e.target.value;
                          setEditingProduct({ ...editingProduct, variants: vars });
                        }}
                        className="w-1/3 bg-zinc-900 border border-zinc-700 px-2 py-1 text-xs text-white"
                      />
                      <input
                        type="number"
                        value={v.price}
                        placeholder="Price (৳)"
                        onChange={e => {
                          const vars = [...(editingProduct.variants || [])];
                          vars[idx].price = Number(e.target.value);
                          setEditingProduct({ ...editingProduct, variants: vars });
                        }}
                        className="w-1/3 bg-zinc-900 border border-zinc-700 px-2 py-1 text-xs text-white"
                      />
                      <input
                        type="number"
                        value={v.stock_qty}
                        placeholder="Stock Qty"
                        onChange={e => {
                          const vars = [...(editingProduct.variants || [])];
                          vars[idx].stock_qty = Number(e.target.value);
                          setEditingProduct({ ...editingProduct, variants: vars });
                        }}
                        className="w-1/3 bg-zinc-900 border border-zinc-700 px-2 py-1 text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const vars = (editingProduct.variants || []).filter((_, i) => i !== idx);
                          setEditingProduct({ ...editingProduct, variants: vars });
                        }}
                        className="text-red-400 p-1 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-black text-xs font-semibold uppercase tracking-wider"
                >
                  {saving ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

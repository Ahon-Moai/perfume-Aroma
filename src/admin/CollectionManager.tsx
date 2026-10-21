import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X, Check, Layers, Tag } from 'lucide-react';
import { getErrorMessage } from '../services/api';
import { ImageUploader } from './ImageUploader';
import { Collection, FragranceProduct } from '../types';

interface CollectionManagerProps {
  csrfToken: string;
}

export const CollectionManager: React.FC<CollectionManagerProps> = ({ csrfToken }) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [products, setProducts] = useState<FragranceProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingCol, setEditingCol] = useState<Partial<Collection> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [colRes, prodRes] = await Promise.all([
        fetch('/api/admin/collections.php'),
        fetch('/api/admin/products.php')
      ]);
      const colData = await colRes.json();
      const prodData = await prodRes.json();

      if (colData.success && Array.isArray(colData.data)) {
        setCollections(colData.data);
      }
      if (prodData.success && Array.isArray(prodData.data)) {
        setProducts(prodData.data);
      }
    } catch (e) {
      console.error('Failed to fetch collection data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setEditingCol({
      id: 'col-' + Math.random().toString(36).substr(2, 6),
      title: '',
      slug: '',
      description: '',
      image: '/src/assets/images/hero_pure_portions_arrina_1791911761493.jpg',
      rule_type: 'category',
      rule_value: 'Woody',
      display_order: collections.length + 1,
      is_enabled: true,
      mapped_product_ids: []
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (col: Collection) => {
    setEditingCol({
      ...col,
      mapped_product_ids: Array.isArray(col.mapped_product_ids) ? col.mapped_product_ids : []
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCol || !editingCol.title) return;

    setSaving(true);
    const isNew = !collections.some((c) => c.id === editingCol.id);
    const method = isNew ? 'POST' : 'PUT';
    const url = isNew ? '/api/admin/collections.php' : `/api/admin/collections.php?id=${editingCol.id}`;

    const slug = editingCol.slug || editingCol.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ ...editingCol, slug })
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setEditingCol(null);
        fetchData();
      } else {
        alert(getErrorMessage(data?.error || data, 'Failed to save collection'));
      }
    } catch (err) {
      alert('Error saving collection');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this collection?')) return;

    try {
      const res = await fetch(`/api/admin/collections.php?id=${id}`, {
        method: 'DELETE',
        headers: { 'X-CSRF-Token': csrfToken }
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      alert('Error deleting collection');
    }
  };

  const filteredCollections = collections.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-6">
        <div>
          <h2 className="font-serif text-xl text-white font-normal">Collections Manager</h2>
          <p className="text-xs text-zinc-400 font-sans mt-0.5">
            Create, edit, and organize dedicated category and campaign collections for the storefront
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-black text-xs font-semibold uppercase tracking-wider px-5 py-2.5 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Collection</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search collections by title, slug, or description..."
          className="w-full bg-zinc-900 border border-zinc-800 pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
        />
      </div>

      {/* Collection Table */}
      <div className="bg-zinc-900 border border-zinc-800 overflow-x-auto">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="bg-zinc-950 text-zinc-400 uppercase tracking-wider text-[10px] border-b border-zinc-800">
            <tr>
              <th className="py-3.5 px-4">Collection Title</th>
              <th className="py-3.5 px-4">URL Route</th>
              <th className="py-3.5 px-4">Rule Assignment</th>
              <th className="py-3.5 px-4">Order</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 font-sans">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-zinc-500">
                  Loading collections from database...
                </td>
              </tr>
            ) : filteredCollections.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-zinc-500">
                  No collections found.
                </td>
              </tr>
            ) : (
              filteredCollections.map((col) => (
                <tr key={col.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3.5 px-4 flex items-center gap-3">
                    {col.image && (
                      <div className="w-10 h-10 bg-zinc-950 border border-zinc-800 p-0.5 shrink-0 flex items-center justify-center overflow-hidden">
                        <img src={col.image} alt={col.title} className="max-h-full max-w-full object-cover" />
                      </div>
                    )}
                    <div>
                      <p className="font-serif text-sm text-white font-normal">{col.title}</p>
                      <p className="text-[10px] text-zinc-500 font-mono">{col.id}</p>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-amber-300">/collections/{col.slug}</td>
                  <td className="py-3.5 px-4 uppercase text-[10px] text-zinc-400 font-mono">
                    {col.rule_type}: {col.rule_value || 'all'}
                  </td>
                  <td className="py-3.5 px-4 font-mono">{col.display_order}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold ${col.is_enabled ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800' : 'text-zinc-500 bg-zinc-800'}`}>
                      {col.is_enabled ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(col)}
                      className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer"
                      title="Edit Collection"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(col.id)}
                      className="p-1.5 text-zinc-400 hover:text-red-400 bg-zinc-800 hover:bg-red-950 transition-colors cursor-pointer"
                      title="Delete Collection"
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

      {/* Edit / Create Collection Modal */}
      {isModalOpen && editingCol && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
          <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 shadow-2xl flex flex-col text-white my-auto rounded-none">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4 bg-zinc-900">
              <h3 className="font-serif text-xl font-normal text-white">
                {collections.some((c) => c.id === editingCol.id) ? 'Edit Collection' : 'Create New Collection'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] tracking-widest text-zinc-400 uppercase mb-1">Collection Title *</label>
                  <input
                    type="text"
                    value={editingCol.title || ''}
                    onChange={(e) => setEditingCol({ ...editingCol, title: e.target.value })}
                    required
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white focus:border-amber-400"
                    placeholder="e.g. Woody & Oud"
                  />
                </div>

                <div>
                  <label className="block text-[10px] tracking-widest text-zinc-400 uppercase mb-1">URL Slug</label>
                  <input
                    type="text"
                    value={editingCol.slug || ''}
                    onChange={(e) => setEditingCol({ ...editingCol, slug: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white font-mono focus:border-amber-400"
                    placeholder="e.g. woody"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] tracking-widest text-zinc-400 uppercase mb-1">Description / Subtitle</label>
                <textarea
                  value={editingCol.description || ''}
                  onChange={(e) => setEditingCol({ ...editingCol, description: e.target.value })}
                  rows={2}
                  className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white focus:border-amber-400"
                  placeholder="Short description displayed at the top of the collection page..."
                />
              </div>

              <ImageUploader
                label="Collection Banner / Cover Image"
                value={editingCol.image || ''}
                onChange={(url) => setEditingCol({ ...editingCol, image: url })}
                csrfToken={csrfToken}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-zinc-800">
                <div>
                  <label className="block text-[10px] tracking-widest text-zinc-400 uppercase mb-1">Rule Assignment Type</label>
                  <select
                    value={editingCol.rule_type || 'category'}
                    onChange={(e) => setEditingCol({ ...editingCol, rule_type: e.target.value as any })}
                    className="w-full bg-zinc-950 border border-zinc-700 px-2.5 py-2 text-xs text-white focus:border-amber-400"
                  >
                    <option value="all">All Products</option>
                    <option value="gender">Gender (Him / Her / Unisex)</option>
                    <option value="category">Category / Family</option>
                    <option value="featured">Best Sellers / Featured</option>
                    <option value="new_arrival">New Arrivals</option>
                    <option value="manual">Manual Mapping</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] tracking-widest text-zinc-400 uppercase mb-1">Rule Matching Value</label>
                  <input
                    type="text"
                    value={editingCol.rule_value || ''}
                    onChange={(e) => setEditingCol({ ...editingCol, rule_value: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white focus:border-amber-400"
                    placeholder="e.g. Him, Woody, Gourmand"
                  />
                </div>

                <div>
                  <label className="block text-[10px] tracking-widest text-zinc-400 uppercase mb-1">Display Order</label>
                  <input
                    type="number"
                    value={editingCol.display_order || 0}
                    onChange={(e) => setEditingCol({ ...editingCol, display_order: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white font-mono focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <label className="inline-flex items-center cursor-pointer gap-2 text-xs text-zinc-300">
                  <input
                    type="checkbox"
                    checked={editingCol.is_enabled ?? true}
                    onChange={(e) => setEditingCol({ ...editingCol, is_enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-400 relative" />
                  <span>Collection Active & Visible on Storefront</span>
                </label>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-amber-400 hover:bg-amber-300 text-black text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

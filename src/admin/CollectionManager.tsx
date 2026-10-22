import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X, Layers, Eye, EyeOff } from 'lucide-react';
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#EAEAEA] p-6 rounded">
        <div>
          <h2 className="text-lg font-bold text-[#111111] tracking-tight">Collections & Categories</h2>
          <p className="text-xs text-[#737373] mt-0.5">
            Organize store taxonomy, create landing collections, and assign matching rules
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 bg-[#111111] hover:bg-black text-white text-xs font-semibold px-4 py-2 rounded transition-all shadow-2xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Collection</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#737373]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search collections by title, route, or description..."
          className="w-full bg-white border border-[#EAEAEA] rounded pl-10 pr-4 py-2.5 text-xs text-[#111111] placeholder-[#737373] focus:outline-none focus:border-[#111111]"
        />
      </div>

      {/* Collection Table */}
      <div className="bg-white border border-[#EAEAEA] rounded overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs text-[#111111]">
          <thead className="bg-[#F8F8F8] text-[#737373] uppercase tracking-wider text-[10px] font-semibold border-b border-[#EAEAEA]">
            <tr>
              <th className="py-3 px-4">Collection Title</th>
              <th className="py-3 px-4">URL Route</th>
              <th className="py-3 px-4">Rule Assignment</th>
              <th className="py-3 px-4">Order</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAEAEA]">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[#737373]">
                  Loading collection records...
                </td>
              </tr>
            ) : filteredCollections.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[#737373]">
                  No collections matched search query.
                </td>
              </tr>
            ) : (
              filteredCollections.map((col) => (
                <tr key={col.id} className="hover:bg-[#F8F8F8] transition-colors">
                  <td className="py-3 px-4 flex items-center gap-3">
                    {col.image && (
                      <div className="w-9 h-9 bg-[#F4F4F4] border border-[#EAEAEA] rounded overflow-hidden shrink-0 flex items-center justify-center">
                        <img src={col.image} alt={col.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-[#111111]">{col.title}</p>
                      <p className="text-[10px] text-[#737373] font-mono">{col.id}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-[#111111]">/collections/{col.slug}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-[#737373] uppercase">
                    {col.rule_type}: <span className="text-[#111111] font-semibold">{col.rule_value || 'all'}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[#737373]">{col.display_order}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                      col.is_enabled
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-[#F4F4F4] text-[#737373] border border-[#EAEAEA]'
                    }`}>
                      {col.is_enabled ? <Eye className="w-3 h-3 text-emerald-600" /> : <EyeOff className="w-3 h-3 text-[#737373]" />}
                      {col.is_enabled ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-1">
                    <button
                      onClick={() => handleOpenEdit(col)}
                      className="p-1.5 text-[#737373] hover:text-[#111111] hover:bg-[#F4F4F4] rounded transition-colors"
                      title="Edit Collection"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(col.id)}
                      className="p-1.5 text-[#737373] hover:text-red-600 hover:bg-red-50 rounded transition-colors"
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl bg-white border border-[#EAEAEA] shadow-xl rounded-lg flex flex-col text-[#111111] my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#EAEAEA] px-6 py-4">
              <h3 className="font-bold text-sm uppercase tracking-wider text-[#111111]">
                {collections.some((c) => c.id === editingCol.id) ? 'Edit Collection' : 'Create Collection'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[#737373] hover:text-[#111111] rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#737373] mb-1">Collection Title *</label>
                  <input
                    type="text"
                    value={editingCol.title || ''}
                    onChange={(e) => setEditingCol({ ...editingCol, title: e.target.value })}
                    required
                    className="w-full bg-white border border-[#EAEAEA] rounded px-3 py-2 text-xs text-[#111111] focus:border-[#111111] focus:outline-none"
                    placeholder="e.g. Woody & Oud"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#737373] mb-1">URL Slug</label>
                  <input
                    type="text"
                    value={editingCol.slug || ''}
                    onChange={(e) => setEditingCol({ ...editingCol, slug: e.target.value })}
                    className="w-full bg-white border border-[#EAEAEA] rounded px-3 py-2 text-xs text-[#111111] font-mono focus:border-[#111111] focus:outline-none"
                    placeholder="e.g. woody"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#737373] mb-1">Description / Subtitle</label>
                <textarea
                  value={editingCol.description || ''}
                  onChange={(e) => setEditingCol({ ...editingCol, description: e.target.value })}
                  rows={2}
                  className="w-full bg-white border border-[#EAEAEA] rounded px-3 py-2 text-xs text-[#111111] focus:border-[#111111] focus:outline-none"
                  placeholder="Short description displayed at the top of the collection page..."
                />
              </div>

              <ImageUploader
                label="Collection Banner / Header Image"
                value={editingCol.image || ''}
                onChange={(url) => setEditingCol({ ...editingCol, image: url })}
                csrfToken={csrfToken}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#EAEAEA]">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#737373] mb-1">Rule Assignment</label>
                  <select
                    value={editingCol.rule_type || 'category'}
                    onChange={(e) => setEditingCol({ ...editingCol, rule_type: e.target.value as any })}
                    className="w-full bg-white border border-[#EAEAEA] rounded px-2.5 py-2 text-xs text-[#111111] focus:border-[#111111] focus:outline-none"
                  >
                    <option value="all">All Products</option>
                    <option value="gender">Gender (Him/Her/Unisex)</option>
                    <option value="category">Category / Family</option>
                    <option value="featured">Best Sellers</option>
                    <option value="new_arrival">New Arrivals</option>
                    <option value="manual">Manual Mapping</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#737373] mb-1">Matching Value</label>
                  <input
                    type="text"
                    value={editingCol.rule_value || ''}
                    onChange={(e) => setEditingCol({ ...editingCol, rule_value: e.target.value })}
                    className="w-full bg-white border border-[#EAEAEA] rounded px-3 py-2 text-xs text-[#111111] focus:border-[#111111] focus:outline-none"
                    placeholder="e.g. Him, Woody, Gourmand"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#737373] mb-1">Display Order</label>
                  <input
                    type="number"
                    value={editingCol.display_order || 0}
                    onChange={(e) => setEditingCol({ ...editingCol, display_order: Number(e.target.value) })}
                    className="w-full bg-white border border-[#EAEAEA] rounded px-3 py-2 text-xs text-[#111111] font-mono focus:border-[#111111] focus:outline-none"
                  />
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <label className="inline-flex items-center gap-2 text-xs text-[#111111] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingCol.is_enabled ?? true}
                    onChange={(e) => setEditingCol({ ...editingCol, is_enabled: e.target.checked })}
                    className="rounded border-[#EAEAEA] text-[#111111] focus:ring-0"
                  />
                  <span>Collection visible on storefront navigation</span>
                </label>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#EAEAEA]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#EAEAEA] text-[#111111] rounded text-xs hover:bg-[#F4F4F4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#111111] hover:bg-black text-white rounded text-xs font-semibold shadow-2xs"
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

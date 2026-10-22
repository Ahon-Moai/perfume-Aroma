import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Check, X, Tag, Sparkles, Sliders, Info, Calendar, Clock, Sun } from 'lucide-react';
import { getErrorMessage } from '../services/api';
import { ImageUploader } from './ImageUploader';
import { ScentProfile } from '../types';

interface ProductVariant {
  id?: string;
  size: string;
  price: number;
  stock_qty: number;
}

interface AttributeItem {
  id: string;
  name: string;
  value: number;
  enabled: boolean;
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
  additional_images?: string[];
  images?: string[];
  notes: string[];
  top_notes?: string[];
  heart_notes?: string[];
  base_notes?: string[];
  attributes?: AttributeItem[];
  scent_profile?: ScentProfile;
  scentProfile?: ScentProfile;
  status: 'draft' | 'published' | 'archived';
  inventory_qty: number;
  is_featured: boolean;
  is_new_arrival: boolean;
  short_description?: string;
  description?: string;
  variants?: ProductVariant[];
}

interface ProductManagerProps {
  csrfToken: string;
}

// Preset option constants for Find Your Scent recommendation attributes
const FRAGRANCE_FAMILIES_OPTIONS = [
  'Floral', 'Woody', 'Amber / Oriental', 'Fresh / Citrus', 'Gourmand',
  'Aquatic / Marine', 'Aromatic / Herbal', 'Leather', 'Chypre', 'Fougère',
  'Fruity', 'Spicy', 'Green', 'Musk'
];

const SEASONS_OPTIONS = ['Spring', 'Summer', 'Autumn', 'Winter', 'All Seasons'];

const OCCASIONS_OPTIONS = [
  'Daily / Casual', 'Office / Work', 'Evening / Date Night',
  'Formal / Black Tie', 'Party / Nightout', 'Gym / Sport', 'Special Occasions'
];

const MOODS_OPTIONS = [
  'Elegant / Sophisticated', 'Mysterious / Seductive', 'Clean / Refreshing',
  'Warm / Cozy', 'Bold / Powerful', 'Playful / Youthful', 'Relaxing / Calming'
];

const DAY_NIGHT_OPTIONS = ['Daytime', 'Nighttime', 'All-Day / Any'];

const INTENSITY_OPTIONS = ['Unknown', 'Soft', 'Moderate', 'Strong', 'Intensely Bold'];

const PROJECTION_OPTIONS = [
  'Unknown', 'Subtle / Skin Scent', 'Moderate (Arm\'s length)', 'Strong (Room filler)', 'Enormous'
];

const LONGEVITY_OPTIONS = [
  'Unknown', 'Weak (1-3 hrs)', 'Moderate (3-6 hrs)', 'Long-lasting (6-12 hrs)', 'Eternal (12+ hrs)'
];

const CONCENTRATION_OPTIONS = ['Unknown', 'EDT', 'EDP', 'Parfum', 'Extrait', 'Other'];

const GENDER_POSITIONING_OPTIONS = ['Unknown', 'Masculine', 'Feminine', 'Unisex'];

const SWEETNESS_OPTIONS = [
  'Unknown', 'Dry / Not Sweet', 'Subtle / Slightly Sweet', 'Moderate', 'Sweet', 'Very Sweet'
];

export const ProductManager: React.FC<ProductManagerProps> = ({ csrfToken }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Note Tag Inputs State
  const [topNoteInput, setTopNoteInput] = useState('');
  const [heartNoteInput, setHeartNoteInput] = useState('');
  const [baseNoteInput, setBaseNoteInput] = useState('');

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

  const DEFAULT_ATTRIBUTES: AttributeItem[] = [
    { id: 'longevity', name: 'Longevity', value: 85, enabled: true },
    { id: 'sillage', name: 'Sillage / Trail', value: 80, enabled: true },
    { id: 'projection', name: 'Projection', value: 75, enabled: true },
    { id: 'versatility', name: 'Versatility', value: 90, enabled: true },
    { id: 'mass_appeal', name: 'Mass Appeal', value: 88, enabled: true }
  ];

  const handleOpenCreate = () => {
    const defaultScentProfile: ScentProfile = {
      fragranceFamilies: ['Floral'],
      topNotes: ['Neroli Blossom', 'Bergamot'],
      heartNotes: ['Madagascar Bourbon Vanilla'],
      baseNotes: ['Golden Amber Crystals', 'White Musk'],
      seasons: ['Spring', 'Summer', 'Autumn', 'All Seasons'],
      occasions: ['Daily / Casual', 'Office / Work'],
      moods: ['Clean / Refreshing', 'Elegant / Sophisticated'],
      intensity: 'Moderate',
      projection: 'Moderate (Arm\'s length)',
      longevity: 'Long-lasting (6-12 hrs)',
      concentration: 'EDP',
      genderPositioning: 'Unisex',
      daytimeNighttime: ['Daytime', 'Nighttime'],
      sweetness: 'Subtle / Slightly Sweet',
      scentDescription: 'Weightless neroli blossom, cured Madagascar bourbon vanilla, and radiant golden amber.',
      recommendationExplanation: 'A versatile solar floral amber ideal for discovery and everyday signature wear.'
    };

    setEditingProduct({
      id: 'prod-' + Math.random().toString(36).substr(2, 6),
      brand: 'ARRINA',
      name: '',
      category: 'Solar Floral Amber',
      gender: 'Unisex',
      concentration: 'Eau de Parfum',
      starting_price: 490,
      image: '/src/assets/images/element_pure_portions_bottle_1791911761812.jpg',
      additional_images: [],
      notes: ['Neroli Blossom', 'Madagascar Vanilla'],
      top_notes: ['Neroli Blossom', 'Bergamot'],
      heart_notes: ['Madagascar Bourbon Vanilla'],
      base_notes: ['Golden Amber Crystals', 'White Musk'],
      scent_profile: defaultScentProfile,
      scentProfile: defaultScentProfile,
      attributes: DEFAULT_ATTRIBUTES,
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
    setTopNoteInput('');
    setHeartNoteInput('');
    setBaseNoteInput('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    const sp = p.scent_profile || p.scentProfile || {};
    const topN = Array.isArray(sp.topNotes) && sp.topNotes.length > 0 ? sp.topNotes : (p.top_notes || []);
    const heartN = Array.isArray(sp.heartNotes) && sp.heartNotes.length > 0 ? sp.heartNotes : (p.heart_notes || []);
    const baseN = Array.isArray(sp.baseNotes) && sp.baseNotes.length > 0 ? sp.baseNotes : (p.base_notes || []);

    const loadedScentProfile: ScentProfile = {
      fragranceFamilies: Array.isArray(sp.fragranceFamilies) ? sp.fragranceFamilies : (p.category ? [p.category] : []),
      topNotes: topN,
      heartNotes: heartN,
      baseNotes: baseN,
      seasons: Array.isArray(sp.seasons) ? sp.seasons : [],
      occasions: Array.isArray(sp.occasions) ? sp.occasions : [],
      moods: Array.isArray(sp.moods) ? sp.moods : [],
      intensity: sp.intensity || 'Unknown',
      projection: sp.projection || 'Unknown',
      longevity: sp.longevity || 'Unknown',
      concentration: sp.concentration || (p.concentration === 'Extrait de Parfum' ? 'Extrait' : (p.concentration === 'Eau de Parfum' ? 'EDP' : (p.concentration === 'Eau de Toilette' ? 'EDT' : 'Unknown'))),
      genderPositioning: sp.genderPositioning || (p.gender === 'Him' ? 'Masculine' : (p.gender === 'Her' ? 'Feminine' : 'Unisex')),
      daytimeNighttime: Array.isArray(sp.daytimeNighttime) ? sp.daytimeNighttime : [],
      sweetness: sp.sweetness || 'Unknown',
      scentDescription: sp.scentDescription || p.short_description || '',
      recommendationExplanation: sp.recommendationExplanation || ''
    };

    setEditingProduct({
      ...p,
      additional_images: Array.isArray(p.additional_images) ? p.additional_images : (Array.isArray(p.images) ? p.images : []),
      top_notes: topN,
      heart_notes: heartN,
      base_notes: baseN,
      scent_profile: loadedScentProfile,
      scentProfile: loadedScentProfile,
      attributes: Array.isArray(p.attributes) && p.attributes.length > 0 ? p.attributes : DEFAULT_ATTRIBUTES,
      variants: p.variants && p.variants.length > 0 ? p.variants : [
        { size: '5ml', price: p.starting_price, stock_qty: p.inventory_qty }
      ]
    });
    setTopNoteInput('');
    setHeartNoteInput('');
    setBaseNoteInput('');
    setIsModalOpen(true);
  };

  const updateScentProfile = (key: keyof ScentProfile, val: any) => {
    if (!editingProduct) return;
    const currentProfile = editingProduct.scent_profile || editingProduct.scentProfile || {};
    const updatedProfile = { ...currentProfile, [key]: val };
    setEditingProduct({
      ...editingProduct,
      scent_profile: updatedProfile,
      scentProfile: updatedProfile
    });
  };

  const toggleMultiSelectOption = (key: keyof ScentProfile, option: string) => {
    if (!editingProduct) return;
    const currentProfile = editingProduct.scent_profile || editingProduct.scentProfile || {};
    const currentArr: string[] = Array.isArray(currentProfile[key]) ? (currentProfile[key] as string[]) : [];
    const exists = currentArr.includes(option);
    const updatedArr = exists ? currentArr.filter(i => i !== option) : [...currentArr, option];
    updateScentProfile(key, updatedArr);
  };

  const addNoteTag = (noteType: 'topNotes' | 'heartNotes' | 'baseNotes', noteValue: string) => {
    const trimmed = noteValue.trim();
    if (!trimmed || !editingProduct) return;
    const currentProfile = editingProduct.scent_profile || editingProduct.scentProfile || {};
    const currentArr: string[] = Array.isArray(currentProfile[noteType]) ? (currentProfile[noteType] as string[]) : [];
    if (!currentArr.includes(trimmed)) {
      const updatedArr = [...currentArr, trimmed];
      updateScentProfile(noteType, updatedArr);
      if (noteType === 'topNotes') setEditingProduct(prev => prev ? ({ ...prev, top_notes: updatedArr }) : prev);
      if (noteType === 'heartNotes') setEditingProduct(prev => prev ? ({ ...prev, heart_notes: updatedArr }) : prev);
      if (noteType === 'baseNotes') setEditingProduct(prev => prev ? ({ ...prev, base_notes: updatedArr }) : prev);
    }
  };

  const removeNoteTag = (noteType: 'topNotes' | 'heartNotes' | 'baseNotes', indexToRemove: number) => {
    if (!editingProduct) return;
    const currentProfile = editingProduct.scent_profile || editingProduct.scentProfile || {};
    const currentArr: string[] = Array.isArray(currentProfile[noteType]) ? (currentProfile[noteType] as string[]) : [];
    const updatedArr = currentArr.filter((_, idx) => idx !== indexToRemove);
    updateScentProfile(noteType, updatedArr);
    if (noteType === 'topNotes') setEditingProduct(prev => prev ? ({ ...prev, top_notes: updatedArr }) : prev);
    if (noteType === 'heartNotes') setEditingProduct(prev => prev ? ({ ...prev, heart_notes: updatedArr }) : prev);
    if (noteType === 'baseNotes') setEditingProduct(prev => prev ? ({ ...prev, base_notes: updatedArr }) : prev);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name) return;

    setSaving(true);
    const isNew = !products.some(p => p.id === editingProduct.id);
    const method = isNew ? 'POST' : 'PUT';
    const url = isNew ? '/api/admin/products.php' : `/api/admin/products.php?id=${editingProduct.id}`;

    // Ensure top_notes, heart_notes, base_notes, and scent_profile match
    const sp = editingProduct.scent_profile || editingProduct.scentProfile || {};
    const payload = {
      ...editingProduct,
      top_notes: sp.topNotes || editingProduct.top_notes || [],
      heart_notes: sp.heartNotes || editingProduct.heart_notes || [],
      base_notes: sp.baseNotes || editingProduct.base_notes || [],
      scent_profile: sp,
      scentProfile: sp
    };

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify(payload)
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

  const activeScentProfile = (editingProduct?.scent_profile || editingProduct?.scentProfile || {}) as ScentProfile;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#EAEAEA] p-6">
        <div>
          <h2 className="font-serif text-xl text-white font-normal">Fragrance Product Catalog</h2>
          <p className="text-xs text-[#737373] font-sans mt-0.5">
            Manage decants, full bottles, sizes, prices, and structured scent attributes
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 bg-[#111111] text-white hover:bg-amber-300 text-black text-xs font-semibold uppercase tracking-wider px-5 py-2.5 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#737373]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products by brand, name, category or scent notes..."
          className="w-full bg-white border border-[#EAEAEA] pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#111111]"
        />
      </div>

      {/* Product Table */}
      <div className="bg-white border border-[#EAEAEA] overflow-x-auto">
        <table className="w-full text-left text-xs text-[#111111]">
          <thead className="bg-[#F8F8F8] text-[#737373] uppercase tracking-wider text-[10px] border-b border-[#EAEAEA]">
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
                <td colSpan={7} className="py-8 text-center text-[#737373]">
                  Loading catalog from database...
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-[#737373]">
                  No products found.
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-[#F8F8F8] transition-colors">
                  <td className="py-3.5 px-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#F8F8F8] border border-[#EAEAEA] p-1 shrink-0 flex items-center justify-center">
                      <img src={p.image} alt={p.name} className="max-h-full max-w-full object-contain" />
                    </div>
                    <div>
                      <p className="font-serif text-sm text-white font-normal">{p.name}</p>
                      <p className="text-[10px] text-[#737373] font-mono">{p.id}</p>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-[#111111] font-medium">{p.brand}</td>
                  <td className="py-3.5 px-4 text-[#737373]">{p.category}</td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-white">৳ {p.starting_price}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 text-[10px] font-mono rounded ${p.inventory_qty < 10 ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-[#F4F4F4] text-[#111111]'}`}>
                      {p.inventory_qty} in stock
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold ${p.status === 'published' ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800' : 'text-[#737373] bg-[#F4F4F4]'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-1.5 text-[#737373] hover:text-white bg-[#F4F4F4] hover:bg-zinc-700 transition-colors cursor-pointer"
                      title="Edit Product"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleArchive(p.id)}
                      className="p-1.5 text-[#737373] hover:text-red-400 bg-[#F4F4F4] hover:bg-red-950 transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
          <div className="relative w-full max-w-4xl bg-white border border-[#EAEAEA] shadow-2xl flex flex-col max-h-[92vh] text-white my-auto rounded-none">
            {/* Modal Header - Fixed */}
            <div className="flex items-center justify-between border-b border-[#EAEAEA] px-6 py-4 shrink-0 bg-white">
              <div>
                <h3 className="font-serif text-xl font-normal text-white">
                  {products.some(p => p.id === editingProduct.id) ? 'Edit Fragrance Product' : 'Create New Fragrance Product'}
                </h3>
                <p className="text-[10px] text-[#111111] font-mono mt-0.5">
                  ID: {editingProduct.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-[#737373] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

                {/* Section A: Core E-Commerce Product Information */}
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold text-[#111111] uppercase tracking-wider flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-[#111111]" />
                    <span>Basic E-Commerce Information</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">Brand Name *</label>
                      <input
                        type="text"
                        value={editingProduct.brand || ''}
                        onChange={e => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                        required
                        className="w-full bg-[#F8F8F8] border border-[#EAEAEA] px-3 py-2 text-xs text-white focus:border-[#111111]"
                        placeholder="e.g. ARRINA, SWISS ARABIAN"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">Product Name *</label>
                      <input
                        type="text"
                        value={editingProduct.name || ''}
                        onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        required
                        className="w-full bg-[#F8F8F8] border border-[#EAEAEA] px-3 py-2 text-xs text-white focus:border-[#111111]"
                        placeholder="e.g. Pure Portions"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">Olfactory Category *</label>
                      <input
                        type="text"
                        value={editingProduct.category || ''}
                        onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}
                        required
                        className="w-full bg-[#F8F8F8] border border-[#EAEAEA] px-3 py-2 text-xs text-white focus:border-[#111111]"
                        placeholder="e.g. Solar Floral Amber, Woody Oriental"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">Gender Classification</label>
                      <select
                        value={editingProduct.gender || 'Unisex'}
                        onChange={e => setEditingProduct({ ...editingProduct, gender: e.target.value as any })}
                        className="w-full bg-[#F8F8F8] border border-[#EAEAEA] px-3 py-2 text-xs text-white focus:border-[#111111]"
                      >
                        <option value="Unisex">Unisex</option>
                        <option value="Him">For Him</option>
                        <option value="Her">For Her</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">Concentration Label</label>
                      <input
                        type="text"
                        value={editingProduct.concentration || ''}
                        onChange={e => setEditingProduct({ ...editingProduct, concentration: e.target.value })}
                        className="w-full bg-[#F8F8F8] border border-[#EAEAEA] px-3 py-2 text-xs text-white focus:border-[#111111]"
                        placeholder="Eau de Parfum / Extrait de Parfum"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">Starting Base Price (৳ BDT) *</label>
                      <input
                        type="number"
                        value={editingProduct.starting_price || 0}
                        onChange={e => setEditingProduct({ ...editingProduct, starting_price: Number(e.target.value) })}
                        required
                        className="w-full bg-[#F8F8F8] border border-[#EAEAEA] px-3 py-2 text-xs text-white focus:border-[#111111] font-mono"
                      />
                    </div>
                  </div>

                  <ImageUploader
                    label="Primary Main Product Image"
                    value={editingProduct.image || ''}
                    onChange={url => setEditingProduct({ ...editingProduct, image: url })}
                    csrfToken={csrfToken}
                  />

                  {/* Product Gallery Thumbnails */}
                  <div className="pt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-[#111111]">Gallery Angle Thumbnails</span>
                      <button
                        type="button"
                        onClick={() => {
                          const gallery = editingProduct.additional_images || [];
                          setEditingProduct({ ...editingProduct, additional_images: [...gallery, ''] });
                        }}
                        className="text-[10px] bg-[#F4F4F4] hover:bg-zinc-700 px-2 py-1 text-[#111111] uppercase cursor-pointer"
                      >
                        + Add Gallery Image
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(editingProduct.additional_images || []).map((imgUrl, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-[#F8F8F8] p-2 border border-[#EAEAEA]">
                          <div className="flex-1">
                            <ImageUploader
                              label={`Gallery Image #${idx + 1}`}
                              value={imgUrl}
                              onChange={url => {
                                const gallery = [...(editingProduct.additional_images || [])];
                                gallery[idx] = url;
                                setEditingProduct({ ...editingProduct, additional_images: gallery });
                              }}
                              csrfToken={csrfToken}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const gallery = (editingProduct.additional_images || []).filter((_, i) => i !== idx);
                              setEditingProduct({ ...editingProduct, additional_images: gallery });
                            }}
                            className="text-red-400 p-1.5 hover:text-red-300 hover:bg-white rounded cursor-pointer mt-5"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">Short Editorial Summary</label>
                    <textarea
                      value={editingProduct.short_description || ''}
                      onChange={e => setEditingProduct({ ...editingProduct, short_description: e.target.value })}
                      rows={2}
                      className="w-full bg-[#F8F8F8] border border-[#EAEAEA] px-3 py-2 text-xs text-white focus:border-[#111111]"
                      placeholder="Brief fragrance hook for cards and previews..."
                    />
                  </div>
                </div>

                {/* Section B: Find Your Scent Recommendation Attributes */}
                <div className="pt-4 border-t border-[#EAEAEA] space-y-5 bg-[#F8F8F8]/60 p-4 border border-[#EAEAEA]/90">
                  <div className="border-b border-[#EAEAEA] pb-2">
                    <h4 className="text-xs font-semibold text-[#111111] uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#111111]" />
                      <span>Find Your Scent — Recommendation Attributes</span>
                    </h4>
                    <p className="text-[11px] text-[#737373] font-sans mt-0.5">
                      Structured fragrance profile data used for rule-based scent discovery and recommendations. Optional fields default to Unknown.
                    </p>
                  </div>

                  {/* B1. Fragrance Families (Multi-Select) */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-semibold text-[#111111] uppercase tracking-wider">
                      1. Fragrance Families <span className="text-[10px] text-[#737373] font-normal lowercase">(multi-select)</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {FRAGRANCE_FAMILIES_OPTIONS.map(fam => {
                        const isSelected = (activeScentProfile.fragranceFamilies || []).includes(fam);
                        return (
                          <button
                            key={fam}
                            type="button"
                            onClick={() => toggleMultiSelectOption('fragranceFamilies', fam)}
                            className={`px-3 py-1.5 text-xs border transition-all cursor-pointer flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-[#111111] text-white text-black border-[#111111] font-semibold shadow-xs'
                                : 'bg-white text-[#737373] border-[#EAEAEA] hover:border-zinc-600 hover:text-[#111111]'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 text-black" />}
                            <span>{fam}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* B2. Note Pyramid Multi-Values (Top, Heart, Base Notes) */}
                  <div className="space-y-3 pt-2">
                    <label className="block text-[11px] font-semibold text-[#111111] uppercase tracking-wider">
                      2. Olfactory Pyramid Notes <span className="text-[10px] text-[#737373] font-normal lowercase">(multiple notes per field)</span>
                    </label>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Top Notes */}
                      <div className="bg-white p-3 border border-[#EAEAEA] space-y-2">
                        <label className="block text-[10px] font-semibold text-[#111111] uppercase">Top Notes</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={topNoteInput}
                            onChange={e => setTopNoteInput(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addNoteTag('topNotes', topNoteInput);
                                setTopNoteInput('');
                              }
                            }}
                            placeholder="Add top note..."
                            className="flex-1 bg-[#F8F8F8] border border-[#EAEAEA] px-2 py-1 text-xs text-white focus:border-[#111111]"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              addNoteTag('topNotes', topNoteInput);
                              setTopNoteInput('');
                            }}
                            className="px-2 py-1 bg-[#111111] text-white text-black text-xs font-semibold uppercase cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 min-h-[32px] pt-1">
                          {(activeScentProfile.topNotes || []).map((note, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 bg-[#F4F4F4] border border-[#EAEAEA] text-amber-200 px-2 py-0.5 text-[11px] rounded-none">
                              {note}
                              <button
                                type="button"
                                onClick={() => removeNoteTag('topNotes', idx)}
                                className="text-[#737373] hover:text-white cursor-pointer ml-0.5"
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                          {(activeScentProfile.topNotes || []).length === 0 && (
                            <span className="text-[10px] text-zinc-600 italic">No top notes added</span>
                          )}
                        </div>
                      </div>

                      {/* Heart Notes */}
                      <div className="bg-white p-3 border border-[#EAEAEA] space-y-2">
                        <label className="block text-[10px] font-semibold text-[#111111] uppercase">Heart / Middle Notes</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={heartNoteInput}
                            onChange={e => setHeartNoteInput(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addNoteTag('heartNotes', heartNoteInput);
                                setHeartNoteInput('');
                              }
                            }}
                            placeholder="Add heart note..."
                            className="flex-1 bg-[#F8F8F8] border border-[#EAEAEA] px-2 py-1 text-xs text-white focus:border-[#111111]"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              addNoteTag('heartNotes', heartNoteInput);
                              setHeartNoteInput('');
                            }}
                            className="px-2 py-1 bg-[#111111] text-white text-black text-xs font-semibold uppercase cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 min-h-[32px] pt-1">
                          {(activeScentProfile.heartNotes || []).map((note, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 bg-[#F4F4F4] border border-[#EAEAEA] text-amber-200 px-2 py-0.5 text-[11px] rounded-none">
                              {note}
                              <button
                                type="button"
                                onClick={() => removeNoteTag('heartNotes', idx)}
                                className="text-[#737373] hover:text-white cursor-pointer ml-0.5"
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                          {(activeScentProfile.heartNotes || []).length === 0 && (
                            <span className="text-[10px] text-zinc-600 italic">No heart notes added</span>
                          )}
                        </div>
                      </div>

                      {/* Base Notes */}
                      <div className="bg-white p-3 border border-[#EAEAEA] space-y-2">
                        <label className="block text-[10px] font-semibold text-[#111111] uppercase">Base Notes</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={baseNoteInput}
                            onChange={e => setBaseNoteInput(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addNoteTag('baseNotes', baseNoteInput);
                                setBaseNoteInput('');
                              }
                            }}
                            placeholder="Add base note..."
                            className="flex-1 bg-[#F8F8F8] border border-[#EAEAEA] px-2 py-1 text-xs text-white focus:border-[#111111]"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              addNoteTag('baseNotes', baseNoteInput);
                              setBaseNoteInput('');
                            }}
                            className="px-2 py-1 bg-[#111111] text-white text-black text-xs font-semibold uppercase cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 min-h-[32px] pt-1">
                          {(activeScentProfile.baseNotes || []).map((note, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 bg-[#F4F4F4] border border-[#EAEAEA] text-amber-200 px-2 py-0.5 text-[11px] rounded-none">
                              {note}
                              <button
                                type="button"
                                onClick={() => removeNoteTag('baseNotes', idx)}
                                className="text-[#737373] hover:text-white cursor-pointer ml-0.5"
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                          {(activeScentProfile.baseNotes || []).length === 0 && (
                            <span className="text-[10px] text-zinc-600 italic">No base notes added</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* B3. Suitable Seasons (Multi-Select) */}
                  <div className="space-y-2 pt-1">
                    <label className="block text-[11px] font-semibold text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#111111]" />
                      <span>3. Suitable Seasons <span className="text-[10px] text-[#737373] font-normal lowercase">(multi-select)</span></span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {SEASONS_OPTIONS.map(season => {
                        const isSelected = (activeScentProfile.seasons || []).includes(season);
                        return (
                          <button
                            key={season}
                            type="button"
                            onClick={() => toggleMultiSelectOption('seasons', season)}
                            className={`px-3 py-1.5 text-xs border transition-all cursor-pointer flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-[#111111] text-white text-black border-[#111111] font-semibold shadow-xs'
                                : 'bg-white text-[#737373] border-[#EAEAEA] hover:border-zinc-600 hover:text-[#111111]'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 text-black" />}
                            <span>{season}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* B4. Suitable Occasions (Multi-Select) */}
                  <div className="space-y-2 pt-1">
                    <label className="block text-[11px] font-semibold text-[#111111] uppercase tracking-wider">
                      4. Suitable Occasions <span className="text-[10px] text-[#737373] font-normal lowercase">(multi-select)</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {OCCASIONS_OPTIONS.map(occ => {
                        const isSelected = (activeScentProfile.occasions || []).includes(occ);
                        return (
                          <button
                            key={occ}
                            type="button"
                            onClick={() => toggleMultiSelectOption('occasions', occ)}
                            className={`px-3 py-1.5 text-xs border transition-all cursor-pointer flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-[#111111] text-white text-black border-[#111111] font-semibold shadow-xs'
                                : 'bg-white text-[#737373] border-[#EAEAEA] hover:border-zinc-600 hover:text-[#111111]'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 text-black" />}
                            <span>{occ}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* B5. Desired Impression / Mood (Multi-Select) */}
                  <div className="space-y-2 pt-1">
                    <label className="block text-[11px] font-semibold text-[#111111] uppercase tracking-wider">
                      5. Desired Impression / Mood <span className="text-[10px] text-[#737373] font-normal lowercase">(multi-select)</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {MOODS_OPTIONS.map(mood => {
                        const isSelected = (activeScentProfile.moods || []).includes(mood);
                        return (
                          <button
                            key={mood}
                            type="button"
                            onClick={() => toggleMultiSelectOption('moods', mood)}
                            className={`px-3 py-1.5 text-xs border transition-all cursor-pointer flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-[#111111] text-white text-black border-[#111111] font-semibold shadow-xs'
                                : 'bg-white text-[#737373] border-[#EAEAEA] hover:border-zinc-600 hover:text-[#111111]'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 text-black" />}
                            <span>{mood}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* B6 - B8, B10. Structured Select Dropdowns */}
                  <div className="space-y-2 pt-2">
                    <label className="block text-[11px] font-semibold text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-[#111111]" />
                      <span>6–10. Structured Olfactory Parameters</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-white p-4 border border-[#EAEAEA]">
                      {/* Intensity */}
                      <div>
                        <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">Intensity Level</label>
                        <select
                          value={activeScentProfile.intensity || 'Unknown'}
                          onChange={e => updateScentProfile('intensity', e.target.value)}
                          className="w-full bg-[#F8F8F8] border border-[#EAEAEA] px-2.5 py-1.5 text-xs text-white focus:border-[#111111]"
                        >
                          {INTENSITY_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>

                      {/* Projection */}
                      <div>
                        <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">Projection / Sillage</label>
                        <select
                          value={activeScentProfile.projection || 'Unknown'}
                          onChange={e => updateScentProfile('projection', e.target.value)}
                          className="w-full bg-[#F8F8F8] border border-[#EAEAEA] px-2.5 py-1.5 text-xs text-white focus:border-[#111111]"
                        >
                          {PROJECTION_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>

                      {/* Longevity */}
                      <div>
                        <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">Skin Longevity</label>
                        <select
                          value={activeScentProfile.longevity || 'Unknown'}
                          onChange={e => updateScentProfile('longevity', e.target.value)}
                          className="w-full bg-[#F8F8F8] border border-[#EAEAEA] px-2.5 py-1.5 text-xs text-white focus:border-[#111111]"
                        >
                          {LONGEVITY_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>

                      {/* Concentration */}
                      <div>
                        <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">Fragrance Concentration</label>
                        <select
                          value={activeScentProfile.concentration || 'Unknown'}
                          onChange={e => updateScentProfile('concentration', e.target.value)}
                          className="w-full bg-[#F8F8F8] border border-[#EAEAEA] px-2.5 py-1.5 text-xs text-white focus:border-[#111111]"
                        >
                          {CONCENTRATION_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>

                      {/* Gender Positioning */}
                      <div>
                        <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">Gender Positioning</label>
                        <select
                          value={activeScentProfile.genderPositioning || 'Unknown'}
                          onChange={e => updateScentProfile('genderPositioning', e.target.value)}
                          className="w-full bg-[#F8F8F8] border border-[#EAEAEA] px-2.5 py-1.5 text-xs text-white focus:border-[#111111]"
                        >
                          {GENDER_POSITIONING_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>

                      {/* Sweetness Level */}
                      <div>
                        <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">Sweetness Level</label>
                        <select
                          value={activeScentProfile.sweetness || 'Unknown'}
                          onChange={e => updateScentProfile('sweetness', e.target.value)}
                          className="w-full bg-[#F8F8F8] border border-[#EAEAEA] px-2.5 py-1.5 text-xs text-white focus:border-[#111111]"
                        >
                          {SWEETNESS_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* B9. Daytime / Nighttime Suitability (Multi-Select) */}
                  <div className="space-y-2 pt-1">
                    <label className="block text-[11px] font-semibold text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-[#111111]" />
                      <span>9. Daytime / Nighttime Suitability <span className="text-[10px] text-[#737373] font-normal lowercase">(multi-select)</span></span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {DAY_NIGHT_OPTIONS.map(dn => {
                        const isSelected = (activeScentProfile.daytimeNighttime || []).includes(dn);
                        return (
                          <button
                            key={dn}
                            type="button"
                            onClick={() => toggleMultiSelectOption('daytimeNighttime', dn)}
                            className={`px-3 py-1.5 text-xs border transition-all cursor-pointer flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-[#111111] text-white text-black border-[#111111] font-semibold shadow-xs'
                                : 'bg-white text-[#737373] border-[#EAEAEA] hover:border-zinc-600 hover:text-[#111111]'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 text-black" />}
                            <span>{dn}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* B11. Scent Description & Recommendation Explanation */}
                  <div className="space-y-3 pt-2">
                    <label className="block text-[11px] font-semibold text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-[#111111]" />
                      <span>11. Scent Profile Description & Recommendation Explanation</span>
                    </label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">Product-Specific Scent Description</label>
                        <textarea
                          value={activeScentProfile.scentDescription || ''}
                          onChange={e => updateScentProfile('scentDescription', e.target.value)}
                          rows={3}
                          className="w-full bg-[#F8F8F8] border border-[#EAEAEA] px-3 py-2 text-xs text-white focus:border-[#111111] font-sans"
                          placeholder="Rich, detailed description of how the scent evolves on skin..."
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">Recommendation Engine Explanation</label>
                        <textarea
                          value={activeScentProfile.recommendationExplanation || ''}
                          onChange={e => updateScentProfile('recommendationExplanation', e.target.value)}
                          rows={3}
                          className="w-full bg-[#F8F8F8] border border-[#EAEAEA] px-3 py-2 text-xs text-white focus:border-[#111111] font-sans"
                          placeholder="Why this fragrance is recommended for the selected answers/profiles..."
                        />
                      </div>
                    </div>
                  </div>

                </div>

                {/* Section C: Olfactory Attribute Rating Sliders */}
                <div className="pt-3 border-t border-[#EAEAEA] space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-[#111111] uppercase tracking-wider">Performance Rating Sliders</h4>
                    <button
                      type="button"
                      onClick={() => {
                        const attrs = editingProduct.attributes || DEFAULT_ATTRIBUTES;
                        setEditingProduct({
                          ...editingProduct,
                          attributes: [...attrs, { id: 'attr-' + Date.now(), name: 'Custom Rating', value: 80, enabled: true }]
                        });
                      }}
                      className="text-[10px] bg-[#F4F4F4] hover:bg-zinc-700 px-2 py-1 text-[#111111] uppercase cursor-pointer"
                    >
                      + Add Attribute Slider
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#F8F8F8] p-3 border border-[#EAEAEA]">
                    {(editingProduct.attributes || DEFAULT_ATTRIBUTES).map((attr, idx) => (
                      <div key={attr.id || idx} className="p-2 border border-[#EAEAEA] bg-white/60 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={attr.name}
                            onChange={e => {
                              const attrs = [...(editingProduct.attributes || DEFAULT_ATTRIBUTES)];
                              attrs[idx].name = e.target.value;
                              setEditingProduct({ ...editingProduct, attributes: attrs });
                            }}
                            className="bg-transparent text-xs font-medium text-white border-b border-[#EAEAEA] focus:border-[#111111] px-1 py-0.5"
                          />
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono font-bold text-[#111111]">{attr.value}%</span>
                            <label className="inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={attr.enabled}
                                onChange={e => {
                                  const attrs = [...(editingProduct.attributes || DEFAULT_ATTRIBUTES)];
                                  attrs[idx].enabled = e.target.checked;
                                  setEditingProduct({ ...editingProduct, attributes: attrs });
                                }}
                                className="sr-only peer"
                              />
                              <div className="w-7 h-4 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#111111] text-white relative"></div>
                            </label>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={attr.value}
                            onChange={e => {
                              const attrs = [...(editingProduct.attributes || DEFAULT_ATTRIBUTES)];
                              attrs[idx].value = Number(e.target.value);
                              setEditingProduct({ ...editingProduct, attributes: attrs });
                            }}
                            className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section D: Decant Size Variants & Pricing */}
                <div className="pt-2 border-t border-[#EAEAEA]">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-semibold text-[#111111] uppercase tracking-wider">Decant Size Variants & Pricing</h4>
                    <button
                      type="button"
                      onClick={() => {
                        const curr = editingProduct.variants || [];
                        setEditingProduct({
                          ...editingProduct,
                          variants: [...curr, { size: '5ml', price: 490, stock_qty: 100 }]
                        });
                      }}
                      className="text-[10px] bg-[#F4F4F4] hover:bg-zinc-700 px-2 py-1 text-[#111111] uppercase cursor-pointer"
                    >
                      + Add Size Variant
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(editingProduct.variants || []).map((v, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-[#F8F8F8] p-2 border border-[#EAEAEA]">
                        <input
                          type="text"
                          value={v.size}
                          placeholder="Size (e.g. 5ml)"
                          onChange={e => {
                            const vars = [...(editingProduct.variants || [])];
                            vars[idx].size = e.target.value;
                            setEditingProduct({ ...editingProduct, variants: vars });
                          }}
                          className="w-1/3 bg-white border border-[#EAEAEA] px-2 py-1 text-xs text-white"
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
                          className="w-1/3 bg-white border border-[#EAEAEA] px-2 py-1 text-xs text-white font-mono"
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
                          className="w-1/3 bg-white border border-[#EAEAEA] px-2 py-1 text-xs text-white font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const vars = (editingProduct.variants || []).filter((_, i) => i !== idx);
                            setEditingProduct({ ...editingProduct, variants: vars });
                          }}
                          className="text-red-400 p-1 hover:text-red-300 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Modal Footer - Fixed */}
              <div className="px-6 py-4 flex items-center justify-end gap-3 border-t border-[#EAEAEA] shrink-0 bg-white">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-[#F4F4F4] hover:bg-zinc-700 text-white text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#111111] text-white hover:bg-amber-300 text-black text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
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

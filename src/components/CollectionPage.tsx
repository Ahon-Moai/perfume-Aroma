import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronRight,
  SlidersHorizontal,
  X,
  Check,
  ShoppingBag,
  Sparkles,
  ArrowLeft,
  ArrowUpDown,
  Filter,
  Grid,
  RefreshCw,
  Tag
} from 'lucide-react';
import { FragranceProduct, Collection, FilterState } from '../types';
import { fetchCollectionBySlug, fetchPublicProducts } from '../services/api';

interface CollectionPageProps {
  collectionSlug: string;
  allProducts: FragranceProduct[];
  onNavigateHome: () => void;
  onNavigateToCollection: (slug: string) => void;
  onNavigateToProduct: (product: FragranceProduct) => void;
  onAddToCart: (product: FragranceProduct, size: string, price: number, qty: number) => void;
  showToast: (msg: string) => void;
}

const DEFAULT_FILTER_STATE: FilterState = {
  gender: [],
  family: [],
  season: [],
  occasion: [],
  brand: [],
  size: [],
  concentration: [],
  minPrice: '',
  maxPrice: '',
  featured: false,
  newArrival: false,
  sort: 'featured',
  search: ''
};

export const CollectionPage: React.FC<CollectionPageProps> = ({
  collectionSlug,
  allProducts,
  onNavigateHome,
  onNavigateToCollection,
  onNavigateToProduct,
  onAddToCart,
  showToast
}) => {
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loadingCollection, setLoadingCollection] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState<FragranceProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Initialize filters from URL search params
  const [filters, setFilters] = useState<FilterState>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return {
      gender: searchParams.get('gender') ? searchParams.get('gender')!.split(',') : [],
      family: searchParams.get('family') ? searchParams.get('family')!.split(',') : [],
      season: searchParams.get('season') ? searchParams.get('season')!.split(',') : [],
      occasion: searchParams.get('occasion') ? searchParams.get('occasion')!.split(',') : [],
      brand: searchParams.get('brand') ? searchParams.get('brand')!.split(',') : [],
      size: searchParams.get('size') ? searchParams.get('size')!.split(',') : [],
      concentration: searchParams.get('concentration') ? searchParams.get('concentration')!.split(',') : [],
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      featured: searchParams.get('featured') === 'true',
      newArrival: searchParams.get('newArrival') === 'true',
      sort: searchParams.get('sort') || 'featured',
      search: searchParams.get('search') || ''
    };
  });

  // Load collection metadata
  useEffect(() => {
    let isMounted = true;
    setLoadingCollection(true);

    fetchCollectionBySlug(collectionSlug).then((col) => {
      if (isMounted) {
        if (col) {
          setCollection(col);
          document.title = `${col.title} Collection — AROMATICA ONE`;
        } else {
          // Fallback title formatting
          const formattedTitle = ucwords(collectionSlug.replace(/-/g, ' '));
          setCollection({
            id: 'col-' + collectionSlug,
            title: formattedTitle,
            slug: collectionSlug,
            description: `Curated ${formattedTitle} luxury decant selections.`
          });
          document.title = `${formattedTitle} — AROMATICA ONE`;
        }
        setLoadingCollection(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [collectionSlug]);

  // Sync state to URL search parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.gender.length) params.set('gender', filters.gender.join(','));
    if (filters.family.length) params.set('family', filters.family.join(','));
    if (filters.season.length) params.set('season', filters.season.join(','));
    if (filters.occasion.length) params.set('occasion', filters.occasion.join(','));
    if (filters.brand.length) params.set('brand', filters.brand.join(','));
    if (filters.size.length) params.set('size', filters.size.join(','));
    if (filters.concentration.length) params.set('concentration', filters.concentration.join(','));
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    if (filters.featured) params.set('featured', 'true');
    if (filters.newArrival) params.set('newArrival', 'true');
    if (filters.sort && filters.sort !== 'featured') params.set('sort', filters.sort);
    if (filters.search) params.set('search', filters.search);

    const queryStr = params.toString();
    const newRelativePathQuery = window.location.pathname + (queryStr ? '?' + queryStr : '');
    window.history.replaceState(null, '', newRelativePathQuery);
  }, [filters, collectionSlug]);

  // Load products dynamically based on collection and filters
  useEffect(() => {
    let isMounted = true;
    setLoadingProducts(true);

    const queryParams: Record<string, string> = {
      collection: collectionSlug,
      sort: filters.sort
    };

    if (filters.gender.length) queryParams.gender = filters.gender.join(',');
    if (filters.family.length) queryParams.family = filters.family.join(',');
    if (filters.season.length) queryParams.season = filters.season.join(',');
    if (filters.occasion.length) queryParams.occasion = filters.occasion.join(',');
    if (filters.brand.length) queryParams.brand = filters.brand.join(',');
    if (filters.size.length) queryParams.size = filters.size.join(',');
    if (filters.concentration.length) queryParams.concentration = filters.concentration.join(',');
    if (filters.minPrice) queryParams.min_price = filters.minPrice;
    if (filters.maxPrice) queryParams.max_price = filters.maxPrice;
    if (filters.featured) queryParams.featured = '1';
    if (filters.newArrival) queryParams.new_arrival = '1';
    if (filters.search) queryParams.search = filters.search;

    fetchPublicProducts(queryParams).then((prods) => {
      if (isMounted) {
        setFilteredProducts(prods || []);
        setLoadingProducts(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [collectionSlug, filters]);

  // Available brands derived dynamically from all store products
  const availableBrands = useMemo(() => {
    const set = new Set<string>();
    allProducts.forEach((p) => {
      if (p.brand) set.add(p.brand);
    });
    return Array.from(set).sort();
  }, [allProducts]);

  // Option lists
  const GENDER_OPTIONS = [
    { label: 'For Him', value: 'Him' },
    { label: 'For Her', value: 'Her' },
    { label: 'Unisex', value: 'Unisex' }
  ];

  const FAMILY_OPTIONS = [
    'Floral', 'Woody', 'Amber / Oriental', 'Fresh / Citrus', 'Gourmand',
    'Aquatic / Marine', 'Aromatic / Herbal', 'Leather', 'Spicy', 'Musk'
  ];

  const SEASON_OPTIONS = ['Spring', 'Summer', 'Autumn', 'Winter', 'All Seasons'];

  const OCCASION_OPTIONS = [
    'Daily / Casual', 'Office / Work', 'Evening / Date Night',
    'Formal / Black Tie', 'Party / Nightout', 'Gym / Sport', 'Special Occasions'
  ];

  const SIZE_OPTIONS = ['3ml', '5ml', '9ml', '10ml', '15ml'];

  const CONCENTRATION_OPTIONS = ['EDT', 'EDP', 'Parfum', 'Extrait'];

  // Toggle filter option helper
  const toggleArrayFilter = (group: keyof FilterState, val: string) => {
    setFilters((prev) => {
      const current = Array.isArray(prev[group]) ? (prev[group] as string[]) : [];
      const exists = current.includes(val);
      const updated = exists ? current.filter((item) => item !== val) : [...current, val];
      return { ...prev, [group]: updated };
    });
  };

  const handleClearAllFilters = () => {
    setFilters({ ...DEFAULT_FILTER_STATE, sort: filters.sort });
    showToast('Filters cleared');
  };

  // Active filter count check
  const activeFilterCount =
    filters.gender.length +
    filters.family.length +
    filters.season.length +
    filters.occasion.length +
    filters.brand.length +
    filters.size.length +
    filters.concentration.length +
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    (filters.featured ? 1 : 0) +
    (filters.newArrival ? 1 : 0) +
    (filters.search ? 1 : 0);

  function ucwords(str: string) {
    return str.replace(/\b\w/g, (l) => l.toUpperCase());
  }

  // Filter Drawer / Sidebar Component
  const FilterContent = () => (
    <div className="space-y-6 text-xs font-sans text-zinc-800">
      {/* Search Input Filter */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-mono tracking-widest text-zinc-400 uppercase font-semibold">
          Search Within Collection
        </label>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          placeholder="Fragrance name, brand or note..."
          className="w-full bg-[#fafaf8] border border-zinc-200 px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-950"
        />
      </div>

      {/* Fragrance Audience / Gender */}
      <div className="space-y-2 pt-3 border-t border-zinc-200">
        <span className="block text-[10px] font-mono tracking-widest text-zinc-500 uppercase font-bold">
          Fragrance Audience
        </span>
        <div className="space-y-1.5">
          {GENDER_OPTIONS.map((g) => {
            const isChecked = filters.gender.includes(g.value);
            return (
              <label
                key={g.value}
                className="flex items-center gap-2 cursor-pointer text-zinc-700 hover:text-black py-0.5 select-none"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleArrayFilter('gender', g.value)}
                  className="rounded-none border-zinc-300 text-zinc-950 focus:ring-zinc-950 cursor-pointer accent-zinc-950"
                />
                <span className={isChecked ? 'font-semibold text-zinc-950' : ''}>{g.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Fragrance Family */}
      <div className="space-y-2 pt-3 border-t border-zinc-200">
        <span className="block text-[10px] font-mono tracking-widest text-zinc-500 uppercase font-bold">
          Olfactory Family
        </span>
        <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar pr-1">
          {FAMILY_OPTIONS.map((fam) => {
            const isChecked = filters.family.includes(fam);
            return (
              <label
                key={fam}
                className="flex items-center gap-2 cursor-pointer text-zinc-700 hover:text-black py-0.5 select-none"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleArrayFilter('family', fam)}
                  className="rounded-none border-zinc-300 text-zinc-950 focus:ring-zinc-950 cursor-pointer accent-zinc-950"
                />
                <span className={isChecked ? 'font-semibold text-zinc-950' : ''}>{fam}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Seasons */}
      <div className="space-y-2 pt-3 border-t border-zinc-200">
        <span className="block text-[10px] font-mono tracking-widest text-zinc-500 uppercase font-bold">
          Suitable Seasons
        </span>
        <div className="space-y-1.5">
          {SEASON_OPTIONS.map((season) => {
            const isChecked = filters.season.includes(season);
            return (
              <label
                key={season}
                className="flex items-center gap-2 cursor-pointer text-zinc-700 hover:text-black py-0.5 select-none"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleArrayFilter('season', season)}
                  className="rounded-none border-zinc-300 text-zinc-950 focus:ring-zinc-950 cursor-pointer accent-zinc-950"
                />
                <span className={isChecked ? 'font-semibold text-zinc-950' : ''}>{season}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Brand Filter */}
      {availableBrands.length > 0 && (
        <div className="space-y-2 pt-3 border-t border-zinc-200">
          <span className="block text-[10px] font-mono tracking-widest text-zinc-500 uppercase font-bold">
            Fragrance House / Brand
          </span>
          <div className="space-y-1.5 max-h-44 overflow-y-auto no-scrollbar pr-1">
            {availableBrands.map((b) => {
              const isChecked = filters.brand.includes(b);
              return (
                <label
                  key={b}
                  className="flex items-center gap-2 cursor-pointer text-zinc-700 hover:text-black py-0.5 select-none"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleArrayFilter('brand', b)}
                    className="rounded-none border-zinc-300 text-zinc-950 focus:ring-zinc-950 cursor-pointer accent-zinc-950"
                  />
                  <span className={isChecked ? 'font-semibold text-zinc-950' : ''}>{b}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Suitable Occasions */}
      <div className="space-y-2 pt-3 border-t border-zinc-200">
        <span className="block text-[10px] font-mono tracking-widest text-zinc-500 uppercase font-bold">
          Suitable Occasion
        </span>
        <div className="space-y-1.5 max-h-40 overflow-y-auto no-scrollbar pr-1">
          {OCCASION_OPTIONS.map((occ) => {
            const isChecked = filters.occasion.includes(occ);
            return (
              <label
                key={occ}
                className="flex items-center gap-2 cursor-pointer text-zinc-700 hover:text-black py-0.5 select-none"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleArrayFilter('occasion', occ)}
                  className="rounded-none border-zinc-300 text-zinc-950 focus:ring-zinc-950 cursor-pointer accent-zinc-950"
                />
                <span className={isChecked ? 'font-semibold text-zinc-950' : ''}>{occ}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Decant Volume / Sizes */}
      <div className="space-y-2 pt-3 border-t border-zinc-200">
        <span className="block text-[10px] font-mono tracking-widest text-zinc-500 uppercase font-bold">
          Decant Volume
        </span>
        <div className="flex flex-wrap gap-1.5">
          {SIZE_OPTIONS.map((sz) => {
            const isChecked = filters.size.includes(sz);
            return (
              <button
                key={sz}
                type="button"
                onClick={() => toggleArrayFilter('size', sz)}
                className={`px-2.5 py-1 text-[11px] border transition-all cursor-pointer font-mono ${
                  isChecked
                    ? 'bg-zinc-950 text-white border-zinc-950'
                    : 'bg-[#fafafa] text-zinc-700 border-zinc-200 hover:border-zinc-400'
                }`}
              >
                {sz}
              </button>
            );
          })}
        </div>
      </div>

      {/* Concentration */}
      <div className="space-y-2 pt-3 border-t border-zinc-200">
        <span className="block text-[10px] font-mono tracking-widest text-zinc-500 uppercase font-bold">
          Concentration
        </span>
        <div className="space-y-1.5">
          {CONCENTRATION_OPTIONS.map((c) => {
            const isChecked = filters.concentration.includes(c);
            return (
              <label
                key={c}
                className="flex items-center gap-2 cursor-pointer text-zinc-700 hover:text-black py-0.5 select-none"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleArrayFilter('concentration', c)}
                  className="rounded-none border-zinc-300 text-zinc-950 focus:ring-zinc-950 cursor-pointer accent-zinc-950"
                />
                <span className={isChecked ? 'font-semibold text-zinc-950' : ''}>{c}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-2 pt-3 border-t border-zinc-200">
        <span className="block text-[10px] font-mono tracking-widest text-zinc-500 uppercase font-bold">
          Price Range (৳ BDT)
        </span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={filters.minPrice}
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
            placeholder="Min ৳"
            className="w-1/2 bg-[#fafaf8] border border-zinc-200 px-2 py-1 text-xs text-zinc-900 font-mono focus:outline-none focus:border-zinc-950"
          />
          <span className="text-zinc-400 font-mono">-</span>
          <input
            type="number"
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            placeholder="Max ৳"
            className="w-1/2 bg-[#fafaf8] border border-zinc-200 px-2 py-1 text-xs text-zinc-900 font-mono focus:outline-none focus:border-zinc-950"
          />
        </div>
      </div>

      {/* Special Attributes */}
      <div className="space-y-2 pt-3 border-t border-zinc-200">
        <span className="block text-[10px] font-mono tracking-widest text-zinc-500 uppercase font-bold">
          Highlights & Badges
        </span>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 cursor-pointer text-zinc-700 hover:text-black py-0.5 select-none">
            <input
              type="checkbox"
              checked={filters.featured}
              onChange={(e) => setFilters({ ...filters, featured: e.target.checked })}
              className="rounded-none border-zinc-300 text-zinc-950 focus:ring-zinc-950 cursor-pointer accent-zinc-950"
            />
            <span className={filters.featured ? 'font-semibold text-zinc-950' : ''}>Best Sellers / Featured</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-zinc-700 hover:text-black py-0.5 select-none">
            <input
              type="checkbox"
              checked={filters.newArrival}
              onChange={(e) => setFilters({ ...filters, newArrival: e.target.checked })}
              className="rounded-none border-zinc-300 text-zinc-950 focus:ring-zinc-950 cursor-pointer accent-zinc-950"
            />
            <span className={filters.newArrival ? 'font-semibold text-zinc-950' : ''}>New Arrivals</span>
          </label>
        </div>
      </div>

      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={handleClearAllFilters}
          className="w-full py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer mt-4"
        >
          Clear All Filters ({activeFilterCount})
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-[#fdfbf7] text-zinc-900 min-h-screen selection:bg-zinc-900 selection:text-white">
      {/* 1. Breadcrumb Header */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="flex items-center justify-between border-b border-zinc-200/80 pb-3 text-xs font-sans text-zinc-500">
          <div className="flex items-center gap-2 truncate">
            <button
              onClick={onNavigateHome}
              className="hover:text-zinc-950 transition-colors uppercase tracking-wider text-[11px] cursor-pointer"
            >
              Home
            </button>
            <ChevronRight className="w-3 h-3 text-zinc-400 shrink-0" />
            <span className="uppercase tracking-wider text-[11px] text-zinc-400 shrink-0">
              Collections
            </span>
            <ChevronRight className="w-3 h-3 text-zinc-400 shrink-0" />
            <span className="text-zinc-900 font-medium truncate text-[11px]">
              {collection?.title || ucwords(collectionSlug.replace(/-/g, ' '))}
            </span>
          </div>

          <button
            onClick={onNavigateHome}
            className="hidden sm:flex items-center gap-1.5 text-zinc-600 hover:text-black transition-colors text-[11px] uppercase tracking-wider shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return To Boutique</span>
          </button>
        </div>
      </div>

      {/* 2. Collection Header Banner & Story */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="relative bg-white border border-zinc-200 p-6 sm:p-10 shadow-xs overflow-hidden">
          {collection?.image && (
            <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 pointer-events-none hidden md:block">
              <img
                src={collection.image}
                alt={collection.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent" />
            </div>
          )}

          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="text-[10px] font-mono tracking-[0.25em] text-amber-800 uppercase font-bold block">
              AROMATICA COLLECTION EDITIONS
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-zinc-950 font-normal leading-tight">
              {collection?.title || ucwords(collectionSlug.replace(/-/g, ' '))}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 font-sans leading-relaxed">
              {collection?.description || 'Discover hand-decanted luxury fragrances sourced directly from original European & Middle Eastern brand flacons.'}
            </p>
            <div className="pt-2 flex items-center gap-4 text-xs font-mono text-zinc-500">
              <span>{filteredProducts.length} Decant Edt. Available</span>
              <span>•</span>
              <span className="text-emerald-700 font-sans font-semibold">100% Authentic Guaranteed</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Catalog Two-Column Layout (Filters + Product Grid) */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top Control Bar (Mobile filter toggle & Sorting dropdown) */}
        <div className="bg-white border border-zinc-200 p-4 mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center justify-between sm:justify-start gap-4">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 bg-zinc-950 text-white px-4 py-2 text-xs font-sans uppercase tracking-wider font-semibold cursor-pointer shadow-xs"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filter ({activeFilterCount})</span>
            </button>

            <span className="text-xs text-zinc-500 font-sans">
              Showing <strong className="text-zinc-950 font-mono">{filteredProducts.length}</strong> fragrances
            </span>
          </div>

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs text-zinc-500 font-sans uppercase tracking-wider text-[10px] hidden sm:inline">
              Sort By:
            </span>
            <select
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
              className="bg-[#fafaf8] border border-zinc-200 text-zinc-900 text-xs px-3 py-2 focus:outline-none focus:border-zinc-950 font-sans cursor-pointer"
            >
              <option value="featured">Featured / Curated</option>
              <option value="best-selling">Best Selling</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* Active Filter Chips Bar */}
        {activeFilterCount > 0 && (
          <div className="bg-white border border-zinc-200 p-3 mb-6 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">
              Active Filters:
            </span>

            {filters.gender.map((g) => (
              <span key={g} className="bg-amber-100 text-amber-900 border border-amber-200 px-2 py-1 text-[11px] font-medium flex items-center gap-1">
                Gender: {g}
                <button type="button" onClick={() => toggleArrayFilter('gender', g)} className="hover:text-black cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {filters.family.map((f) => (
              <span key={f} className="bg-amber-100 text-amber-900 border border-amber-200 px-2 py-1 text-[11px] font-medium flex items-center gap-1">
                Family: {f}
                <button type="button" onClick={() => toggleArrayFilter('family', f)} className="hover:text-black cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {filters.season.map((s) => (
              <span key={s} className="bg-zinc-100 text-zinc-800 border border-zinc-200 px-2 py-1 text-[11px] font-medium flex items-center gap-1">
                Season: {s}
                <button type="button" onClick={() => toggleArrayFilter('season', s)} className="hover:text-black cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {filters.brand.map((b) => (
              <span key={b} className="bg-zinc-100 text-zinc-800 border border-zinc-200 px-2 py-1 text-[11px] font-medium flex items-center gap-1">
                Brand: {b}
                <button type="button" onClick={() => toggleArrayFilter('brand', b)} className="hover:text-black cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {filters.occasion.map((o) => (
              <span key={o} className="bg-zinc-100 text-zinc-800 border border-zinc-200 px-2 py-1 text-[11px] font-medium flex items-center gap-1">
                Occasion: {o}
                <button type="button" onClick={() => toggleArrayFilter('occasion', o)} className="hover:text-black cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {filters.size.map((sz) => (
              <span key={sz} className="bg-zinc-100 text-zinc-800 border border-zinc-200 px-2 py-1 text-[11px] font-medium flex items-center gap-1 font-mono">
                Size: {sz}
                <button type="button" onClick={() => toggleArrayFilter('size', sz)} className="hover:text-black cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {filters.concentration.map((c) => (
              <span key={c} className="bg-zinc-100 text-zinc-800 border border-zinc-200 px-2 py-1 text-[11px] font-medium flex items-center gap-1">
                Concentration: {c}
                <button type="button" onClick={() => toggleArrayFilter('concentration', c)} className="hover:text-black cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {filters.minPrice && (
              <span className="bg-zinc-100 text-zinc-800 border border-zinc-200 px-2 py-1 text-[11px] font-medium flex items-center gap-1 font-mono">
                Min: ৳{filters.minPrice}
                <button type="button" onClick={() => setFilters({ ...filters, minPrice: '' })} className="hover:text-black cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.maxPrice && (
              <span className="bg-zinc-100 text-zinc-800 border border-zinc-200 px-2 py-1 text-[11px] font-medium flex items-center gap-1 font-mono">
                Max: ৳{filters.maxPrice}
                <button type="button" onClick={() => setFilters({ ...filters, maxPrice: '' })} className="hover:text-black cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.search && (
              <span className="bg-zinc-100 text-zinc-800 border border-zinc-200 px-2 py-1 text-[11px] font-medium flex items-center gap-1">
                Search: "{filters.search}"
                <button type="button" onClick={() => setFilters({ ...filters, search: '' })} className="hover:text-black cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={handleClearAllFilters}
              className="text-[11px] font-semibold text-amber-800 hover:underline uppercase ml-auto cursor-pointer"
            >
              Clear All
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Sidebar Filter Panel (Cols 1-3) */}
          <div className="hidden lg:block lg:col-span-3 bg-white border border-zinc-200 p-6 sticky top-24 shadow-xs">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3 mb-4">
              <span className="text-xs font-sans uppercase font-bold tracking-widest text-zinc-950 flex items-center gap-2">
                <Filter className="w-4 h-4 text-amber-700" />
                <span>Filter Catalog</span>
              </span>
              {activeFilterCount > 0 && (
                <button
                  onClick={handleClearAllFilters}
                  className="text-[10px] text-amber-800 hover:underline uppercase font-mono cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>

            <FilterContent />
          </div>

          {/* Product Grid Area (Cols 4-12 on desktop) */}
          <div className="lg:col-span-9">
            {loadingProducts ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                {[1, 2, 3, 4, 5, 6].map((idx) => (
                  <div key={idx} className="bg-white border border-zinc-200 p-4 animate-pulse space-y-3">
                    <div className="w-full aspect-square bg-zinc-100" />
                    <div className="h-3 bg-zinc-100 w-1/2" />
                    <div className="h-4 bg-zinc-200 w-3/4" />
                    <div className="h-3 bg-zinc-100 w-1/3" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white border border-zinc-200 p-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl text-zinc-950">
                  No Fragrances Match Your Filters
                </h3>
                <p className="text-xs text-zinc-600 max-w-md mx-auto font-sans leading-relaxed">
                  Try clearing some filter criteria or searching for another scent family or brand name.
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleClearAllFilters}
                    className="inline-flex items-center gap-2 bg-zinc-950 text-white hover:bg-amber-400 hover:text-black px-6 py-2.5 text-xs uppercase font-sans tracking-wider transition-all cursor-pointer shadow-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset All Filters</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group bg-white border border-zinc-200/90 hover:border-zinc-400 transition-all flex flex-col justify-between p-4 shadow-xs"
                  >
                    <div>
                      {/* Product Image Stage */}
                      <div
                        onClick={() => onNavigateToProduct(product)}
                        className="relative w-full aspect-square bg-[#fafaf8] border border-zinc-100 p-3 flex items-center justify-center overflow-hidden cursor-pointer mb-3"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Badges Overlay */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          {product.gender && (
                            <span className="bg-amber-100 text-amber-900 border border-amber-200 text-[8px] font-sans font-bold uppercase px-1.5 py-0.5">
                              {product.gender}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="space-y-1">
                        <span className="text-[9px] font-sans tracking-widest text-amber-800 font-bold uppercase block">
                          {product.brand}
                        </span>
                        <h3
                          onClick={() => onNavigateToProduct(product)}
                          className="font-serif text-sm sm:text-base text-zinc-950 font-normal leading-snug line-clamp-1 cursor-pointer hover:text-amber-800 transition-colors"
                        >
                          {product.name}
                        </h3>
                        <p className="text-[10px] font-sans text-zinc-500 uppercase truncate">
                          {product.category}
                        </p>
                      </div>
                    </div>

                    {/* Sizes & Price CTA */}
                    <div className="pt-3 mt-3 border-t border-zinc-150 space-y-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[10px] text-zinc-400 font-mono">FROM</span>
                        <span className="font-serif text-base text-zinc-950 font-bold tabular-nums">
                          ৳ {product.startingPrice}
                        </span>
                      </div>

                      {/* Sizes Chips */}
                      {product.sizes && product.sizes.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {product.sizes.slice(0, 3).map((s) => (
                            <button
                              key={s.size}
                              onClick={() => onAddToCart(product, s.size, s.price, 1)}
                              className="text-[9px] font-mono bg-zinc-50 hover:bg-zinc-950 hover:text-white border border-zinc-200 px-1.5 py-0.5 transition-colors cursor-pointer"
                              title={`Add ${s.size} for ৳${s.price}`}
                            >
                              {s.size}
                            </button>
                          ))}
                        </div>
                      )}

                      <button
                        onClick={() => onAddToCart(product, product.sizes[0]?.size || '5ml', product.sizes[0]?.price || product.startingPrice, 1)}
                        className="w-full bg-zinc-950 hover:bg-zinc-800 text-white py-2 text-[10px] font-sans uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>Add To Bag</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Slide-Over Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-xs flex justify-end lg:hidden">
          <div className="relative w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 bg-white">
              <span className="text-xs font-sans uppercase font-bold tracking-widest text-zinc-950 flex items-center gap-2">
                <Filter className="w-4 h-4 text-amber-700" />
                <span>Filter Fragrances ({activeFilterCount})</span>
              </span>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 text-zinc-500 hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <FilterContent />
            </div>

            <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center gap-3">
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="w-1/3 py-2.5 bg-zinc-200 text-zinc-950 text-xs uppercase tracking-wider font-semibold cursor-pointer"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-2/3 py-2.5 bg-zinc-950 text-white text-xs uppercase tracking-wider font-semibold cursor-pointer"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

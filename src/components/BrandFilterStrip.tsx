import React, { useState } from 'react';
import { BRANDS_LIST } from '../data/fragranceData';

interface BrandFilterStripProps {
  onSelectBrand?: (brand: string) => void;
  brands?: Array<{ name: string; isNew?: boolean }>;
}

export const BrandFilterStrip: React.FC<BrandFilterStripProps> = ({ onSelectBrand, brands }) => {
  const list = brands && brands.length > 0 ? brands : BRANDS_LIST;
  const [activeItem, setActiveItem] = useState<string>(list[0]?.name || 'HERRERA');

  const handleSelect = (name: string) => {
    setActiveItem(name);
    if (onSelectBrand) {
      onSelectBrand(name);
    }
  };

  return (
    <div
      id="brands"
      className="w-full py-6 border-b overflow-hidden"
      style={{
        backgroundColor: 'var(--theme-surface)',
        borderColor: 'var(--theme-border-subtle)',
      }}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {list.map((brand) => {
            const isSelected = activeItem === brand.name;
            return (
              <button
                key={brand.name}
                onClick={() => handleSelect(brand.name)}
                className="whitespace-nowrap px-4 py-1.5 rounded-full border text-[11px] sm:text-xs font-sans tracking-wider uppercase transition-all duration-150 flex items-center gap-1.5 cursor-pointer shrink-0 hover:opacity-90"
                style={{
                  backgroundColor: isSelected ? 'var(--theme-btn-bg)' : 'var(--theme-surface-card)',
                  color: isSelected ? 'var(--theme-btn-text)' : 'var(--theme-text-primary)',
                  borderColor: isSelected ? 'var(--theme-border)' : 'var(--theme-border-subtle)',
                }}
              >
                <span>{brand.name}</span>
                {brand.isNew && (
                  <span
                    className="text-[8px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-tight"
                    style={{
                      backgroundColor: isSelected ? 'var(--theme-secondary)' : 'var(--theme-primary)',
                      color: '#FFFFFF',
                    }}
                  >
                    NEW
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

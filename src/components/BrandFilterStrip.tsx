import React, { useState } from 'react';
import { BRANDS_LIST } from '../data/fragranceData';

interface BrandFilterStripProps {
  onSelectBrand?: (brand: string) => void;
}

export const BrandFilterStrip: React.FC<BrandFilterStripProps> = ({ onSelectBrand }) => {
  const [activeItem, setActiveItem] = useState<string>('HERRERA');

  const handleSelect = (name: string) => {
    setActiveItem(name);
    if (onSelectBrand) {
      onSelectBrand(name);
    }
  };

  return (
    <div id="brands" className="w-full bg-white py-6 border-b border-zinc-100 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {BRANDS_LIST.map((brand) => {
            const isSelected = activeItem === brand.name;
            return (
              <button
                key={brand.name}
                onClick={() => handleSelect(brand.name)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full border text-[11px] sm:text-xs font-sans tracking-wider uppercase transition-all duration-150 flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  isSelected
                    ? 'border-zinc-950 bg-zinc-950 text-white'
                    : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 hover:text-zinc-950'
                }`}
              >
                <span>{brand.name}</span>
                {brand.isNew && (
                  <span
                    className={`text-[8px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-tight ${
                      isSelected
                        ? 'bg-red-600 text-white'
                        : 'bg-zinc-900 text-white'
                    }`}
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

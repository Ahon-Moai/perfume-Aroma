import React from 'react';

interface CategoryMarqueeProps {
  items?: string[];
}

export const CategoryMarquee: React.FC<CategoryMarqueeProps> = ({ items }) => {
  const defaultItems = [
    'CURATE',
    'JUDGE',
    'REFINE',
    'TEST',
    'CURATE',
    'JUDGE',
    'REFINE',
    'TEST'
  ];

  const marqueeItems = items && items.length > 0 ? items : defaultItems;

  return (
    <div className="w-full bg-white border-b border-zinc-200 overflow-hidden py-3 sm:py-5 select-none">
      <div className="relative w-full overflow-hidden flex items-center">
        {/* Infinite scrolling track */}
        <div className="animate-marquee-smooth flex items-center gap-12 sm:gap-20 whitespace-nowrap">
          {marqueeItems.concat(marqueeItems).map((word, idx) => (
            <div key={idx} className="flex items-center gap-12 sm:gap-20">
              <span className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-[0.18em] text-[#0d3b2e] uppercase transition-colors">
                {word}
              </span>
              <span className="text-[#0d3b2e]/60 text-2xl sm:text-3xl font-serif">
                —
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

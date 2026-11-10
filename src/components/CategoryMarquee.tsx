import React from 'react';

interface CategoryMarqueeProps {
  items?: string[];
  onNavigateToCollection?: (slug: string) => void;
}

export const CategoryMarquee: React.FC<CategoryMarqueeProps> = ({ items, onNavigateToCollection }) => {
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
    <div
      className="w-full border-b overflow-hidden py-3 sm:py-5 select-none"
      style={{
        backgroundColor: 'var(--theme-surface-card)',
        borderColor: 'var(--theme-border-subtle)',
      }}
    >
      <div className="relative w-full overflow-hidden flex items-center">
        {/* Infinite scrolling track */}
        <div className="animate-marquee-smooth flex items-center gap-12 sm:gap-20 whitespace-nowrap">
          {marqueeItems.concat(marqueeItems).map((word, idx) => (
            <div key={idx} className="flex items-center gap-12 sm:gap-20">
              <button
                type="button"
                onClick={() => {
                  const slug = word.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                  if (onNavigateToCollection) onNavigateToCollection(slug || 'all');
                }}
                className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-[0.18em] uppercase transition-opacity hover:opacity-75 cursor-pointer"
                style={{ color: 'var(--theme-primary)' }}
              >
                {word}
              </button>
              <span className="text-2xl sm:text-3xl font-serif opacity-50" style={{ color: 'var(--theme-secondary)' }}>
                —
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

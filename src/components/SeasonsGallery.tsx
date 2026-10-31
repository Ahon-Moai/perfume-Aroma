import React from 'react';
import { IMAGES } from '../data/fragranceData';
import { SeasonsGalleryData, SeasonCardData } from '../types';

interface SeasonsGalleryProps {
  seasonsData?: SeasonsGalleryData;
  onExploreClick?: () => void;
  onNavigateToCollection?: (slug: string) => void;
  hideHeader?: boolean;
}

const defaultSeasonCards: SeasonCardData[] = [
  {
    id: 'season-autumn',
    name: 'Autumn Bloom',
    description: 'Red sun dunes & smoked woods',
    image: IMAGES.seasons.autumnDune,
    alt: 'Autumn Dune with Blood Red Sun fragrance campaign'
  },
  {
    id: 'season-winter',
    name: 'Architectural Winter',
    description: 'Concrete geometry & crimson sillage',
    image: IMAGES.seasons.winterStreet,
    alt: 'Monochrome street architecture with crimson ribbon fragrance campaign'
  },
  {
    id: 'season-summer',
    name: 'Midnight Rose',
    description: 'Velvet petals & monochrome pedestal',
    image: IMAGES.seasons.summerRoses,
    alt: 'Sculptural velvet roses on geometric pedestal campaign'
  },
  {
    id: 'season-spring',
    name: 'Crimson Shadows',
    description: 'Stark birch forest & damp moss',
    image: IMAGES.seasons.springForest,
    alt: 'Dark birch forest with red branches fragrance campaign'
  }
];

export const SeasonsGallery: React.FC<SeasonsGalleryProps> = ({
  seasonsData,
  onExploreClick,
  onNavigateToCollection,
  hideHeader = false
}) => {
  const sectionTitle = seasonsData?.section_title || 'SEASONS';
  const sectionSubtitle = seasonsData?.section_subtitle || 'CHOOSE YOURS';
  const seasonCards = seasonsData?.cards && seasonsData.cards.length > 0
    ? seasonsData.cards
    : defaultSeasonCards;

  const cardsContent = (
    <div className="flex sm:grid sm:grid-cols-4 gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar pb-3 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
      {seasonCards.map((card) => {
        const seasonSlug = card.id.replace('season-', '').toLowerCase();
        return (
          <div
            key={card.id}
            onClick={() => onNavigateToCollection ? onNavigateToCollection(seasonSlug) : onExploreClick?.()}
            className="flex-shrink-0 w-[240px] sm:w-auto relative group overflow-hidden bg-zinc-950 cursor-pointer aspect-[3/4] sm:aspect-[9/13]"
          >
            <img
              src={card.image}
              alt={card.alt}
              className="w-full h-full object-cover object-center group-hover:scale-[1.04] transition-transform duration-700 ease-out"
              referrerPolicy="no-referrer"
              loading="lazy"
            />

            {/* Always visible gradient & info */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-4 transition-all">
              <p className="font-serif text-white text-base sm:text-lg font-normal tracking-wide">
                {card.name}
              </p>
              <p className="text-[11px] text-zinc-300 font-sans tracking-wider mt-0.5">
                {card.description}
              </p>
              <div className="mt-2.5 flex items-center gap-1.5 text-[11px] sm:text-xs font-sans font-semibold tracking-wider text-amber-300 group-hover:text-amber-200 transition-colors uppercase">
                <span className="underline underline-offset-4 decoration-amber-400/60 group-hover:decoration-amber-300">Explore Decants</span>
                <span className="text-sm transition-transform group-hover:translate-x-1">→</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  if (hideHeader) {
    return <div id="seasons" className="w-full">{cardsContent}</div>;
  }

  return (
    <section id="seasons" className="w-full bg-white pt-6 pb-14 border-b border-zinc-100">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Right-aligned Section Header as in screenshot */}
        <div className="flex flex-col items-end mb-4 sm:mb-6">
          <h2 className="font-serif text-lg sm:text-2xl font-light tracking-[0.16em] text-zinc-950 uppercase">
            {sectionTitle}
          </h2>
          <span className="text-[9px] sm:text-[10px] tracking-[0.22em] font-sans text-zinc-400 uppercase mt-0.5">
            {sectionSubtitle}
          </span>
        </div>

        {cardsContent}
      </div>
    </section>
  );
};

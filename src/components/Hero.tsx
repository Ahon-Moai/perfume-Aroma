import React, { useState } from 'react';
import { Sparkles, Droplets, Flower2, ShieldCheck, ChevronRight, X } from 'lucide-react';
import { IMAGES } from '../data/fragranceData';

interface HeroProps {
  onExploreClick: () => void;
  onOrderProduct?: () => void;
}

interface OlfactoryElement {
  id: string;
  name: string;
  tier: string;
  tagline: string;
  description: string;
  icon: string;
  image: string;
}

export const Hero: React.FC<HeroProps> = ({ onExploreClick, onOrderProduct }) => {
  const [activeElement, setActiveElement] = useState<OlfactoryElement | null>(null);

  const elements: OlfactoryElement[] = [
    {
      id: 'neroli',
      name: 'White Neroli Blossoms',
      tier: 'Top Note · Solar Floral',
      tagline: 'Hand-picked morning orange blossoms',
      description: 'Bright, dewy white petals bursting with crystalline floral elegance and luminous solar citrus nuance.',
      icon: '🌸',
      image: IMAGES.purePortionsIngredients
    },
    {
      id: 'vanilla',
      name: 'Madagascar Bourbon Vanilla',
      tier: 'Heart Note · Warm Gourmand',
      tagline: 'Sun-cured dark vanilla bean pods',
      description: 'Slow-cured black vanilla pods delivering deep, velvety warmth without synthetic sweetness.',
      icon: '🌿',
      image: IMAGES.purePortionsIngredients
    },
    {
      id: 'amber',
      name: 'Golden Amber Crystals',
      tier: 'Base Note · Radiant Resin',
      tagline: 'Translucent amber resin facets',
      description: 'Rich balsamic resin crystals creating an enduring, golden trail of 12+ hour sillage.',
      icon: '✨',
      image: IMAGES.purePortionsIngredients
    },
    {
      id: 'atomizer',
      name: '5ml Pocket Precision Atomizer',
      tier: 'Hardware · Travel Engineered',
      tagline: '75+ ultra-fine micro-mist sprays',
      description: 'High-pressure sealed glass flacon with glossy black cap and holographic framing. Zero leakage in transit.',
      icon: '💧',
      image: IMAGES.purePortionsBottle
    }
  ];

  return (
    <section className="relative w-full overflow-hidden bg-zinc-950 text-white">
      {/* Cinematic Panoramic Campaign Backdrop */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[21/9] lg:aspect-[24/10] min-h-[520px] sm:min-h-[580px] lg:min-h-[660px] max-h-[820px] overflow-hidden">
        <img
          src={IMAGES.hero}
          alt="Pure Portions by ARRINA luxury 5ml perfume travel atomizer floating in zero gravity with neroli, vanilla beans, and amber crystals"
          className="w-full h-full object-cover object-center scale-[1.01] transition-transform duration-1000 ease-out"
          priority-hint="high"
          referrerPolicy="no-referrer"
        />

        {/* Cinematic Scrims: Dark left gradient for editorial copy legibility while keeping center-right bright & sunlit */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/15 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

        {/* Main Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-between max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-14 py-8 sm:py-12 pointer-events-none">
          {/* Top subtle brand badge */}
          <div className="pointer-events-auto flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/40 backdrop-blur-md border border-white/20 rounded-full text-[10px] tracking-[0.22em] uppercase font-sans text-amber-300">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>THE SIGNATURE DECANTS EDITION</span>
            </div>

            <div className="hidden md:flex items-center gap-3 text-[11px] font-sans tracking-widest text-zinc-300 uppercase">
              <span className="text-white font-medium">ARRINA ATELIER</span>
              <span>·</span>
              <span>PURE PORTIONS COLLECTION</span>
            </div>
          </div>

          {/* Central Editorial Copy & Holographic Product Showcase */}
          <div className="max-w-xl lg:max-w-2xl space-y-4 sm:space-y-5 pointer-events-auto my-auto pt-4">
            {/* Holographic foil brand ribbon */}
            <div className="inline-block relative">
              <div className="px-3 py-1 bg-gradient-to-r from-cyan-500/20 via-pink-500/20 to-amber-500/20 border border-white/30 backdrop-blur-md rounded-none">
                <span className="font-serif italic text-xs sm:text-sm tracking-wider text-white">
                  Pure Portions <span className="not-italic text-[10px] tracking-[0.25em] font-sans uppercase text-amber-300">BY ARRINA</span>
                </span>
              </div>
            </div>

            {/* Headline */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl tracking-tight text-white font-normal uppercase leading-[1.06] text-balance">
              LUXURY, BY THE ML
            </h1>

            {/* Narrative description emphasizing the elements */}
            <p className="text-xs sm:text-sm text-zinc-200 font-sans font-light tracking-wide leading-relaxed max-w-lg">
              Weightless neroli blossom, cured Madagascar bourbon vanilla, and radiant golden amber suspended in pure olfactory clarity. Engineered for pocket elegance.
            </p>

            {/* 5 ML (75+ SPRAYS) Luxury Specifier from Image */}
            <div className="flex items-center gap-3 py-1">
              <div className="h-[1px] bg-white/40 w-8 sm:w-12" />
              <p className="font-serif text-xs sm:text-sm tracking-[0.26em] text-amber-200 uppercase font-light">
                5 ML ( 75+ SPRAYS )
              </p>
              <div className="h-[1px] bg-white/40 w-8 sm:w-12" />
            </div>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onOrderProduct || onExploreClick}
                className="inline-flex items-center gap-2.5 bg-white text-zinc-950 hover:bg-amber-300 hover:text-black text-[11px] sm:text-xs tracking-[0.16em] uppercase font-sans font-semibold px-6 py-3 transition-all duration-200 cursor-pointer shadow-lg"
              >
                <span>ORDER PURE PORTIONS · ৳ 490</span>
                <span className="text-xs font-mono">↗</span>
              </button>

              <button
                onClick={onExploreClick}
                className="inline-flex items-center gap-2 border border-white/60 hover:border-white bg-black/40 hover:bg-black/60 text-white text-[11px] sm:text-xs tracking-[0.16em] uppercase font-sans px-5 py-3 transition-all duration-200 cursor-pointer backdrop-blur-md"
              >
                <span>EXPLORE ALL DECANTS</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Bottom Elements Showcase Bar */}
          <div className="pointer-events-auto pt-6 border-t border-white/15">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] tracking-[0.22em] uppercase font-sans text-amber-300 font-medium">
                  OLFACTORY ELEMENTS:
                </span>
                <span className="text-[11px] text-zinc-400 font-light hidden sm:inline">
                  Click to inspect raw botanicals & hardware
                </span>
              </div>

              {/* Element Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {elements.map((el) => (
                  <button
                    key={el.id}
                    onClick={() => setActiveElement(el)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-black/50 hover:bg-black/80 border border-white/20 hover:border-amber-400/80 rounded-full text-xs font-sans tracking-wide text-zinc-200 hover:text-white transition-all cursor-pointer backdrop-blur-md"
                  >
                    <span className="text-sm">{el.icon}</span>
                    <span className="text-[11px] font-medium">{el.name.split(' ')[0]}</span>
                    <span className="text-[9px] text-zinc-400 uppercase tracking-widest hidden xs:inline">
                      ({el.tier.split(' ')[0]})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Element Modal Inspector */}
      {activeElement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-700 shadow-2xl p-6 sm:p-8 space-y-5 text-white">
            <button
              onClick={() => setActiveElement(null)}
              aria-label="Close element inspector"
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <span className="text-3xl p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
                {activeElement.icon}
              </span>
              <div>
                <span className="text-[10px] tracking-[0.2em] uppercase font-sans text-amber-400 font-medium">
                  {activeElement.tier}
                </span>
                <h3 className="font-serif text-2xl font-normal text-white">
                  {activeElement.name}
                </h3>
              </div>
            </div>

            <div className="relative aspect-[16/9] w-full bg-zinc-900 overflow-hidden border border-zinc-800">
              <img
                src={activeElement.image}
                alt={activeElement.name}
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-serif italic text-amber-200">
                "{activeElement.tagline}"
              </p>
              <p className="text-xs text-zinc-300 font-sans font-light leading-relaxed">
                {activeElement.description}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-zinc-800">
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Raw botanical purity in every decant.</span>
              </div>
              <button
                onClick={() => {
                  setActiveElement(null);
                  if (onOrderProduct) onOrderProduct();
                }}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black text-xs font-sans tracking-wider uppercase font-semibold transition-colors cursor-pointer"
              >
                Order Atomizer
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

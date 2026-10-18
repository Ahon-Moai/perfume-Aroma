import React, { useState } from 'react';
import { Sparkles, Droplets, ShieldCheck, ChevronRight, X, Flame, Award, CheckCircle2 } from 'lucide-react';

interface HeroProps {
  onExploreClick: () => void;
  onOrderProduct?: () => void;
  heroData?: {
    headline?: string;
    tagline?: string;
    specifier?: string;
    primary_cta_text?: string;
    secondary_cta_text?: string;
    image?: string;
  };
}

// BOTTLE IMAGES PROVIDED BY USER
const BOTTLE_IMAGES = {
  jpgElixir: 'https://ik.imagekit.io/t1q0n1ovm/jean-paul-gaultier-le-male-elixir-parfum-perfume-cologne-495648-removebg-preview.png',
  lattafaKhamrah: 'https://ik.imagekit.io/t1q0n1ovm/lattafa-khamrah-edp-perfume-cologne-871932-removebg-preview.png',
  bleuChanel: 'https://ik.imagekit.io/t1q0n1ovm/pngegg.png?updatedAt=1791829401535'
};

interface OlfactoryElement {
  id: string;
  name: string;
  tier: string;
  tagline: string;
  description: string;
  icon: string;
  image: string;
}

export const Hero: React.FC<HeroProps> = ({ onExploreClick, onOrderProduct, heroData }) => {
  const [activeElement, setActiveElement] = useState<OlfactoryElement | null>(null);

  const headline = heroData?.headline || 'Decants';
  const tagline = heroData?.tagline || 'Experience world-class luxury fragrances in hand-filled, authentic travel atomizers. Designed for modern perfume connoisseurs who appreciate elegance on the go.';
  const specifier = heroData?.specifier || '5 ML ( 75+ SPRAYS ) · 100% PURE PORTIONS';
  const primaryCta = heroData?.primary_cta_text || 'EXPLORE ALL DECANTS';
  const secondaryCta = heroData?.secondary_cta_text || 'ORDER PURE PORTION · ৳ 490';

  const elements: OlfactoryElement[] = [
    {
      id: 'jpg',
      name: 'Le Male Elixir',
      tier: 'Jean Paul Gaultier · Warm Amber',
      tagline: 'Deep honeyed tonka & lavender elixir',
      description: 'An intense, radiant blend of wild lavender, warm honeyed tonka bean, and benzoin resin.',
      icon: '✨',
      image: BOTTLE_IMAGES.jpgElixir
    },
    {
      id: 'khamrah',
      name: 'Khamrah EDP',
      tier: 'Lattafa · Gourmet Spice',
      tagline: 'Rich cinnamon & praline amber',
      description: 'Opulent gourmand fragrance infused with nutmeg, sweet praline, dates, and creamy vanilla.',
      icon: '🔥',
      image: BOTTLE_IMAGES.lattafaKhamrah
    },
    {
      id: 'chanel',
      name: 'Bleu de Chanel',
      tier: 'Chanel · Woody Aromatic',
      tagline: 'Crisp citrus & cedarwood sillage',
      description: 'A timeless, sophisticated blend of fresh grapefruit, dry cedarwood, and smoky incense.',
      icon: '💎',
      image: BOTTLE_IMAGES.bleuChanel
    }
  ];

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-stone-50 via-white to-amber-50/20 text-zinc-900 min-h-[640px] sm:min-h-[720px] lg:min-h-[780px] flex flex-col justify-between py-8 sm:py-12 lg:py-16 border-b border-stone-200/80">
      {/* Background Soft Glows & Subtle Pattern */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] sm:w-[900px] h-[350px] sm:h-[500px] bg-amber-200/25 rounded-full blur-[130px]" />
        <div className="absolute -top-20 -left-20 w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] bg-amber-100/40 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[400px] sm:w-[500px] h-[400px] sm:h-[500px] bg-amber-100/30 rounded-full blur-[120px]" />

        {/* Subtle grid lines for high-end luxury aesthetic */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:36px_36px] opacity-60" />
      </div>

      {/* Main Container */}
      <div className="relative max-w-[1400px] w-full mx-auto px-4 sm:px-8 lg:px-12 my-auto z-10 flex flex-col items-center text-center">

        {/* Top Floating Badge Ribbon */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-amber-50/90 border border-amber-200/80 rounded-full text-[10px] sm:text-xs tracking-[0.22em] uppercase font-sans text-amber-900 backdrop-blur-md shadow-sm mb-6 sm:mb-8">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span className="font-semibold">AUTHENTIC LUXURY PARFUM DECANTS</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        </div>

        {/* Dynamic Composition: Floating Perfume Bottle Deck + Big Text */}
        <div className="relative w-full max-w-5xl my-4 sm:my-6 flex flex-col items-center justify-center">

          {/* FLOATING BOTTLE LAYER 1 (Left: Lattafa Khamrah - Tilted left) */}
          <div className="absolute left-2 sm:left-6 lg:left-12 top-[-20px] sm:top-[-10px] lg:top-[-30px] w-28 sm:w-44 lg:w-56 z-0 pointer-events-none transform -rotate-12 scale-90 sm:scale-95 filter drop-shadow-[0_20px_25px_rgba(0,0,0,0.12)] transition-all duration-500 hover:scale-105 hover:z-30">
            <div className="relative group">
              <img
                src={BOTTLE_IMAGES.lattafaKhamrah}
                alt="Lattafa Khamrah Decant Bottle"
                className="w-full h-auto object-contain transition-transform duration-700 ease-out"
              />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-white/90 border border-stone-200 rounded text-[9px] font-mono uppercase tracking-widest text-zinc-800 shadow-md whitespace-nowrap opacity-0 sm:opacity-100 transition-opacity">
                Khamrah EDP
              </div>
            </div>
          </div>

          {/* FLOATING BOTTLE LAYER 2 (Right: Bleu de Chanel - Tilted right) */}
          <div className="absolute right-2 sm:right-6 lg:left-[calc(50%+180px)] top-[20px] sm:top-[30px] lg:top-[-10px] w-28 sm:w-44 lg:w-56 z-0 pointer-events-none transform rotate-12 scale-90 sm:scale-95 filter drop-shadow-[0_20px_25px_rgba(0,0,0,0.12)] transition-all duration-500 hover:scale-105 hover:z-30">
            <div className="relative group">
              <img
                src={BOTTLE_IMAGES.bleuChanel}
                alt="Bleu de Chanel Decant Bottle"
                className="w-full h-auto object-contain transition-transform duration-700 ease-out"
              />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-white/90 border border-stone-200 rounded text-[9px] font-mono uppercase tracking-widest text-zinc-800 shadow-md whitespace-nowrap opacity-0 sm:opacity-100 transition-opacity">
                Bleu EDP
              </div>
            </div>
          </div>

          {/* FLOATING BOTTLE LAYER 3 (Center Foreground: JPG Le Male Elixir) */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-12 sm:-top-20 lg:-top-24 w-32 sm:w-52 lg:w-64 z-20 pointer-events-none transform rotate-6 hover:rotate-0 transition-transform duration-700 ease-out">
            <img
              src={BOTTLE_IMAGES.jpgElixir}
              alt="Jean Paul Gaultier Le Male Elixir Decant Bottle"
              className="w-full h-auto filter drop-shadow-[0_25px_30px_rgba(0,0,0,0.18)] object-contain"
            />
          </div>

          {/* CENTRAL BIG TYPOGRAPHY & HEADING */}
          <div className="relative z-10 pt-16 sm:pt-28 lg:pt-32 space-y-3 sm:space-y-4 max-w-4xl px-2">

            {/* Big Headline styled with bold black typography on white */}
            <h1 className="font-serif text-4xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-[0.95] text-zinc-950">
              {headline.toLowerCase().includes('decant') ? (
                <>
                  <span className="block text-zinc-950 tracking-wider font-sans font-black">{headline}</span>
                  <span className="block font-serif italic text-amber-800 font-normal tracking-normal text-3xl sm:text-6xl lg:text-7xl mt-1 text-transparent bg-clip-text bg-gradient-to-r from-amber-800 via-amber-600 to-amber-900">
                    that feel extraordinary.
                  </span>
                </>
              ) : (
                <>
                  <span className="block text-zinc-950 font-sans font-black">{headline}</span>
                  <span className="block font-serif italic text-amber-800 font-normal tracking-normal text-3xl sm:text-6xl lg:text-7xl mt-1">
                    Luxury by the ML
                  </span>
                </>
              )}
            </h1>

            {/* Sub-Headline & Specifier */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <span className="h-[1px] w-8 sm:w-16 bg-gradient-to-r from-transparent to-amber-600/60" />
              <p className="font-mono text-[11px] sm:text-xs tracking-[0.25em] text-amber-900 font-bold uppercase">
                {specifier}
              </p>
              <span className="h-[1px] w-8 sm:w-16 bg-gradient-to-l from-transparent to-amber-600/60" />
            </div>

            {/* Tagline narrative */}
            <p className="text-xs sm:text-base text-zinc-600 font-sans font-normal max-w-2xl mx-auto leading-relaxed px-4">
              {tagline}
            </p>

            {/* Floating Interactive Badges */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-stone-200 rounded-lg text-zinc-700 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[11px] font-sans font-medium">Guaranteed 100% Authentic</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-stone-200 rounded-lg text-zinc-700 shadow-sm">
                <Droplets className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[11px] font-sans font-medium">75+ Ultra-fine Sprays</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-stone-200 rounded-lg text-zinc-700 shadow-sm">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-[11px] font-sans font-medium">Travel Atomizers</span>
              </div>
            </div>

            {/* Primary & Secondary Call To Action Buttons */}
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
              <button
                onClick={onExploreClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-zinc-900 hover:bg-black text-white text-xs sm:text-sm tracking-[0.16em] uppercase font-sans font-bold px-8 py-4 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer shadow-lg rounded-none"
              >
                <span>{primaryCta}</span>
                <ChevronRight className="w-4 h-4 text-amber-400" />
              </button>

              <button
                onClick={onOrderProduct || onExploreClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-zinc-300 hover:border-zinc-900 bg-white hover:bg-stone-50 text-zinc-900 text-xs sm:text-sm tracking-[0.16em] uppercase font-sans font-semibold px-7 py-4 transition-all duration-300 cursor-pointer shadow-sm rounded-none"
              >
                <span>{secondaryCta}</span>
                <span className="text-amber-700 text-xs font-mono">↗</span>
              </button>
            </div>

          </div>
        </div>

        {/* Bottom Quick Decant Inspect Pills */}
        <div className="mt-8 sm:mt-12 pt-6 border-t border-stone-200/80 w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-600" />
            <span className="text-[11px] tracking-[0.2em] uppercase font-sans text-amber-950 font-bold">
              FEATURED DECANTS IN SELECTION:
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {elements.map((el) => (
              <button
                key={el.id}
                onClick={() => setActiveElement(el)}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-amber-50/50 border border-stone-200 hover:border-amber-300 rounded-full text-xs font-sans tracking-wide text-zinc-800 transition-all cursor-pointer shadow-sm"
              >
                <span className="text-sm">{el.icon}</span>
                <span className="text-[11px] font-medium">{el.name}</span>
                <span className="text-[9px] text-amber-700 font-mono uppercase tracking-wider font-semibold">
                  Inspect ↗
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Interactive Element Modal Inspector */}
      {activeElement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white border border-stone-200 shadow-2xl p-6 sm:p-8 space-y-5 text-zinc-900 rounded-lg">
            <button
              onClick={() => setActiveElement(null)}
              aria-label="Close element inspector"
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <span className="text-3xl p-3 bg-stone-50 border border-stone-200 rounded-lg">
                {activeElement.icon}
              </span>
              <div>
                <span className="text-[10px] tracking-[0.2em] uppercase font-sans text-amber-800 font-bold">
                  {activeElement.tier}
                </span>
                <h3 className="font-serif text-2xl font-bold text-zinc-900">
                  {activeElement.name}
                </h3>
              </div>
            </div>

            <div className="relative aspect-[16/10] w-full bg-gradient-to-b from-stone-50 to-amber-50/20 overflow-hidden border border-stone-200 rounded-md flex items-center justify-center p-4">
              <img
                src={activeElement.image}
                alt={activeElement.name}
                className="max-h-full max-w-full object-contain filter drop-shadow-[0_15px_20px_rgba(0,0,0,0.12)]"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-serif italic text-amber-900 font-medium">
                "{activeElement.tagline}"
              </p>
              <p className="text-xs text-zinc-600 font-sans font-normal leading-relaxed">
                {activeElement.description}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-stone-200">
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Authentic original perfume portion.</span>
              </div>
              <button
                onClick={() => {
                  setActiveElement(null);
                  if (onOrderProduct) {
                    onOrderProduct();
                  } else {
                    onExploreClick();
                  }
                }}
                className="px-4 py-2 bg-zinc-900 hover:bg-black text-white text-xs font-sans tracking-wider uppercase font-semibold transition-colors cursor-pointer rounded"
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

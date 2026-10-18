import React, { useState } from 'react';
import { Sparkles, Droplets, ShieldCheck, ChevronRight, X, Award, ArrowUpRight, CheckCircle2, Flame } from 'lucide-react';

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
  house: string;
  notes: string;
  description: string;
  image: string;
  badge: string;
}

export const Hero: React.FC<HeroProps> = ({ onExploreClick, onOrderProduct, heroData }) => {
  const [activeElement, setActiveElement] = useState<OlfactoryElement | null>(null);

  const headline = heroData?.headline || 'Decants';
  const tagline = heroData?.tagline || 'Experience world-class luxury fragrances in hand-filled, authentic travel atomizers. Designed for modern perfume connoisseurs who appreciate elegance on the go.';
  const specifier = heroData?.specifier || '5 ML ( 75+ SPRAYS ) · 100% PURE PORTIONS';
  const primaryCta = heroData?.primary_cta_text || 'EXPLORE DECANTS';
  const secondaryCta = heroData?.secondary_cta_text || 'ORDER PURE PORTION';

  const elements: Record<string, OlfactoryElement> = {
    jpg: {
      id: 'jpg',
      name: 'Le Male Elixir',
      house: 'Jean Paul Gaultier',
      notes: 'Honeyed Tonka, Lavender & Benzoin',
      description: 'An intense, radiant blend of wild lavender, warm honeyed tonka bean, and benzoin resin.',
      image: BOTTLE_IMAGES.jpgElixir,
      badge: 'Bestseller'
    },
    khamrah: {
      id: 'khamrah',
      name: 'Khamrah EDP',
      house: 'Lattafa Perfumes',
      notes: 'Rich Cinnamon, Praline & Warm Amber',
      description: 'An opulent gourmand fragrance infused with nutmeg, sweet praline, dates, and creamy vanilla.',
      image: BOTTLE_IMAGES.lattafaKhamrah,
      badge: 'Gourmand'
    },
    chanel: {
      id: 'chanel',
      name: 'Bleu de Chanel',
      house: 'Chanel Paris',
      notes: 'Fresh Grapefruit, Cedarwood & Incense',
      description: 'A timeless, sophisticated blend of fresh citrus, dry cedarwood, and smoky incense.',
      image: BOTTLE_IMAGES.bleuChanel,
      badge: 'Iconic'
    }
  };

  return (
    <section className="relative w-full bg-white text-zinc-950 border-b border-zinc-200 overflow-hidden pt-8 sm:pt-12 pb-12 sm:pb-16">
      {/* Background Subtle Gradient & Grid lines */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[600px] bg-gradient-to-b from-amber-50/60 via-zinc-100/40 to-transparent blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">

        {/* Top Eyebrow Tag */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-100 border border-zinc-200/80 text-[11px] sm:text-xs font-sans tracking-[0.2em] font-semibold text-zinc-800 uppercase shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Authentic Luxury Perfume Decants</span>
          </div>
        </div>

        {/* Hero Central Content & Scattered Floating Bottles Area (Payway Style) */}
        <div className="relative my-1 sm:my-6 min-h-[440px] sm:min-h-[540px] flex flex-col items-center justify-center text-center">

          {/* Floating Bottle 1: JPG Le Male Elixir (Top Left, Tilted Left) */}
          <div
            onClick={() => setActiveElement(elements.jpg)}
            className="flex absolute -left-1 sm:left-2 xl:left-8 -top-2 sm:top-0 z-20 group cursor-pointer flex-col items-center transition-all duration-500 hover:scale-105 hover:z-30"
          >
            <div className="relative w-16 sm:w-36 lg:w-44 xl:w-52 h-24 sm:h-48 lg:h-56 xl:h-64 -rotate-[14deg] group-hover:-rotate-[6deg] transition-transform duration-500 ease-out filter drop-shadow-[0_10px_16px_rgba(0,0,0,0.18)] sm:drop-shadow-[0_22px_30px_rgba(0,0,0,0.18)]">
              <img
                src={BOTTLE_IMAGES.jpgElixir}
                alt="JPG Le Male Elixir"
                className="w-full h-full object-contain"
              />
              <div className="absolute -bottom-1 -right-2 bg-amber-500 text-black text-[7px] sm:text-[10px] font-sans font-bold tracking-wider px-1 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-amber-300 shadow-md uppercase whitespace-nowrap">
                JPG Elixir
              </div>
            </div>
          </div>

          {/* Floating Bottle 2: Lattafa Khamrah (Bottom Left, Tilted Right) */}
          <div
            onClick={() => setActiveElement(elements.khamrah)}
            className="flex absolute -left-1 sm:left-4 lg:left-32 xl:left-40 bottom-12 sm:bottom-6 z-20 group cursor-pointer flex-col items-center transition-all duration-500 hover:scale-105 hover:z-30"
          >
            <div className="relative w-14 sm:w-36 lg:w-44 xl:w-48 h-20 sm:h-48 lg:h-56 xl:h-60 rotate-[12deg] group-hover:rotate-[6deg] transition-transform duration-500 ease-out filter drop-shadow-[0_10px_16px_rgba(0,0,0,0.22)] sm:drop-shadow-[0_24px_32px_rgba(0,0,0,0.22)]">
              <img
                src={BOTTLE_IMAGES.lattafaKhamrah}
                alt="Lattafa Khamrah EDP"
                className="w-full h-full object-contain"
              />
              <div className="absolute -top-1 -left-2 bg-zinc-950 text-white text-[7px] sm:text-[10px] font-sans font-semibold tracking-wider px-1 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-zinc-700 shadow-lg flex items-center gap-0.5 sm:gap-1 uppercase whitespace-nowrap">
                <Flame className="w-2 h-2 sm:w-3 sm:h-3 text-amber-400" />
                <span>Khamrah</span>
              </div>
            </div>
          </div>

          {/* Floating Bottle 3: Bleu de Chanel (Top Right, Tilted Left) */}
          <div
            onClick={() => setActiveElement(elements.chanel)}
            className="flex absolute -right-1 sm:right-2 xl:right-8 -top-1 sm:top-2 z-20 group cursor-pointer flex-col items-center transition-all duration-500 hover:scale-105 hover:z-30"
          >
            <div className="relative w-18 sm:w-36 lg:w-44 xl:w-52 h-24 sm:h-48 lg:h-56 xl:h-64 -rotate-[12deg] group-hover:-rotate-[4deg] transition-transform duration-500 ease-out filter drop-shadow-[0_10px_16px_rgba(0,0,0,0.18)] sm:drop-shadow-[0_22px_30px_rgba(0,0,0,0.18)]">
              <img
                src={BOTTLE_IMAGES.bleuChanel}
                alt="Bleu de Chanel"
                className="w-full h-full object-contain"
              />
              <div className="absolute -bottom-1 -left-2 bg-zinc-900 text-amber-400 text-[7px] sm:text-[10px] font-sans font-bold tracking-wider px-1 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-zinc-700 shadow-md uppercase whitespace-nowrap">
                Bleu Chanel
              </div>
            </div>
          </div>

          {/* Floating UI Card Pill (Bottom Right) */}
          <div
            onClick={() => setActiveElement(elements.chanel)}
            className="flex absolute -right-1 sm:right-4 lg:right-32 xl:right-40 bottom-12 sm:bottom-6 z-20 group cursor-pointer flex-col items-center transition-all duration-500 hover:scale-105 hover:z-30"
          >
            <div className="bg-white/90 backdrop-blur-md border border-zinc-300 p-1.5 sm:p-4 rounded-lg sm:rounded-2xl shadow-xl rotate-[-8deg] group-hover:rotate-0 transition-transform duration-300 flex items-center gap-1 sm:gap-3">
              <div className="w-6 h-6 sm:w-10 sm:h-10 rounded sm:rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-700 font-serif font-bold text-[10px] sm:text-lg">
                5ml
              </div>
              <div className="text-left">
                <div className="text-[9px] sm:text-xs font-bold text-zinc-900 uppercase tracking-wider">Atomizer</div>
                <div className="text-[9px] sm:text-[11px] text-zinc-500 font-mono hidden sm:block">75+ Sprays · Leakproof</div>
              </div>
            </div>
          </div>

          {/* Central Main Headline & Typography */}
          <div className="relative z-10 max-w-4xl mx-auto px-10 sm:px-24 md:px-32 lg:px-48 space-y-3 sm:space-y-6">
            <h1 className="font-serif text-3xl sm:text-7xl md:text-8xl lg:text-9xl font-normal tracking-tight text-zinc-950 leading-[0.98]">
              {headline.toLowerCase().includes('decant') ? (
                <>
                  <span className="block font-sans font-extrabold tracking-tight uppercase text-zinc-950 drop-shadow-xs">
                    {headline}
                  </span>
                  <span className="block font-serif italic text-zinc-800 font-normal mt-0.5 sm:mt-2 text-xl sm:text-6xl md:text-7xl lg:text-8xl">
                    that feel extraordinary.
                  </span>
                </>
              ) : (
                <>
                  <span className="block font-sans font-extrabold tracking-tight uppercase text-zinc-950 drop-shadow-xs">
                    {headline}
                  </span>
                  <span className="block font-serif italic text-zinc-800 font-normal mt-0.5 sm:mt-2 text-xl sm:text-6xl md:text-7xl lg:text-8xl">
                    Luxury by the ML
                  </span>
                </>
              )}
            </h1>

            {/* Subheading / Specifier */}
            <p className="font-mono text-[9px] sm:text-sm tracking-[0.15em] sm:tracking-[0.25em] text-zinc-500 font-semibold uppercase">
              {specifier}
            </p>

            {/* Tagline Narrative */}
            <p className="font-sans text-xs sm:text-base text-zinc-600 font-normal max-w-xl mx-auto leading-relaxed">
              {tagline}
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-4 w-full max-w-md mx-auto">
              <button
                onClick={onExploreClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs sm:text-sm tracking-[0.15em] sm:tracking-[0.18em] uppercase font-sans font-semibold px-6 sm:px-8 py-3 sm:py-4 transition-all duration-300 cursor-pointer shadow-xl shadow-zinc-950/10 rounded-none border border-zinc-950"
              >
                <span>{primaryCta}</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOrderProduct || onExploreClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-zinc-300 hover:border-zinc-950 bg-white hover:bg-zinc-50 text-zinc-900 text-xs sm:text-sm tracking-[0.15em] sm:tracking-[0.18em] uppercase font-sans font-semibold px-5 sm:px-7 py-3 sm:py-4 transition-all duration-300 cursor-pointer rounded-none"
              >
                <span>{secondaryCta}</span>
                <ArrowUpRight className="w-4 h-4 text-zinc-600" />
              </button>
            </div>
          </div>

        </div>

        {/* Floating Trust Pills */}
        <div className="mt-6 sm:mt-10 pt-6 border-t border-zinc-200/80 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-sans text-zinc-600">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-medium">100% Authentic Guaranteed</span>
          </div>
          <span className="hidden sm:inline text-zinc-300">•</span>
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-cyan-600" />
            <span className="font-medium">Hand-Filled Fresh Decants</span>
          </div>
          <span className="hidden sm:inline text-zinc-300">•</span>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-600" />
            <span className="font-medium">Leak-Proof Travel Atomizers</span>
          </div>
        </div>

      </div>

      {/* Interactive Fragrance Details Modal */}
      {activeElement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white border border-zinc-200 shadow-2xl p-6 sm:p-8 space-y-6 text-zinc-950">
            <button
              onClick={() => setActiveElement(null)}
              aria-label="Close details"
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-950 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[11px] tracking-[0.2em] font-sans text-amber-700 font-bold uppercase">
                {activeElement.house}
              </span>
              <h3 className="font-serif text-3xl font-semibold text-zinc-950">
                {activeElement.name}
              </h3>
            </div>

            <div className="relative aspect-[16/11] w-full bg-zinc-50 border border-zinc-200 flex items-center justify-center p-6">
              <img
                src={activeElement.image}
                alt={activeElement.name}
                className="max-h-full max-w-full object-contain filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.15)]"
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-semibold">
                Scent Profile: <span className="text-zinc-900 font-sans">{activeElement.notes}</span>
              </p>
              <p className="text-xs sm:text-sm text-zinc-600 font-sans leading-relaxed">
                {activeElement.description}
              </p>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-zinc-200">
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Pure original decant portion.</span>
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
                className="px-6 py-3 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-sans tracking-widest uppercase font-semibold transition-colors cursor-pointer"
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

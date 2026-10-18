import React, { useState } from 'react';
import { Sparkles, Droplets, ShieldCheck, ChevronRight, X, Award, ArrowUpRight, CheckCircle2 } from 'lucide-react';

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

  const elements: OlfactoryElement[] = [
    {
      id: 'khamrah',
      name: 'Khamrah EDP',
      house: 'Lattafa Perfumes',
      notes: 'Rich Cinnamon, Praline & Warm Amber',
      description: 'An opulent gourmand fragrance infused with nutmeg, sweet praline, dates, and creamy vanilla.',
      image: BOTTLE_IMAGES.lattafaKhamrah,
      badge: 'Gourmand'
    },
    {
      id: 'jpg',
      name: 'Le Male Elixir',
      house: 'Jean Paul Gaultier',
      notes: 'Honeyed Tonka, Lavender & Benzoin',
      description: 'An intense, radiant blend of wild lavender, warm honeyed tonka bean, and benzoin resin.',
      image: BOTTLE_IMAGES.jpgElixir,
      badge: 'Bestseller'
    },
    {
      id: 'chanel',
      name: 'Bleu de Chanel',
      house: 'Chanel Paris',
      notes: 'Fresh Grapefruit, Cedarwood & Incense',
      description: 'A timeless, sophisticated blend of fresh citrus, dry cedarwood, and smoky incense.',
      image: BOTTLE_IMAGES.bleuChanel,
      badge: 'Iconic'
    }
  ];

  return (
    <section className="relative w-full bg-white text-zinc-950 border-b border-zinc-200 overflow-hidden py-12 sm:py-16 lg:py-20">
      {/* Background Subtle Gradient & Grid lines */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-zinc-100/80 via-zinc-50/40 to-transparent blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">

        {/* Top Eyebrow Tag */}
        <div className="flex flex-col items-center text-center space-y-3 mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 border border-zinc-200/80 text-[11px] sm:text-xs font-sans tracking-[0.2em] font-semibold text-zinc-800 uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Authentic Luxury Perfume Decants</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal tracking-tight text-zinc-950 leading-[1.02] max-w-5xl">
            {headline.toLowerCase().includes('decant') ? (
              <>
                <span className="block font-sans font-bold tracking-tight uppercase text-zinc-950">{headline}</span>
                <span className="block font-serif italic text-zinc-800 font-normal mt-1 sm:mt-2">
                  that feel extraordinary.
                </span>
              </>
            ) : (
              <>
                <span className="block font-sans font-bold tracking-tight uppercase text-zinc-950">{headline}</span>
                <span className="block font-serif italic text-zinc-800 font-normal mt-1 sm:mt-2">
                  Luxury by the ML
                </span>
              </>
            )}
          </h1>

          {/* Subheading / Specifier */}
          <p className="font-mono text-xs sm:text-sm tracking-[0.22em] text-zinc-500 font-medium uppercase pt-2">
            {specifier}
          </p>

          {/* Tagline Narrative */}
          <p className="font-sans text-sm sm:text-base text-zinc-600 font-normal max-w-2xl leading-relaxed pt-1">
            {tagline}
          </p>

          {/* CTA Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-md">
            <button
              onClick={onExploreClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-zinc-950 hover:bg-zinc-800 text-white text-xs sm:text-sm tracking-[0.18em] uppercase font-sans font-semibold px-8 py-4 transition-all duration-300 cursor-pointer shadow-lg shadow-zinc-950/10 rounded-none border border-zinc-950"
            >
              <span>{primaryCta}</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOrderProduct || onExploreClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-zinc-300 hover:border-zinc-950 bg-white hover:bg-zinc-50 text-zinc-900 text-xs sm:text-sm tracking-[0.18em] uppercase font-sans font-semibold px-7 py-4 transition-all duration-300 cursor-pointer rounded-none"
            >
              <span>{secondaryCta}</span>
              <ArrowUpRight className="w-4 h-4 text-zinc-600" />
            </button>
          </div>
        </div>

        {/* Perfume Bottle Showcase Deck */}
        <div className="mt-8 sm:mt-12 lg:mt-16">
          <div className="text-center mb-6 sm:mb-8">
            <span className="text-[11px] font-mono tracking-[0.25em] text-zinc-400 uppercase font-semibold">
              Curated Bottle Selection
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {elements.map((el, index) => (
              <div
                key={el.id}
                onClick={() => setActiveElement(el)}
                className="group relative bg-zinc-50/70 hover:bg-white border border-zinc-200 hover:border-zinc-900 transition-all duration-500 p-6 sm:p-8 flex flex-col items-center justify-between cursor-pointer rounded-none shadow-sm hover:shadow-xl hover:shadow-zinc-200/60"
              >
                {/* Badge & Index Header */}
                <div className="w-full flex items-center justify-between text-xs font-mono text-zinc-400 pb-4 border-b border-zinc-200/60">
                  <span className="font-semibold text-zinc-900">0{index + 1}</span>
                  <span className="text-[10px] tracking-widest uppercase px-2.5 py-0.5 bg-zinc-200/60 text-zinc-800 font-sans font-semibold">
                    {el.badge}
                  </span>
                </div>

                {/* Bottle Image Container */}
                <div className="relative my-6 w-full h-56 sm:h-64 flex items-center justify-center p-2">
                  <div className="absolute inset-0 bg-radial from-zinc-200/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />
                  <img
                    src={el.image}
                    alt={el.name}
                    className="max-h-full max-w-full object-contain filter drop-shadow-[0_12px_20px_rgba(0,0,0,0.12)] group-hover:drop-shadow-[0_20px_30px_rgba(0,0,0,0.2)] group-hover:scale-105 transition-all duration-500 ease-out"
                  />
                </div>

                {/* Fragrance Information */}
                <div className="w-full text-center space-y-1.5 pt-4 border-t border-zinc-200/60">
                  <span className="text-[10px] tracking-[0.2em] font-sans font-semibold text-amber-700 uppercase block">
                    {el.house}
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl text-zinc-950 font-semibold group-hover:text-black transition-colors">
                    {el.name}
                  </h3>
                  <p className="text-xs text-zinc-500 font-sans line-clamp-1">
                    {el.notes}
                  </p>

                  <div className="pt-3 flex items-center justify-center gap-1.5 text-xs font-sans font-semibold text-zinc-900 group-hover:text-amber-800 transition-colors">
                    <span>Inspect Fragrance</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Trust Pills */}
        <div className="mt-12 sm:mt-16 pt-8 border-t border-zinc-200 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-sans text-zinc-600">
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

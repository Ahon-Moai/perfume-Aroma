import React, { useRef } from 'react';
import { Heart, MessageCircle, Instagram, ChevronLeft, ChevronRight } from 'lucide-react';
import { SOCIAL_CARDS } from '../data/fragranceData';
import { SocialCard } from '../types';

interface StudioSectionProps {
  socialCards?: SocialCard[];
}

export const StudioSection: React.FC<StudioSectionProps> = ({ socialCards }) => {
  const cards = socialCards && socialCards.length > 0 ? socialCards : SOCIAL_CARDS;
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -260, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 260, behavior: 'smooth' });
    }
  };

  return (
    <section
      id="studio-section"
      className="w-full py-16 sm:py-20 border-b transition-colors select-none"
      style={{
        backgroundColor: 'var(--theme-surface)',
        borderColor: 'var(--theme-border-subtle)',
      }}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column (Dominant Gallery): 4 Instagram / Social Cards */}
          <div className="lg:col-span-8 order-2 lg:order-1 flex flex-col justify-between">
            <div className="relative">
              {/* Carousel controls overlaid on edges */}
              <button
                onClick={scrollLeft}
                aria-label="Previous social post"
                className="hidden sm:flex absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full items-center justify-center border backdrop-blur-sm cursor-pointer shadow-md"
                style={{
                  backgroundColor: 'var(--theme-btn-bg)',
                  color: 'var(--theme-btn-text)',
                  borderColor: 'var(--theme-border-subtle)',
                }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={scrollRight}
                aria-label="Next social post"
                className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full items-center justify-center border backdrop-blur-sm cursor-pointer shadow-md"
                style={{
                  backgroundColor: 'var(--theme-btn-bg)',
                  color: 'var(--theme-btn-text)',
                  borderColor: 'var(--theme-border-subtle)',
                }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <div
                ref={scrollRef}
                className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-3 -mx-4 px-4 sm:mx-0 sm:px-0"
              >
                {cards.map((card) => (
                  <div
                    key={card.id}
                    className="flex-shrink-0 w-[210px] sm:w-[230px] rounded-xs overflow-hidden flex flex-col group cursor-pointer border shadow-sm transition-all"
                    style={{
                      backgroundColor: 'var(--theme-surface-card)',
                      borderColor: 'var(--theme-border-subtle)',
                    }}
                  >
                    {/* Header */}
                    <div
                      className="px-3 py-2 flex items-center justify-between border-b"
                      style={{
                        backgroundColor: 'var(--theme-surface)',
                        borderColor: 'var(--theme-border-subtle)',
                      }}
                    >
                      <span
                        className="text-[10px] font-mono font-medium"
                        style={{ color: 'var(--theme-text-primary)' }}
                      >
                        {card.handle}
                      </span>
                      <Instagram className="w-3 h-3 opacity-60" style={{ color: 'var(--theme-secondary)' }} />
                    </div>

                    {/* Image Area */}
                    <div className="relative aspect-square w-full bg-zinc-900 overflow-hidden">
                      <img
                        src={card.image}
                        alt="Aromatica fragrance studio social capture"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                    </div>

                    {/* Bottom Social Bar */}
                    <div
                      className="px-3 py-2 border-t flex items-center justify-between text-[10px]"
                      style={{
                        backgroundColor: 'var(--theme-surface)',
                        borderColor: 'var(--theme-border-subtle)',
                        color: 'var(--theme-text-secondary)',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 hover:opacity-80 transition-opacity">
                          <Heart className="w-3 h-3" style={{ color: 'var(--theme-secondary)' }} />
                          <span className="font-mono">{card.likes}</span>
                        </span>
                        <span className="flex items-center gap-1 hover:opacity-80 transition-opacity">
                          <MessageCircle className="w-3 h-3" />
                          <span className="font-mono">{card.comments}</span>
                        </span>
                      </div>
                      <Instagram className="w-3 h-3 opacity-60" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Swipe hint */}
            <div className="pt-3">
              <span
                className="text-[10px] tracking-[0.2em] uppercase font-sans opacity-70"
                style={{ color: 'var(--theme-secondary)' }}
              >
                SWIPE TO SEE MORE →
              </span>
            </div>
          </div>

          {/* Right Column: Heading and Instagram Follow link */}
          <div className="lg:col-span-4 order-1 lg:order-2 space-y-4 lg:pl-6">
            <p
              className="text-[10px] tracking-[0.22em] font-sans uppercase font-bold"
              style={{ color: 'var(--theme-secondary)' }}
            >
              BEHIND THE SCENES
            </p>

            <h2
              className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight leading-[1.12]"
              style={{ color: 'var(--theme-primary)' }}
            >
              Our Studio
            </h2>

            <p
              className="text-xs sm:text-sm font-sans font-light leading-relaxed opacity-80"
              style={{ color: 'var(--theme-text-secondary)' }}
            >
              New arrivals, recommendations, and the kind of details you only notice up close. Join us in our adventure.
            </p>

            <div className="pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 border px-4 py-2.5 text-xs font-sans tracking-wide transition-all group rounded-xs hover:opacity-90"
                style={{
                  backgroundColor: 'var(--theme-surface-card)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-primary)',
                }}
              >
                <span className="font-bold" style={{ color: 'var(--theme-secondary)' }}>@aromaticone</span>
                <span>Follow on Instagram</span>
                <span className="text-xs group-hover:translate-x-0.5 transition-transform">↗</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

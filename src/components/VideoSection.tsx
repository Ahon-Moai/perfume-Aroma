import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { VideoShowcaseCard, VideoShowcaseSectionData, FragranceProduct } from '../types';

interface VideoSectionProps {
  videoData?: VideoShowcaseSectionData | any;
  products?: FragranceProduct[];
  onSelectProduct?: (product: FragranceProduct) => void;
  onExploreClick?: () => void;
}

export const VideoSection: React.FC<VideoSectionProps> = ({
  videoData,
  products = [],
  onSelectProduct,
  onExploreClick
}) => {
  const isEnabled = videoData?.is_enabled ?? true;
  if (!isEnabled) return null;

  // Extract cards or fallback to single video_hero converted into card array if legacy data format
  let rawCards: VideoShowcaseCard[] = videoData?.cards || [];

  if (!rawCards.length && videoData?.video_url) {
    rawCards = [
      {
        id: 'legacy-1',
        title: videoData.headline || 'AURA & SILLAGE IN MOTION',
        video_url: videoData.video_url,
        thumbnail_url: videoData.poster_image,
        is_enabled: true
      }
    ];
  }

  const enabledCards = rawCards
    .filter((c) => c.is_enabled !== false)
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

  if (enabledCards.length === 0) return null;

  const headline = videoData?.headline || 'AURA & SILLAGE IN MOTION';
  const tagline =
    videoData?.tagline ||
    'Weightless liquid gold suspended in high-pressure glass atomizers. Experience the delicate art of artisanal decanting.';
  const badgeText = videoData?.badge_text || 'ARRINA CINEMATIC ATELIER';

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  // Individual play/pause state map
  const [playingState, setPlayingState] = useState<Record<string, boolean>>({});
  // Video load error map
  const [videoErrors, setVideoErrors] = useState<Record<string, boolean>>({});

  // Reduced motion preference check
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener?.('change', handleChange);
    return () => mediaQuery.removeEventListener?.('change', handleChange);
  }, []);

  // Initialize all videos to playing state if autoplay supported and reduced motion is false
  useEffect(() => {
    const initialPlaying: Record<string, boolean> = {};
    enabledCards.forEach((card) => {
      initialPlaying[card.id] = !prefersReducedMotion;
    });
    setPlayingState(initialPlaying);
  }, [enabledCards.length, prefersReducedMotion]);

  const togglePlayCard = (cardId: string) => {
    const videoEl = videoRefs.current[cardId];
    if (!videoEl) return;

    const isCurrentlyPlaying = playingState[cardId] ?? true;
    if (isCurrentlyPlaying) {
      videoEl.pause();
      setPlayingState((prev) => ({ ...prev, [cardId]: false }));
    } else {
      videoEl
        .play()
        .then(() => {
          setPlayingState((prev) => ({ ...prev, [cardId]: true }));
        })
        .catch(() => {
          setPlayingState((prev) => ({ ...prev, [cardId]: false }));
        });
    }
  };

  const handleVideoError = (cardId: string) => {
    setVideoErrors((prev) => ({ ...prev, [cardId]: true }));
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.75;
      scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.75;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleCardClick = (card: VideoShowcaseCard) => {
    if (card.product_id && products.length > 0) {
      const matched = products.find((p) => p.id === card.product_id);
      if (matched && onSelectProduct) {
        onSelectProduct(matched);
        return;
      }
    }
    if (onExploreClick) {
      onExploreClick();
    }
  };

  return (
    <section className="w-full bg-black py-12 sm:py-16 border-b border-zinc-900 relative overflow-hidden select-none">
      {/* Header Info */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center space-y-2">
        {badgeText && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-zinc-900/90 border border-amber-400/30 rounded-full text-[10px] tracking-[0.25em] text-amber-300 uppercase font-sans">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>{badgeText}</span>
          </div>
        )}
        <h2 className="font-serif text-2xl sm:text-4xl text-white font-light tracking-widest uppercase">
          {headline}
        </h2>
        {tagline && (
          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-zinc-400 font-sans tracking-wide leading-relaxed">
            {tagline}
          </p>
        )}
      </div>

      {/* Carousel Wrapper */}
      <div className="relative w-full max-w-[1536px] mx-auto px-4 sm:px-8 lg:px-12 group">
        {/* Navigation Arrows */}
        {enabledCards.length > 1 && (
          <>
            <button
              onClick={scrollLeft}
              aria-label="Previous showcase video"
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 bg-black/70 hover:bg-amber-400 text-white hover:text-black border border-zinc-700/80 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl backdrop-blur-md cursor-pointer opacity-80 hover:opacity-100 hover:scale-105"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <button
              onClick={scrollRight}
              aria-label="Next showcase video"
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 bg-black/70 hover:bg-amber-400 text-white hover:text-black border border-zinc-700/80 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl backdrop-blur-md cursor-pointer opacity-80 hover:opacity-100 hover:scale-105"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </>
        )}

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory py-2 px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {enabledCards.map((card) => {
            const isPlaying = playingState[card.id] ?? true;
            const isFailed = videoErrors[card.id];

            return (
              <div
                key={card.id}
                className="snap-start shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] group/card relative rounded-none overflow-hidden bg-zinc-950 border border-zinc-800/80 shadow-2xl transition-all duration-300 hover:border-zinc-700"
              >
                {/* Vertical Video / Thumbnail Container */}
                <div className="relative aspect-[3/4] sm:aspect-[9/16] w-full bg-zinc-900 overflow-hidden">
                  {!isFailed ? (
                    <video
                      ref={(el) => {
                        videoRefs.current[card.id] = el;
                      }}
                      src={card.video_url}
                      poster={card.thumbnail_url}
                      autoPlay={!prefersReducedMotion}
                      loop
                      muted
                      playsInline
                      onError={() => handleVideoError(card.id)}
                      className="w-full h-full object-cover object-center filter brightness-[0.92] contrast-[1.03] transition-transform duration-700 group-hover/card:scale-105"
                    />
                  ) : (
                    <img
                      src={card.thumbnail_url || '/src/assets/images/hero_pure_portions_arrina_1791911761493.jpg'}
                      alt={card.title}
                      className="w-full h-full object-cover object-center"
                    />
                  )}

                  {/* Dark subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                  {/* Centered Independent Play/Pause Button Overlay */}
                  {!isFailed && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePlayCard(card.id);
                        }}
                        aria-label={isPlaying ? `Pause ${card.title} video` : `Play ${card.title} video`}
                        className="w-12 h-12 sm:w-14 sm:h-14 bg-black/60 hover:bg-amber-400 text-white hover:text-black border border-white/20 hover:border-amber-400 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl backdrop-blur-md cursor-pointer hover:scale-110"
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5 sm:w-6 sm:h-6" />
                        ) : (
                          <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5" />
                        )}
                      </button>
                    </div>
                  )}

                  {/* Bottom Translucent White Product Panel */}
                  <div
                    onClick={() => handleCardClick(card)}
                    className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 z-20 bg-white/90 backdrop-blur-md text-zinc-900 p-2.5 sm:p-3 flex items-center gap-3 border border-white/40 shadow-xl cursor-pointer hover:bg-white transition-all duration-200 group-hover/card:shadow-2xl"
                  >
                    {/* Thumbnail Image */}
                    <div className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 bg-zinc-100 overflow-hidden border border-zinc-200">
                      <img
                        src={
                          card.thumbnail_url ||
                          '/src/assets/images/element_pure_portions_bottle_1791911761493.jpg'
                        }
                        alt={card.title}
                        className="w-full h-full object-cover object-center"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            '/src/assets/images/hero_pure_portions_arrina_1791911761493.jpg';
                        }}
                      />
                    </div>

                    {/* Title */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] tracking-widest text-zinc-500 font-mono uppercase truncate">
                        AROMATICA ATELIER
                      </p>
                      <h3 className="font-serif text-xs sm:text-sm font-medium text-zinc-950 truncate tracking-wide">
                        {card.title}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

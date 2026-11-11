import React, { useRef, useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Pause, Play, Quote } from 'lucide-react';
import { REVIEWS_LIST } from '../data/fragranceData';
import { ReviewItem } from '../types';

interface ReviewsSectionProps {
  reviews?: ReviewItem[];
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews }) => {
  const reviewsData = reviews && reviews.length > 0 ? reviews : REVIEWS_LIST;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <section
      className="w-full pt-14 pb-16 border-b select-none transition-colors"
      style={{
        backgroundColor: 'var(--theme-surface)',
        borderColor: 'var(--theme-border-subtle)',
      }}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Heading and Description */}
          <div className="lg:col-span-4 space-y-4 pr-4">
            <p
              className="text-[10px] tracking-[0.22em] font-sans uppercase font-bold"
              style={{ color: 'var(--theme-secondary)' }}
            >
              REVIEWS
            </p>
            
            <h2
              className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight leading-[1.12]"
              style={{ color: 'var(--theme-primary)' }}
            >
              Worn. Loved. Repeated.
            </h2>

            <p
              className="text-xs sm:text-sm font-sans font-light leading-relaxed max-w-sm opacity-80"
              style={{ color: 'var(--theme-text-secondary)' }}
            >
              Unfiltered words from people who actually wear them - the true feedbacks.
            </p>

            <div className="pt-2">
              <button
                onClick={() => {
                  const firstRev = scrollRef.current;
                  firstRev?.scrollTo({ left: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center text-[11px] sm:text-xs tracking-[0.14em] uppercase px-6 py-3 transition-colors cursor-pointer border rounded-xs hover:opacity-90"
                style={{
                  backgroundColor: 'var(--theme-btn-bg)',
                  color: 'var(--theme-btn-text)',
                  borderColor: 'var(--theme-border)',
                }}
              >
                View all reviews
              </button>
            </div>
          </div>

          {/* Right Column: Horizontal Cards Carousel */}
          <div className="lg:col-span-8 flex flex-col justify-between">
            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-4 -mx-4 px-4 sm:mx-0 sm:px-0"
            >
              {reviewsData.map((rev) => (
                <div
                  key={rev.id}
                  className="flex-shrink-0 w-[270px] sm:w-[320px] p-6 rounded-xs flex flex-col justify-between min-h-[220px] border shadow-xs transition-colors"
                  style={{
                    backgroundColor: 'var(--theme-surface-card)',
                    borderColor: 'var(--theme-border-subtle)',
                  }}
                >
                  <div className="space-y-3">
                    <Quote className="w-4 h-4 opacity-40" style={{ color: 'var(--theme-primary)' }} />
                    <p
                      className="font-serif text-xs sm:text-[13px] leading-relaxed font-light italic"
                      style={{ color: 'var(--theme-text-primary)' }}
                    >
                      "{rev.content}"
                    </p>
                  </div>

                  <div
                    className="pt-4 border-t mt-4"
                    style={{ borderColor: 'var(--theme-border-subtle)' }}
                  >
                    <div className="flex items-center gap-1 mb-1.5">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-500 text-amber-500" />
                      ))}
                    </div>
                    <p
                      className="font-sans text-xs font-semibold"
                      style={{ color: 'var(--theme-primary)' }}
                    >
                      {rev.author}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Controls Row: Swipe Hint & Arrows */}
            <div
              className="flex items-center justify-between pt-4 mt-2 border-t"
              style={{ borderColor: 'var(--theme-border-subtle)' }}
            >
              <span
                className="text-[10px] tracking-[0.2em] uppercase font-sans opacity-70"
                style={{ color: 'var(--theme-secondary)' }}
              >
                SWIPE TO SEE MORE →
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  aria-label={isPlaying ? 'Pause review autoplay' : 'Play review autoplay'}
                  className="w-7 h-7 sm:w-8 sm:h-8 border flex items-center justify-center transition-colors cursor-pointer"
                  style={{
                    backgroundColor: 'var(--theme-surface-card)',
                    borderColor: 'var(--theme-border-subtle)',
                    color: 'var(--theme-primary)',
                  }}
                >
                  {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                </button>
                <button
                  onClick={scrollLeft}
                  aria-label="Previous review"
                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center transition-colors cursor-pointer"
                  style={{
                    backgroundColor: 'var(--theme-btn-bg)',
                    color: 'var(--theme-btn-text)',
                  }}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={scrollRight}
                  aria-label="Next review"
                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center transition-colors cursor-pointer"
                  style={{
                    backgroundColor: 'var(--theme-btn-bg)',
                    color: 'var(--theme-btn-text)',
                  }}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

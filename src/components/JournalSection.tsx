import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { JOURNAL_ARTICLES } from '../data/fragranceData';
import { JournalArticle } from '../types';

interface JournalSectionProps {
  onReadArticle?: (article: JournalArticle) => void;
  articles?: JournalArticle[];
}

export const JournalSection: React.FC<JournalSectionProps> = ({ onReadArticle, articles }) => {
  const articlesList = articles && articles.length > 0 ? articles : JOURNAL_ARTICLES;
  const scrollRef = useRef<HTMLDivElement>(null);

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

  return (
    <section
      id="journal"
      className="w-full pt-14 pb-16 border-b transition-colors select-none"
      style={{
        backgroundColor: 'var(--theme-surface)',
        borderColor: 'var(--theme-border-subtle)',
      }}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Narrow Editorial Column */}
          <div className="lg:col-span-3 space-y-4">
            <p
              className="text-[10px] tracking-[0.22em] font-sans uppercase font-bold"
              style={{ color: 'var(--theme-secondary)' }}
            >
              OUR DIARY
            </p>

            <h2
              className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal tracking-tight leading-[1.15]"
              style={{ color: 'var(--theme-primary)' }}
            >
              Read These For Informations/ Insights
            </h2>

            <div className="pt-2">
              <button
                onClick={() => {
                  if (scrollRef.current) {
                    scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                  }
                }}
                className="inline-flex items-center gap-2 border rounded-full px-4 py-1.5 text-xs font-sans tracking-wide transition-all cursor-pointer hover:opacity-85"
                style={{
                  backgroundColor: 'var(--theme-surface-card)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-primary)',
                }}
              >
                <span>View all</span>
                <span className="text-xs">↗</span>
              </button>
            </div>
          </div>

          {/* Right: Articles Collection */}
          <div className="lg:col-span-9 flex flex-col justify-between">
            <div
              ref={scrollRef}
              className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-4 -mx-4 px-4 sm:mx-0 sm:px-0"
            >
              {articlesList.map((article) => (
                <div
                  key={article.id}
                  className="flex-shrink-0 w-[260px] sm:w-[290px] border rounded-xs overflow-hidden flex flex-col justify-between group shadow-sm transition-all"
                  style={{
                    backgroundColor: 'var(--theme-surface-card)',
                    borderColor: 'var(--theme-border-subtle)',
                  }}
                >
                  <div>
                    {/* Cover Image */}
                    <div className="relative aspect-[4/3] w-full bg-zinc-100 overflow-hidden">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-5 space-y-2">
                      <p
                        className="text-[9px] tracking-[0.16em] uppercase font-sans font-bold"
                        style={{ color: 'var(--theme-secondary)' }}
                      >
                        {article.date} · {article.publisher}
                      </p>

                      <h3
                        className="font-serif text-sm sm:text-base font-normal transition-colors leading-snug line-clamp-2"
                        style={{ color: 'var(--theme-primary)' }}
                      >
                        {article.title}
                      </h3>

                      <p
                        className="text-xs font-sans font-light leading-relaxed line-clamp-3 opacity-80"
                        style={{ color: 'var(--theme-text-secondary)' }}
                      >
                        {article.description}
                      </p>
                    </div>
                  </div>

                  {/* Read button styled with theme */}
                  <div className="p-4 sm:p-5 pt-0">
                    <button
                      onClick={() => onReadArticle && onReadArticle(article)}
                      className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-sans tracking-wider transition-colors cursor-pointer hover:opacity-90"
                      style={{
                        backgroundColor: 'var(--theme-btn-bg)',
                        color: 'var(--theme-btn-text)',
                      }}
                    >
                      <span>Read</span>
                      <span className="text-[11px]">↗</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Carousel navigation controls at bottom right */}
            <div className="flex justify-end items-center gap-1.5 mt-2">
              <button
                onClick={scrollLeft}
                aria-label="Previous articles"
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center transition-colors cursor-pointer rounded-xs"
                style={{
                  backgroundColor: 'var(--theme-btn-bg)',
                  color: 'var(--theme-btn-text)',
                }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={scrollRight}
                aria-label="Next articles"
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center transition-colors cursor-pointer rounded-xs"
                style={{
                  backgroundColor: 'var(--theme-btn-bg)',
                  color: 'var(--theme-btn-text)',
                }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

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
    <section id="journal" className="w-full bg-white pt-14 pb-16 border-b border-zinc-100">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Narrow Editorial Column */}
          <div className="lg:col-span-3 space-y-4">
            <p className="text-[10px] tracking-[0.22em] font-sans text-zinc-400 uppercase font-medium">
              OUR DIARY
            </p>

            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-zinc-950 tracking-tight leading-[1.15]">
              Read These For Informations/ Insights
            </h2>

            <div className="pt-2">
              <button
                onClick={() => {
                  if (scrollRef.current) {
                    scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                  }
                }}
                className="inline-flex items-center gap-2 border border-zinc-300 hover:border-zinc-900 text-zinc-800 hover:text-black rounded-full px-4 py-1.5 text-xs font-sans tracking-wide transition-all cursor-pointer"
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
                  className="flex-shrink-0 w-[260px] sm:w-[290px] border border-zinc-150 bg-white rounded-xs overflow-hidden flex flex-col justify-between group"
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
                      <p className="text-[9px] tracking-[0.16em] uppercase font-sans text-zinc-400">
                        {article.date} · {article.publisher}
                      </p>

                      <h3 className="font-serif text-sm sm:text-base font-normal text-zinc-900 group-hover:text-red-700 transition-colors leading-snug line-clamp-2">
                        {article.title}
                      </h3>

                      <p className="text-xs text-zinc-500 font-sans font-light leading-relaxed line-clamp-3">
                        {article.description}
                      </p>
                    </div>
                  </div>

                  {/* Read button in black pill matching screenshot */}
                  <div className="p-4 sm:p-5 pt-0">
                    <button
                      onClick={() => onReadArticle && onReadArticle(article)}
                      className="inline-flex items-center gap-1.5 bg-black hover:bg-zinc-800 text-white rounded-full px-4 py-1.5 text-xs font-sans tracking-wider transition-colors cursor-pointer"
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
                className="w-7 h-7 sm:w-8 sm:h-8 bg-zinc-950 text-white hover:bg-zinc-800 flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={scrollRight}
                aria-label="Next articles"
                className="w-7 h-7 sm:w-8 sm:h-8 bg-zinc-950 text-white hover:bg-zinc-800 flex items-center justify-center transition-colors"
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

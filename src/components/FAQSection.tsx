import React, { useState } from 'react';
import { ChevronDown, ArrowUpRight } from 'lucide-react';
import { FAQ_ITEMS } from '../data/fragranceData';

interface FAQSectionProps {
  faqs?: Array<{ id: string; question: string; answer: string }>;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ faqs }) => {
  const faqList = faqs && faqs.length > 0 ? faqs : FAQ_ITEMS;
  // First accordion is open by default
  const [openId, setOpenId] = useState<string>(faqList[0]?.id || 'faq-1');

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? '' : id);
  };

  return (
    <section
      id="faq"
      className="w-full py-14 sm:py-20 border-b select-none"
      style={{
        backgroundColor: 'var(--theme-surface)',
        color: 'var(--theme-primary)',
        borderColor: 'var(--theme-border-subtle)',
      }}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Editorial Section Header */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center gap-3">
            <span
              className="text-[11px] sm:text-xs tracking-[0.25em] uppercase font-bold"
              style={{ color: 'var(--theme-primary)' }}
            >
              QUESTIONS & ANSWERS
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-2 mb-3">
            <h2
              className="font-sans font-black text-2xl sm:text-3xl md:text-5xl uppercase tracking-tight leading-none"
              style={{ color: 'var(--theme-primary)' }}
            >
              Frequently Asked Questions
            </h2>
            <span
              className="text-[11px] sm:text-xs font-mono font-bold tracking-widest uppercase opacity-80"
              style={{ color: 'var(--theme-primary)' }}
            >
              CONCIERGE & SUPPORT
            </span>
          </div>

          {/* Thick Solid Horizontal Divider matching Hero */}
          <div
            className="w-full h-[3.5px] sm:h-[4.5px] md:h-[5px] mt-3 sm:mt-4 mb-8"
            style={{ backgroundColor: 'var(--theme-primary)' }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          {/* Left Column: Accordion Questions */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div
              className="divide-y-2 border-t-2 border-b-2"
              style={{ borderColor: 'var(--theme-border)' }}
            >
              {faqList.map((item) => {
                const isOpen = openId === item.id;
                return (
                  <div
                    key={item.id}
                    className="py-4 sm:py-5 transition-colors"
                    style={{ borderColor: 'var(--theme-border)' }}
                  >
                    <button
                      onClick={() => toggleAccordion(item.id)}
                      className="w-full flex items-center justify-between text-left group cursor-pointer focus:outline-none"
                      aria-expanded={isOpen}
                    >
                      <div className="flex items-center gap-3 pr-2">
                        <span
                          className="font-sans text-xs sm:text-sm font-bold group-hover:opacity-75 uppercase tracking-wide transition-opacity"
                          style={{ color: 'var(--theme-primary)' }}
                        >
                          {item.question}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 shrink-0 ml-3 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                        style={{ color: 'var(--theme-primary)' }}
                      />
                    </button>

                    {isOpen && (
                      <div
                        className="mt-3 pl-7 pr-4 text-xs sm:text-[13px] font-sans leading-relaxed font-semibold animate-fade-in p-3.5 border-l-2"
                        style={{
                          backgroundColor: 'var(--theme-surface-card)',
                          color: 'var(--theme-text-primary)',
                          borderColor: 'var(--theme-border)',
                        }}
                      >
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Information, Editorial Card & CTA */}
          <div className="lg:col-span-5 order-1 lg:order-2 space-y-6">
            <div
              className="border-2 p-6 sm:p-8 space-y-4"
              style={{
                backgroundColor: 'var(--theme-surface-card)',
                borderColor: 'var(--theme-border)',
              }}
            >
              <span
                className="text-[10px] tracking-[0.25em] font-mono uppercase font-bold block"
                style={{ color: 'var(--theme-secondary)' }}
              >
                PURE PORTIONS CARE
              </span>
              <h3
                className="font-sans font-black text-xl sm:text-2xl uppercase tracking-tight leading-snug"
                style={{ color: 'var(--theme-primary)' }}
              >
                Need Personalized Scent Advice or Order Support?
              </h3>
              <p
                className="text-xs sm:text-sm font-sans font-semibold leading-relaxed"
                style={{ color: 'var(--theme-text-primary)' }}
              >
                Our decant studio is here to assist with notes advice, authenticity confirmation, and bulk allocations for weddings and corporate orders.
              </p>

              <div className="pt-2">
                <button
                  onClick={() => {
                    const firstItem = document.getElementById('faq');
                    firstItem?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 border-2 text-xs font-bold tracking-widest uppercase px-6 py-3 transition-all duration-200 cursor-pointer shadow-xs"
                  style={{
                    backgroundColor: 'var(--theme-btn-bg)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-btn-text)',
                  }}
                >
                  <span>EXPLORE ALL FAQS</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              className="border-2 p-4 flex items-center justify-between"
              style={{
                backgroundColor: 'var(--theme-surface-card)',
                borderColor: 'var(--theme-border)',
              }}
            >
              <div>
                <p
                  className="text-[10px] font-mono tracking-widest uppercase font-bold"
                  style={{ color: 'var(--theme-secondary)' }}
                >
                  DIRECT CONCIERGE
                </p>
                <p className="text-xs font-bold" style={{ color: 'var(--theme-primary)' }}>
                  WhatsApp Hotline: +880 1972-911234
                </p>
              </div>
              <span className="text-xs font-mono font-bold" style={{ color: 'var(--theme-primary)' }}>10AM - 11PM</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQ_ITEMS } from '../data/fragranceData';

interface FAQSectionProps {
  faqs?: Array<{ id: string; question: string; answer: string }>;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ faqs }) => {
  const faqList = faqs && faqs.length > 0 ? faqs : FAQ_ITEMS;
  // First accordion is open by default as in the screenshot
  const [openId, setOpenId] = useState<string>(faqList[0]?.id || 'faq-1');

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? '' : id);
  };

  return (
    <section id="faq" className="w-full bg-[#0a0a0a] text-white py-16 sm:py-24 border-b border-zinc-900">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Left Column: Accordion Questions */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div className="divide-y divide-zinc-800 border-t border-b border-zinc-800">
              {faqList.map((item) => {
                const isOpen = openId === item.id;
                return (
                  <div key={item.id} className="py-4 sm:py-5 transition-colors">
                    <button
                      onClick={() => toggleAccordion(item.id)}
                      className="w-full flex items-center justify-between text-left group cursor-pointer focus:outline-none"
                      aria-expanded={isOpen}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-zinc-500 text-xs">•</span>
                        <span className="font-sans text-xs sm:text-sm font-light text-zinc-100 group-hover:text-amber-400 transition-colors">
                          {item.question}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-zinc-400 transition-transform duration-300 shrink-0 ml-3 ${
                          isOpen ? 'rotate-180 text-amber-500' : ''
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="mt-3 pl-5 pr-2 text-xs sm:text-[13px] text-zinc-400 font-sans leading-relaxed font-light animate-fade-in">
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Heading, Description, CTA */}
          <div className="lg:col-span-5 order-1 lg:order-2 space-y-4 lg:pl-6">
            <p className="text-[10px] sm:text-[11px] tracking-[0.22em] font-sans text-zinc-400 uppercase font-medium">
              FAQ
            </p>
            
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-[#f08c4a] tracking-tight leading-[1.12]">
              Frequently Asked Questions
            </h2>

            <p className="text-xs sm:text-sm text-zinc-400 font-sans font-light leading-relaxed max-w-md">
              Find quick answers to common questions about orders, shipping, returns, and more.
            </p>

            <div className="pt-2">
              <button
                onClick={() => {
                  const firstItem = document.getElementById('faq');
                  firstItem?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 border border-zinc-700 hover:border-zinc-400 text-zinc-200 hover:text-white text-[11px] sm:text-xs tracking-[0.16em] uppercase px-5 py-2.5 transition-all duration-200 cursor-pointer"
              >
                <span>View All FAQ</span>
                <span className="text-xs">↗</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

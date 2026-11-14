import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
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
    <section id="faq" className="pp-faq">
      <div className="pp-faq__wrap">
        <p className="pp-faq__eyebrow">FAQ</p>
        <h2 className="pp-faq__title">Good to <em>know</em></h2>

        <div className="pp-faq__list">
          {faqList.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div key={item.id} className={`pp-faq__item ${isOpen ? 'is-open' : ''}`}>
                <button onClick={() => toggleAccordion(item.id)} className="pp-faq__q" aria-expanded={isOpen}>
                  <span>{item.question}</span>
                  <i className="pp-faq__icon" aria-hidden="true" />
                </button>
                <div className="pp-faq__a"><div><p>{item.answer}</p></div></div>
              </div>
            );
          })}
        </div>

        <a className="pp-faq__help" href="https://wa.me/8801972911234" target="_blank" rel="noreferrer">
          <span>Still have a question?</span>
          <b>Message us on WhatsApp <ArrowUpRight className="w-3.5 h-3.5" /></b>
        </a>
      </div>
    </section>
  );
};

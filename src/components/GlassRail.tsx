import React, { useState } from 'react';
import { Plus, Check, X } from 'lucide-react';
import { FragranceProduct } from '../types';
import { categoryOf } from '../lib/brandCategory';

const GENDER_LABEL: Record<string, string> = { Him: 'For him', Her: 'For her', Unisex: 'Unisex' };

interface Props {
  products: FragranceProduct[];
  badge?: (p: FragranceProduct, i: number) => string;
  highlightFirst?: boolean;
  onSelectProduct: (p: FragranceProduct) => void;
  onAddToCart: (p: FragranceProduct, size: string, price: number) => void;
}

/** Liquid-glass product cards: bottle-coloured aura, size picker, add to bag. */
const GlassRail: React.FC<Props> = ({ products, badge, highlightFirst = true, onSelectProduct, onAddToCart }) => {
  const [added, setAdded] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [sizeSel, setSizeSel] = useState<Record<string, number>>({});
  return (
      <div className="pp-sotw__rail no-scrollbar">
        {products.map((p, i) => {
          const sizes = p.sizes || [];
          const firstOpen = Math.max(0, sizes.findIndex((s) => !s.soldOut));
          const id = String(p.id);
          const sel = sizeSel[id] ?? firstOpen;
          const chosen = sizes[sel];
          const isOpen = openId === id;
          const g = GENDER_LABEL[p.gender || 'Unisex'] || 'Unisex';
          return (
            <article
              key={p.id}
              className={`pp-sotw__card ${i === 0 && highlightFirst ? 'is-first' : ''} ${isOpen ? 'is-open' : ''}`}
              style={{ '--img': `url("${p.image}")`, animationDelay: `${i * 0.08}s` } as React.CSSProperties}
              onClick={() => (isOpen ? setOpenId(null) : onSelectProduct(p))}
            >
              <span className="pp-sotw__aura" aria-hidden="true" />
              {badge && <span className="pp-sotw__rank">{badge(p, i)}</span>}
              <img className="pp-sotw__img" src={p.image} alt={p.name} loading="lazy" referrerPolicy="no-referrer" />
              <div className="pp-sotw__glass" onClick={(e) => isOpen && e.stopPropagation()}>
                <p className="pp-sotw__brand">{p.brand} · {categoryOf(p.brand, (p as any).category)}</p>
                <p className="pp-sotw__name">{p.name}</p>
                <div className="pp-sotw__row">
                  <span className={`pp-sotw__g pp-sotw__g--${(p.gender || 'Unisex').toLowerCase()}`}>{g}</span>
                  <span className="pp-sotw__price">{isOpen && chosen ? `৳${chosen.price}` : `From ৳${p.startingPrice || sizes[firstOpen]?.price || ''}`}</span>
                  {sizes.length > 0 && (
                    <button
                      type="button"
                      className={`pp-sotw__add ${isOpen ? 'is-close' : ''}`}
                      aria-label={isOpen ? 'Close sizes' : `Choose a size for ${p.name}`}
                      onClick={(e) => { e.stopPropagation(); setOpenId(isOpen ? null : id); }}
                    >
                      {isOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </button>
                  )}
                </div>
                <div className="pp-sotw__sizes" aria-hidden={!isOpen}>
                  <div className="pp-sotw__chips no-scrollbar">
                    {sizes.map((s, si) => (
                      <button
                        key={s.size}
                        type="button"
                        disabled={s.soldOut}
                        tabIndex={isOpen ? 0 : -1}
                        className={`pp-sotw__chip ${si === sel ? 'is-on' : ''}`}
                        onClick={(e) => { e.stopPropagation(); setSizeSel({ ...sizeSel, [id]: si }); }}
                      >
                        <b>{s.size.toUpperCase()}</b>
                        <span>{s.soldOut ? 'Sold out' : `৳${s.price}`}</span>
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    tabIndex={isOpen ? 0 : -1}
                    className="pp-sotw__buy"
                    disabled={!chosen || chosen.soldOut}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!chosen) return;
                      onAddToCart(p, chosen.size, chosen.price);
                      setAdded(id);
                      setTimeout(() => { setAdded(null); setOpenId(null); }, 1100);
                    }}
                  >
                    {added === id ? <><Check className="w-4 h-4" /> Added</> : <>Add to bag · ৳{chosen?.price}</>}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
  );
};

export default GlassRail;

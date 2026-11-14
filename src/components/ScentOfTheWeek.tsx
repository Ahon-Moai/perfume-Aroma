import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { FragranceProduct } from '../types';
import { categoryOf } from '../lib/brandCategory';

interface Props {
  products: FragranceProduct[];
  onSelectProduct: (p: FragranceProduct) => void;
  onAddToCart: (p: FragranceProduct, size: string, price: number) => void;
}

interface Pick { product_id: string; gender: string; ml_sold: number }

const GENDER_LABEL: Record<string, string> = { Him: 'For him', Her: 'For her', Unisex: 'Unisex' };

const ScentOfTheWeek: React.FC<Props> = ({ products, onSelectProduct, onAddToCart }) => {
  const [data, setData] = useState<{ week: number; items: Pick[] } | null>(null);
  const [added, setAdded] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/scent_week.php')
      .then((r) => r.json())
      .then((j) => setData(j.data || null))
      .catch(() => setData(null));
  }, []);

  const picks = useMemo(() => {
    const byId = new Map(products.map((p) => [String(p.id), p]));
    const out: FragranceProduct[] = [];
    (data?.items || []).forEach((it) => {
      const p = byId.get(String(it.product_id));
      if (p && !out.includes(p)) out.push(p);
    });
    // Quiet weeks: top up so him / her / unisex stay balanced (2 each)
    const gOf = (x: FragranceProduct) => x.gender || 'Unisex';
    for (const g of ['Her', 'Unisex', 'Him', 'Her', 'Unisex', 'Him']) {
      if (out.length >= 6) break;
      if (out.filter((x) => gOf(x) === g).length >= 2) continue;
      const p = products.find((x) => gOf(x) === g && !out.includes(x) && x.image);
      if (p) out.push(p);
    }
    for (const p of products) { if (out.length >= 6) break; if (!out.includes(p) && p.image) out.push(p); }
    return out.slice(0, 6);
  }, [data, products]);

  if (picks.length === 0) return null;

  const week = data?.week ?? 0;

  return (
    <section className="pp-sotw" aria-label="Scent of the week">
      <div className="pp-sotw__head">
        <p className="pp-sotw__eyebrow">Week {week} · Scent of the week</p>
        <h2 className="pp-sotw__title">This week's favourites</h2>
        <p className="pp-sotw__sub">Our most ordered decants right now, for him, for her and for everyone.</p>
      </div>

      <div className="pp-sotw__rail no-scrollbar">
        {picks.map((p, i) => {
          const size = p.sizes?.find((s) => !s.soldOut) || p.sizes?.[0];
          const g = GENDER_LABEL[p.gender || 'Unisex'] || 'Unisex';
          return (
            <article
              key={p.id}
              className={`pp-sotw__card ${i === 0 ? 'is-first' : ''}`}
              style={{ '--img': `url("${p.image}")`, animationDelay: `${i * 0.08}s` } as React.CSSProperties}
              onClick={() => onSelectProduct(p)}
            >
              <span className="pp-sotw__aura" aria-hidden="true" />
              <span className="pp-sotw__rank">No. {i + 1}</span>
              <img className="pp-sotw__img" src={p.image} alt={p.name} loading="lazy" referrerPolicy="no-referrer" />
              <div className="pp-sotw__glass">
                <p className="pp-sotw__brand">{p.brand} · {categoryOf(p.brand, (p as any).category)}</p>
                <p className="pp-sotw__name">{p.name}</p>
                <div className="pp-sotw__row">
                  <span className={`pp-sotw__g pp-sotw__g--${(p.gender || 'Unisex').toLowerCase()}`}>{g}</span>
                  <span className="pp-sotw__price">From ৳{size?.price ?? p.startingPrice}</span>
                  {size && (
                    <button
                      type="button"
                      className="pp-sotw__add"
                      aria-label={`Add ${p.name} ${size.size} to bag`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(p, size.size, size.price);
                        setAdded(String(p.id));
                        setTimeout(() => setAdded(null), 1400);
                      }}
                    >
                      {added === String(p.id) ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default ScentOfTheWeek;

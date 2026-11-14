import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Check, X } from 'lucide-react';
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
  const [openId, setOpenId] = useState<string | null>(null);
  const [sizeSel, setSizeSel] = useState<Record<string, number>>({});

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
        <div className="pp-sotw__meta">
          <span className="pp-sotw__live"><i aria-hidden="true" />Scent of the week</span>
          <span className="pp-sotw__line" aria-hidden="true" />
          <span className="pp-sotw__wk">Nº {week}</span>
        </div>
        <h2 className="pp-sotw__title">
          <span className="pp-sotw__w1">This week's</span>
          <em className="pp-sotw__w2">favourites</em>
        </h2>
      </div>

      <div className="pp-sotw__rail no-scrollbar">
        {picks.map((p, i) => {
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
              className={`pp-sotw__card ${i === 0 ? 'is-first' : ''} ${isOpen ? 'is-open' : ''}`}
              style={{ '--img': `url("${p.image}")`, animationDelay: `${i * 0.08}s` } as React.CSSProperties}
              onClick={() => (isOpen ? setOpenId(null) : onSelectProduct(p))}
            >
              <span className="pp-sotw__aura" aria-hidden="true" />
              <span className="pp-sotw__rank">No. {i + 1}</span>
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
    </section>
  );
};

export default ScentOfTheWeek;

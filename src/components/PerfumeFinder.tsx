import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { FragranceProduct } from '../types';
import { categoryOf } from '../lib/brandCategory';

/**
 * "Help me choose" — 5 quick taps, 6 picks (3 Middle Eastern, 2 Designer, 1 Niche).
 * Same quiz as the Perfume Price List page, running on the website's catalogue.
 */

interface PerfumeFinderProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToProduct: (product: FragranceProduct | string) => void;
  onAddToCart: (product: FragranceProduct, size: string, price: number, qty?: number) => void;
  products?: FragranceProduct[];
}

type Opt = [string, string, string?];
const QZ: { k: string; t: string; o: Opt[] }[] = [
  { k: 'who', t: 'Who is it for?', o: [['her', 'For me — I like feminine scents'], ['him', 'For me — I like masculine scents'], ['gher', 'A gift for her'], ['ghim', 'A gift for him'], ['any', 'Doesn’t matter']] },
  { k: 'smell', t: 'Which smell do you like most?', o: [['fresh', 'Fresh & clean', 'citrus, sea, after-shower'], ['sweet', 'Sweet & cozy', 'vanilla, caramel, candy'], ['floral', 'Soft & floral', 'rose, jasmine, powdery'], ['warm', 'Warm & strong', 'spicy, amber, oud'], ['woody', 'Woody & classy', 'woods, leather, vetiver']] },
  { k: 'when', t: 'When will you wear it most?', o: [['day', 'Daily — class, office, outside'], ['night', 'Evenings — dates, parties, dawat'], ['both', 'Both']] },
  { k: 'sea', t: 'Which weather?', o: [['hot', 'Hot days (summer)'], ['cool', 'Cool days (winter)'], ['all', 'All year']] },
  { k: 'bud', t: 'Your budget for a 3–5 ml decant?', o: [['b1', 'Up to ৳300'], ['b2', '৳300 – ৳600'], ['b3', 'Above ৳600 is fine']] },
];

// Words found in the site's scent families, per answer
const FAMQ: Record<string, string[]> = {
  fresh: ['fresh', 'citrus', 'aquatic', 'marine', 'aromatic', 'herbal', 'green', 'lavender'],
  sweet: ['gourmand', 'sweet', 'vanilla', 'caramel', 'fruity', 'coffee', 'cacao', 'honey'],
  floral: ['floral', 'rose', 'jasmine', 'powder', 'musk'],
  warm: ['amber', 'oriental', 'spicy', 'oud', 'tobacco', 'leather', 'smoky'],
  woody: ['woody', 'wood', 'earthy', 'leather', 'oud', 'vetiver', 'cedar'],
};
const HEAVY = ['amber', 'oriental', 'spicy', 'oud', 'tobacco', 'leather', 'gourmand', 'vanilla'];
const LIGHT = ['fresh', 'citrus', 'aquatic', 'marine', 'aromatic', 'musk'];

const famsOf = (p: FragranceProduct) =>
  ((p.scentProfile || p.scent_profile)?.fragranceFamilies || []).map((f) => String(f).toLowerCase());
const seasonsOf = (p: FragranceProduct) =>
  ((p.scentProfile || p.scent_profile)?.seasons || []).map((s) => String(s).toLowerCase());
const has = (f: string, words: string[]) => words.some((w) => f.includes(w));
const ml = (s: string) => parseFloat(String(s).replace(/[^\d.]/g, ''));

function minPrice(p: FragranceProduct): number | null {
  const open = (p.sizes || []).filter((s: any) => !s.soldOut && s.price > 0);
  const small = open.filter((s) => [3, 5].includes(ml(s.size))).map((s) => s.price);
  if (small.length) return Math.min(...small);
  const all = open.map((s) => s.price);
  return all.length ? Math.min(...all) : null;
}

function pick(products: FragranceProduct[], A: Record<string, string>): FragranceProduct[] {
  const g = A.who === 'her' || A.who === 'gher' ? 'Her' : A.who === 'him' || A.who === 'ghim' ? 'Him' : null;
  const words = FAMQ[A.smell] || [];
  const scored: [FragranceProduct, number][] = [];
  for (const p of products) {
    const fams = famsOf(p);
    const mp = minPrice(p);
    if (!fams.length || mp == null) continue;
    const pg = p.gender || 'Unisex';
    if (g && pg !== g && pg !== 'Unisex') continue;
    if (A.bud === 'b1' && mp > 300) continue;
    if (A.bud === 'b2' && mp > 600) continue;
    let sc = 0;
    fams.forEach((f, i) => { if (has(f, words)) sc += (1 / (i + 1)) * (i === 0 ? 1.6 : 1); });
    if (sc <= 0) continue;
    const w = seasonsOf(p);
    const all = w.some((s) => s.includes('all'));
    if (A.sea === 'hot') sc += all || w.includes('summer') || w.includes('spring') ? 0.5 : -0.4;
    if (A.sea === 'cool') sc += all || w.includes('winter') || w.includes('autumn') || w.includes('fall') ? 0.5 : -0.4;
    const top = fams.slice(0, 2);
    if (A.when === 'day') sc += top.some((f) => has(f, LIGHT)) ? 0.3 : top.some((f) => has(f, HEAVY)) ? -0.25 : 0;
    if (A.when === 'night') sc += top.some((f) => has(f, HEAVY)) ? 0.3 : 0;
    if (g && pg === g) sc += 0.15;
    if (A.bud === 'b3' && categoryOf(p.brand) === 'Designer') sc += 0.2;
    scored.push([p, sc]);
  }
  scored.sort((a, b) => b[1] - a[1]);
  const ord = g ? scored.filter((o) => o[0].gender === g).concat(scored.filter((o) => o[0].gender !== g)) : scored;
  const brands: Record<string, number> = {};
  const G: Record<string, FragranceProduct[]> = { Arabian: [], Designer: [], Niche: [] };
  const CAP: Record<string, number> = { Arabian: 3, Designer: 2, Niche: 1 };
  const rest: FragranceProduct[] = [];
  for (const [p] of ord) {
    const b = p.brand || '';
    if ((brands[b] || 0) >= 2) continue;
    const t = categoryOf(p.brand);
    if (G[t].length < CAP[t]) { G[t].push(p); brands[b] = (brands[b] || 0) + 1; }
    else if (rest.length < 6) rest.push(p);
    if (G.Arabian.length === 3 && G.Designer.length === 2 && G.Niche.length === 1) break;
  }
  const out = G.Arabian.concat(G.Designer, G.Niche);
  for (const p of rest) { if (out.length >= 6) break; if (!out.includes(p)) out.push(p); }
  const RK: Record<string, number> = { Arabian: 0, Designer: 1, Niche: 2 };
  return out.sort((x, y) => RK[categoryOf(x.brand)] - RK[categoryOf(y.brand)]);
}

const LABEL: Record<string, string> = { Arabian: 'Middle Eastern', Designer: 'Designer', Niche: 'Niche' };

export const PerfumeFinder: React.FC<PerfumeFinderProps> = ({ isOpen, onClose, onNavigateToProduct, products = [] }) => {
  const [step, setStep] = useState(0);
  const [A, setA] = useState<Record<string, string>>({});

  useEffect(() => { if (isOpen) { setStep(0); setA({}); } }, [isOpen]);
  useEffect(() => {
    if (!isOpen) return;
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [isOpen, onClose]);

  const results = useMemo(() => (step >= QZ.length ? pick(products, A) : []), [step, A, products]);
  if (!isOpen) return null;

  const answer = (k: string, v: string) => { setA((a) => ({ ...a, [k]: v })); setStep((s) => s + 1); };
  const serif = { fontFamily: "'Cormorant Garamond', Georgia, serif" };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/45 backdrop-blur-sm" onClick={onClose}>
      <div
        className="pp-quiz relative w-full sm:max-w-md max-h-[92vh] overflow-y-auto bg-white text-neutral-950 rounded-t-[28px] sm:rounded-[28px] px-5 pt-3 pb-7"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Help me choose"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-neutral-200 sm:hidden" />
        <div className="flex items-center justify-between">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            aria-label="Back"
            className={`w-9 h-9 -ml-2 flex items-center justify-center rounded-full text-neutral-600 ${step === 0 || step >= QZ.length ? 'invisible' : ''}`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-[10px] font-semibold tracking-[0.3em] text-neutral-500 uppercase">Help me choose</span>
          <button onClick={onClose} aria-label="Close" className="w-9 h-9 -mr-2 flex items-center justify-center rounded-full text-neutral-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step < QZ.length ? (
          <div key={step} className="pp-quiz__in">
            <div className="flex gap-1.5 mt-4">
              {QZ.map((_, i) => (
                <i key={i} className={`h-[3px] flex-1 rounded-full ${i <= step ? 'bg-neutral-900' : 'bg-neutral-200'}`} />
              ))}
            </div>
            <p className="mt-5 text-xs font-medium text-neutral-500">{step + 1} of {QZ.length}</p>
            <h3 style={serif} className="mt-1 text-[30px] leading-[1.1] font-semibold">{QZ[step].t}</h3>
            <div className="mt-5 flex flex-col gap-2">
              {QZ[step].o.map(([v, label, hint]) => (
                <button
                  key={v}
                  onClick={() => answer(QZ[step].k, v)}
                  className={`flex items-center justify-between gap-3 text-left rounded-2xl px-4 py-3.5 bg-neutral-50 hover:bg-neutral-100 active:scale-[.99] transition ${A[QZ[step].k] === v ? 'ring-1 ring-neutral-900' : ''}`}
                >
                  <span>
                    <span className="block text-[15px] font-semibold">{label}</span>
                    {hint && <span className="block text-xs text-neutral-500 mt-0.5">{hint}</span>}
                  </span>
                  <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="pp-quiz__in">
            <p className="mt-5 text-xs font-medium text-neutral-500">Your picks</p>
            <h3 style={serif} className="mt-1 text-[30px] leading-[1.1] font-semibold">
              {results.length ? 'Made for you.' : 'Nothing matched all your answers.'}
            </h3>
            {results.length ? (
              <div className="mt-4 flex flex-col gap-2">
                {results.map((p, k) => {
                  const grp = categoryOf(p.brand);
                  const head = k === 0 || categoryOf(results[k - 1].brand) !== grp;
                  const fams = ((p.scentProfile || p.scent_profile)?.fragranceFamilies || []).slice(0, 2).join(' · ');
                  return (
                    <React.Fragment key={p.id}>
                      {head && <p className="mt-2 text-[10px] font-semibold tracking-[0.24em] uppercase text-neutral-500">{LABEL[grp]}</p>}
                      <button
                        onClick={() => { onClose(); onNavigateToProduct(p); }}
                        className="flex items-center gap-3 text-left rounded-2xl p-2.5 pr-3 bg-neutral-50 hover:bg-neutral-100 transition"
                      >
                        {p.image ? (
                          <img src={p.image} alt="" loading="lazy" className="w-14 h-14 rounded-xl object-cover bg-white shrink-0" />
                        ) : (
                          <span className="w-14 h-14 rounded-xl bg-neutral-200 shrink-0" />
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block text-[10px] font-semibold tracking-[0.16em] uppercase text-neutral-500 truncate">{p.brand}</span>
                          <span style={serif} className="block text-[19px] font-semibold leading-tight truncate">{p.name}</span>
                          <span className="block text-xs text-neutral-500 truncate">{fams}</span>
                        </span>
                        <span className="text-right shrink-0">
                          <span className="block text-[13px] font-semibold">from ৳{minPrice(p)}</span>
                          <span className="block text-[11px] text-neutral-500 mt-0.5">View ›</span>
                        </span>
                      </button>
                    </React.Fragment>
                  );
                })}
              </div>
            ) : (
              <p className="mt-3 text-sm text-neutral-600">Try a different smell or a bigger budget.</p>
            )}
            <p className="mt-5 text-xs text-neutral-500 leading-relaxed">
              Still unsure? Message us on Facebook, Instagram or WhatsApp — we’ll help you choose.
            </p>
            <button onClick={() => { setStep(0); setA({}); }} className="mt-4 w-full rounded-full border border-neutral-300 py-3 text-sm font-semibold">
              Start again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useMemo } from 'react';
import { FragranceProduct } from '../types';
import { categoryOf } from '../lib/brandCategory';
import GlassRail from './GlassRail';

interface Props {
  products: FragranceProduct[];
  onSelectProduct: (p: FragranceProduct) => void;
  onAddToCart: (p: FragranceProduct, size: string, price: number) => void;
}

/** Exclusive perfumes: every niche house, on a dark editorial band. */
const ExclusiveNiche: React.FC<Props> = ({ products, onSelectProduct, onAddToCart }) => {
  const niche = useMemo(
    () => products.filter((p) => p.image && categoryOf(p.brand, (p as any).category) === 'Niche'),
    [products],
  );
  if (niche.length === 0) return null;
  const houses = new Set(niche.map((p) => p.brand.toUpperCase())).size;

  return (
    <section className="pp-niche" aria-label="Exclusive perfumes">
      <div className="pp-sotw__head">
        <div className="pp-sotw__meta">
          <span className="pp-niche__tag"><i aria-hidden="true" />The niche edit</span>
          <span className="pp-niche__line" aria-hidden="true" />
          <span className="pp-niche__count">{niche.length} scents · {houses} houses</span>
        </div>
        <h2 className="pp-sotw__title">
          <span className="pp-niche__w1">Exclusive</span>
          <em className="pp-niche__w2">perfumes</em>
        </h2>
        <p className="pp-niche__sub">Rare houses you won’t find in malls. Try them in small sizes first.</p>
      </div>
      <GlassRail
        products={niche}
        badge={() => 'Niche'}
        highlightFirst={false}
        onSelectProduct={onSelectProduct}
        onAddToCart={onAddToCart}
      />
    </section>
  );
};

export default ExclusiveNiche;

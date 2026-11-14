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
      <div className="pp-niche__head">
        <span className="pp-niche__eyebrow">The niche edit · {niche.length} scents</span>
        <h2 className="pp-niche__title">
          <span>Exclusive</span> <em>perfumes</em>
        </h2>
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

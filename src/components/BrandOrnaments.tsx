import React from 'react';

/**
 * Decorative art taken from the Pure Portions logo: watercolor-style leaf sprigs that frame
 * the wordmark, and a fine flourish line ending in a small atomizer bottle.
 * Pure SVG (no images), silver-blue and soft taupe tones, very light so it stays premium.
 */

// Eucalyptus-style sprig like the logo: slender pointed leaves in pairs along a curved stem,
// watercolor blue-grey and soft gold, with a few gold flecks.
const bez = (t: number, p0: number[], p1: number[], p2: number[], p3: number[]) => {
  const u = 1 - t;
  const pt = [0, 1].map((k) => u * u * u * p0[k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t * t * t * p3[k]);
  const d = [0, 1].map((k) => 3 * u * u * (p1[k] - p0[k]) + 6 * u * t * (p2[k] - p1[k]) + 3 * t * t * (p3[k] - p2[k]));
  return { x: pt[0], y: pt[1], a: (Math.atan2(d[1], d[0]) * 180) / Math.PI };
};
const STEM: number[][] = [[46, 188], [30, 140], [40, 70], [60, 6]];
const TONES = ['b', 'b', 'g', 'b', 'b2', 'g', 'b', 'b2', 'g', 'b', 'b', 'g'];
const LEAVES = Array.from({ length: 12 }, (_, i) => {
  const t = 0.08 + i * 0.075;
  const p = bez(t, STEM[0], STEM[1], STEM[2], STEM[3]);
  const side = i % 2 === 0 ? 1 : -1;
  return { x: p.x, y: p.y, r: p.a + side * 48, s: 1.12 - i * 0.055, tone: TONES[i] };
});
const FLECKS: Array<[number, number, number]> = [[74, 34, 1.4], [80, 62, 0.9], [14, 92, 1.1], [70, 118, 0.8], [22, 40, 0.7], [84, 96, 0.6]];

export const LeafSprig: React.FC<{ className?: string; flip?: boolean; idSuffix: string }> = ({ className, flip, idSuffix }) => (
  <svg
    viewBox="0 0 100 190"
    className={className}
    aria-hidden="true"
    style={flip ? { transform: 'scaleX(-1)' } : undefined}
  >
    <defs>
      <linearGradient id={`ppLeafB-${idSuffix}`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#5f7889" />
        <stop offset="60%" stopColor="#8fa6b6" />
        <stop offset="100%" stopColor="#c8d6e0" />
      </linearGradient>
      <linearGradient id={`ppLeafB2-${idSuffix}`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#7d8f9c" />
        <stop offset="100%" stopColor="#d6dee5" />
      </linearGradient>
      <linearGradient id={`ppLeafG-${idSuffix}`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#b8995f" />
        <stop offset="55%" stopColor="#d9c39b" />
        <stop offset="100%" stopColor="#f1e6cf" />
      </linearGradient>
    </defs>
    <g className="pp-sprig-sway">
      <path className="pp-stem" d={`M${STEM[0]} C ${STEM[1]}, ${STEM[2]}, ${STEM[3]}`} fill="none" stroke="#8d98a4" strokeWidth="1" strokeLinecap="round" />
      {LEAVES.map((l, i) => (
        <g key={i} transform={`translate(${l.x.toFixed(1)} ${l.y.toFixed(1)}) rotate(${l.r.toFixed(1)}) scale(${l.s.toFixed(2)})`}>
          <g className="pp-leaf" style={{ animationDelay: `${0.45 + i * 0.1}s` }}>
            <path
              d="M0 0 C 7 -6.5, 22 -8, 34 0 C 22 6, 7 5.5, 0 0 Z"
              fill={`url(#ppLeaf${l.tone === 'g' ? 'G' : l.tone === 'b2' ? 'B2' : 'B'}-${idSuffix})`}
              opacity={l.tone === 'g' ? 0.82 : 0.86}
            />
            <path d="M1.5 0 Q 16 -1.2, 31 0" fill="none" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="0.55" />
          </g>
        </g>
      ))}
      {FLECKS.map(([x, y, r], i) => (
        <circle key={`f${i}`} className="pp-fleck" style={{ animationDelay: `${1.8 + i * 0.7}s` }} cx={x} cy={y} r={r} fill="#c9a96a" />
      ))}
    </g>
  </svg>
);

export const AtomizerFlourish: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 320 44" className={className} aria-hidden="true" preserveAspectRatio="xMidYMid meet">
    <defs>
      <linearGradient id="ppFlourish" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#8e9098" stopOpacity="0" />
        <stop offset="18%" stopColor="#8e9098" />
        <stop offset="82%" stopColor="#6e7178" />
        <stop offset="100%" stopColor="#6e7178" />
      </linearGradient>
      <linearGradient id="ppGlass" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#f4f1ec" />
        <stop offset="50%" stopColor="#d9cfc1" />
        <stop offset="100%" stopColor="#f2eee8" />
      </linearGradient>
    </defs>
    {/* infinity-like swash */}
    <path
      className="pp-flourish-line"
      d="M8 30 C 70 30, 110 8, 160 22 S 230 38, 262 22 C 238 14, 210 30, 250 32"
      fill="none"
      stroke="url(#ppFlourish)"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    {/* small atomizer bottle */}
    <g transform="translate(266 6)">
      <circle cx="30" cy="9" r="5.2" fill="#cfc4b3" stroke="#a89b88" strokeWidth="0.6" />
      <path d="M25 9 C 18 9, 14 11, 12 14" fill="none" stroke="#a89b88" strokeWidth="0.8" />
      <rect x="7" y="12" width="7" height="4" rx="1" fill="#b6a993" />
      <path d="M2 17 h 17 a 3 3 0 0 1 3 3 v 9 a 6 6 0 0 1 -6 6 h -11 a 6 6 0 0 1 -6 -6 v -9 a 3 3 0 0 1 3 -3 z" fill="url(#ppGlass)" stroke="#a89b88" strokeWidth="0.7" />
      <path d="M6 21 v 10 M10 21 v 11 M14 21 v 11" stroke="#a89b88" strokeWidth="0.5" opacity="0.7" />
      <rect x="0" y="35" width="23" height="2" rx="1" fill="#b6a993" />
    </g>
  </svg>
);

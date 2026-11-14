import React from 'react';

/**
 * Decorative art taken from the Pure Portions logo: watercolor-style leaf sprigs that frame
 * the wordmark, and a fine flourish line ending in a small atomizer bottle.
 * Pure SVG (no images), silver-blue and soft taupe tones, very light so it stays premium.
 */

const LEAVES: Array<[number, number, number, number, 'b' | 't']> = [
  // x, y, rotation, scale, tone (b = blue-silver, t = taupe) — main stem
  [34, 150, -62, 1.0, 'b'],
  [44, 128, -20, 0.95, 't'],
  [30, 112, -70, 0.95, 'b'],
  [46, 92, -18, 0.9, 'b'],
  [34, 76, -72, 0.85, 't'],
  [50, 58, -24, 0.8, 'b'],
  [42, 42, -70, 0.72, 'b'],
  [56, 26, -30, 0.62, 't'],
  [60, 12, -55, 0.5, 'b'],
  // side branch
  [24, 166, -110, 0.7, 't'],
  [12, 150, -140, 0.62, 'b'],
  [20, 134, -100, 0.55, 'b'],
  [68, 104, 8, 0.6, 't'],
  [74, 86, -10, 0.5, 'b'],
];
const BERRIES: Array<[number, number, number]> = [[70, 96, 2.2], [76, 80, 1.6], [16, 128, 1.8], [8, 144, 1.3], [64, 6, 1.4]];

export const LeafSprig: React.FC<{ className?: string; flip?: boolean; idSuffix: string }> = ({ className, flip, idSuffix }) => (
  <svg
    viewBox="0 0 100 190"
    className={className}
    aria-hidden="true"
    style={flip ? { transform: 'scaleX(-1)' } : undefined}
  >
    <defs>
      <linearGradient id={`ppLeafB-${idSuffix}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#c9d3df" />
        <stop offset="55%" stopColor="#8e9bab" />
        <stop offset="100%" stopColor="#5d6b7c" />
      </linearGradient>
      <linearGradient id={`ppLeafT-${idSuffix}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ece4d8" />
        <stop offset="100%" stopColor="#b9aa96" />
      </linearGradient>
    </defs>
    <g className="pp-sprig-sway">
      {/* stems draw in, then leaves unfurl one by one */}
      <path className="pp-stem" d="M44 186 C 40 150, 38 110, 46 72 S 58 22, 62 8" fill="none" stroke="#9aa3ae" strokeWidth="1.1" strokeLinecap="round" />
      <path className="pp-stem pp-stem--b" d="M40 176 C 30 168, 18 156, 10 142" fill="none" stroke="#9aa3ae" strokeWidth="0.8" strokeLinecap="round" />
      <path className="pp-stem pp-stem--c" d="M46 120 C 58 112, 68 100, 76 80" fill="none" stroke="#9aa3ae" strokeWidth="0.8" strokeLinecap="round" />
      {LEAVES.map(([x, y, r, s, tone], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
          <g className="pp-leaf" style={{ animationDelay: `${0.5 + i * 0.09}s` }}>
            <path
              d="M0 0 C 7 -9, 22 -10, 30 0 C 22 9, 7 9, 0 0 Z"
              fill={`url(#${tone === 'b' ? 'ppLeafB' : 'ppLeafT'}-${idSuffix})`}
              opacity={tone === 'b' ? 0.82 : 0.74}
            />
            <path d="M1 0 L 27 0" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="0.6" />
          </g>
        </g>
      ))}
      {BERRIES.map(([x, y, r], i) => (
        <circle key={`b${i}`} className="pp-leaf" style={{ animationDelay: `${1.6 + i * 0.12}s` }} cx={x} cy={y} r={r}
          fill={`url(#ppLeafT-${idSuffix})`} stroke="#b9aa96" strokeWidth="0.4" />
      ))}
      {/* a few tiny silver flecks, like the gold splashes in the logo */}
      <circle cx="70" cy="40" r="1.3" fill="#a9b1bc" opacity="0.7" />
      <circle cx="76" cy="58" r="0.8" fill="#a9b1bc" opacity="0.6" />
      <circle cx="18" cy="96" r="1" fill="#a9b1bc" opacity="0.55" />
      <circle cx="64" cy="120" r="0.7" fill="#a9b1bc" opacity="0.5" />
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

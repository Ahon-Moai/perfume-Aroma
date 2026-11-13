import React, { useEffect } from 'react';
import { SocialCard } from '../types';

interface StudioSectionProps {
  socialCards?: SocialCard[];
}

// Posts from @pure_portions_by_arrina shown on the homepage (swap these links to change them)
const INSTAGRAM_POSTS = [
  'https://www.instagram.com/reel/Dfrukl3mSjf/',
  'https://www.instagram.com/p/DfrffvAgvpo/',
  'https://www.instagram.com/p/DfrSYH0jFQs/',
];

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

export const StudioSection: React.FC<StudioSectionProps> = () => {
  // Load Instagram's official embed script once, then render the posts
  useEffect(() => {
    if (window.instgrm) {
      window.instgrm.Embeds.process();
      return;
    }
    if (!document.getElementById('ig-embed-js')) {
      const s = document.createElement('script');
      s.id = 'ig-embed-js';
      s.async = true;
      s.src = 'https://www.instagram.com/embed.js';
      s.onload = () => window.instgrm?.Embeds.process();
      document.body.appendChild(s);
    }
  }, []);

  return (
    <section id="studio-section" className="w-full py-14 sm:py-20 select-none" style={{ backgroundColor: 'var(--theme-surface)' }}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="uppercase" style={{ color: 'var(--theme-primary)' }}>Our Studio</h2>
          <a
            href="https://www.instagram.com/pure_portions_by_arrina"
            target="_blank"
            rel="noreferrer"
            className="inline-block mt-2 text-xs tracking-[0.16em] hover:opacity-70 transition-opacity"
            style={{ color: 'var(--theme-text-secondary)' }}
          >
            @pure_portions_by_arrina ↗
          </a>
        </div>

        <div className="pp-ig-row flex sm:grid sm:grid-cols-3 gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          {INSTAGRAM_POSTS.map((url) => (
            <div key={url} className="snap-center shrink-0 w-[86%] sm:w-auto">
              <blockquote
                className="instagram-media"
                data-instgrm-permalink={`${url}?utm_source=ig_embed&utm_campaign=loading`}
                data-instgrm-version="14"
                style={{ background: '#fff', border: 0, borderRadius: 12, margin: 0, maxWidth: 540, minWidth: 260, width: '100%', boxShadow: '0 0 0 0.5px rgba(0,0,0,.08), 0 10px 30px -14px rgba(0,0,0,.25)' }}
              >
                <a href={url} target="_blank" rel="noreferrer" className="block p-6 text-center text-xs tracking-widest uppercase" style={{ color: 'var(--theme-text-secondary)' }}>
                  View on Instagram
                </a>
              </blockquote>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

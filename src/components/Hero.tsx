import React from 'react';

interface HeroProps {
  onExploreClick: () => void;
  onOrderProduct?: () => void;
  heroData?: {
    headline?: string;
    tagline?: string;
    specifier?: string;
    primary_cta_text?: string;
    secondary_cta_text?: string;
    image?: string;
    video_url?: string;
  };
}

export const Hero: React.FC<HeroProps> = ({ onExploreClick, onOrderProduct, heroData }) => {
  const videoSource = heroData?.video_url || 'https://ik.imagekit.io/t1q0n1ovm/pchero%20vid.mp4';
  const specifier = heroData?.specifier || 'PURE PORTIONS BY ARRINA';
  const headline = heroData?.headline || 'COLLECTION IS LIVE';
  const primaryCta = heroData?.primary_cta_text || 'Explore Decants';
  const secondaryCta = heroData?.secondary_cta_text || 'Buy Pure Portions by ARRINA';

  return (
    <section className="relative w-full h-[82vh] min-h-[540px] max-h-[880px] bg-black text-white overflow-hidden flex items-end">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={videoSource} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Dark Overlay Gradient for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/15 pointer-events-none" />

      {/* Left Bottom Content Block */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 pb-10 sm:pb-14 lg:pb-16 flex flex-col items-start text-left">
        <div className="max-w-2xl space-y-3 sm:space-y-4">
          {/* Eyebrow / Category Tag */}
          <p className="text-xs sm:text-sm font-sans font-bold tracking-[0.2em] uppercase text-white/90">
            {specifier}
          </p>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white uppercase leading-[0.95] drop-shadow-md">
            {headline}
          </h1>

          {/* Subtext CTA Links (Ref layout with underlines) */}
          <div className="pt-2 sm:pt-4 flex flex-col items-start gap-2.5 sm:gap-3 text-base sm:text-lg font-semibold tracking-wide text-white">
            <button
              onClick={onExploreClick}
              className="group inline-flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer text-left"
            >
              <span className="underline underline-offset-4 sm:underline-offset-8 decoration-2 decoration-white font-medium">
                {primaryCta}
              </span>
            </button>

            <button
              onClick={onOrderProduct || onExploreClick}
              className="group inline-flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer text-left"
            >
              <span className="underline underline-offset-4 sm:underline-offset-8 decoration-2 decoration-white font-medium">
                {secondaryCta}
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

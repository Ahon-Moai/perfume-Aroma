import React, { useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Sparkles } from 'lucide-react';

interface VideoSectionProps {
  videoData?: {
    video_url?: string;
    poster_image?: string;
    headline?: string;
    tagline?: string;
    cta_text?: string;
    is_enabled?: boolean;
  };
  onExploreClick?: () => void;
}

export const VideoSection: React.FC<VideoSectionProps> = ({ videoData, onExploreClick }) => {
  const isEnabled = videoData?.is_enabled ?? true;
  if (!isEnabled) return null;

  const videoUrl = videoData?.video_url || 'https://assets.mixkit.co/videos/preview/mixkit-perfume-bottle-in-a-dark-background-41527-large.mp4';
  const posterImage = videoData?.poster_image || '/src/assets/images/hero_pure_portions_arrina_1791911761493.jpg';
  const headline = videoData?.headline || 'AURA & SILLAGE IN MOTION';
  const tagline = videoData?.tagline || 'Weightless liquid gold suspended in high-pressure glass atomizers. Experience the delicate art of artisanal decanting.';
  const ctaText = videoData?.cta_text || 'DISCOVER SIGNATURE COLLECTION';

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <section className="w-full bg-black py-12 sm:py-20 border-b border-zinc-900 relative overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Section Ribbon */}
        <div className="flex flex-col items-center justify-center text-center mb-8 sm:mb-12 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900/90 border border-amber-400/30 rounded-full text-[10px] tracking-[0.25em] text-amber-300 uppercase font-sans">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>ARRINA CINEMATIC ATELIER</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl text-white font-light tracking-widest uppercase">
            {headline}
          </h2>
          <p className="max-w-2xl text-xs sm:text-sm text-zinc-400 font-sans tracking-wide leading-relaxed">
            {tagline}
          </p>
        </div>

        {/* Video Player Box */}
        <div className="relative w-full aspect-video max-w-5xl mx-auto bg-zinc-950 border border-zinc-800/80 shadow-2xl overflow-hidden group">
          <video
            ref={videoRef}
            src={videoUrl}
            poster={posterImage}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            className="w-full h-full object-cover object-center filter brightness-[0.9] contrast-[1.05]"
          />

          {/* Ambient Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          {/* Interactive Player Controls Overlay */}
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex items-center justify-between text-white z-10">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause video' : 'Play video'}
                className="p-2.5 sm:p-3 bg-zinc-950/80 hover:bg-amber-400 hover:text-black text-white border border-zinc-700/80 transition-all rounded-full cursor-pointer shadow-lg backdrop-blur-md"
              >
                {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />}
              </button>

              <button
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                className="p-2.5 sm:p-3 bg-zinc-950/80 hover:bg-amber-400 hover:text-black text-white border border-zinc-700/80 transition-all rounded-full cursor-pointer shadow-lg backdrop-blur-md"
              >
                {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => {
                if (onExploreClick) {
                  onExploreClick();
                } else {
                  const el = document.getElementById('new-arrivals');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="px-5 py-2.5 sm:px-7 sm:py-3 bg-amber-400 hover:bg-amber-300 text-black text-[11px] sm:text-xs font-semibold tracking-widest uppercase transition-all duration-300 shadow-xl cursor-pointer hover:scale-105"
            >
              <span>{ctaText}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

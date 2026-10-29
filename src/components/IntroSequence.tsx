import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// Fashion images from assets
import herImg from '../assets/images/campaign_for_her_1791908163547.jpg';
import himImg from '../assets/images/campaign_for_him_1791908163466.jpg';
import heroImg from '../assets/images/hero_pure_portions_arrina_1791911761493.jpg';
import streetImg from '../assets/images/season_monochrome_street_1791908200992.jpg';

interface IntroSequenceProps {
  onComplete: () => void;
}

export const IntroSequence: React.FC<IntroSequenceProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = prefersReducedMotion ? 1200 : 3000;

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const handleExitComplete = () => {
    try {
      sessionStorage.setItem('hasSeenIntro', 'true');
    } catch (e) {
      // Ignore storage errors
    }
    onComplete();
  };

  const handleSkip = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-black text-[#eee9e0] flex items-center justify-center overflow-hidden select-none cursor-pointer"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          onClick={handleSkip}
          aria-label="Intro animation. Click to skip."
        >
          {/* Main composition container */}
          <div className="relative w-full max-w-[1280px] h-[85vh] flex items-center justify-center px-4">

            {/* Upper Right "090" Tag */}
            <motion.div
              className="absolute top-[22%] right-[10%] md:right-[15%] text-base md:text-2xl font-sans tracking-tight text-[#eee9e0] font-semibold"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              090
            </motion.div>

            {/* Layered Fashion Image Collage */}
            <div className="relative w-[210px] sm:w-[260px] md:w-[320px] lg:w-[360px] aspect-[3/4] flex items-center justify-center">

              {/* Layer 1: Bottom Red Backing Card (Offset Bottom-Left & Top-Right) */}
              <motion.div
                className="absolute inset-0 bg-[#ff0001] rounded-[1px] shadow-2xl"
                initial={{ opacity: 0, scale: 0.88, rotate: -6, x: -12, y: 12 }}
                animate={{ opacity: 1, scale: 1, rotate: -4, x: -6, y: 6 }}
                transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              />

              {/* Layer 2: White Backing Card (Offset Top-Left & Bottom-Right) */}
              <motion.div
                className="absolute inset-0 bg-white rounded-[1px] shadow-xl overflow-hidden"
                initial={{ opacity: 0, scale: 0.9, rotate: 5, x: 10, y: -8 }}
                animate={{ opacity: 1, scale: 1, rotate: 3, x: 5, y: -4 }}
                transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <img
                  src={streetImg}
                  alt="Backing fashion layer"
                  className="w-full h-full object-cover filter grayscale contrast-125 brightness-90"
                />
              </motion.div>

              {/* Layer 3: Red Accent Frame Layer */}
              <motion.div
                className="absolute inset-0 bg-[#ff0001] p-[2px] rounded-[1px] shadow-2xl"
                initial={{ opacity: 0, scale: 0.92, rotate: -3, x: -8, y: -6 }}
                animate={{ opacity: 1, scale: 1, rotate: -2, x: -3, y: -2 }}
                transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="w-full h-full bg-neutral-900 overflow-hidden">
                  <img
                    src={himImg}
                    alt="Fashion campaign photo"
                    className="w-full h-full object-cover filter contrast-110"
                  />
                </div>
              </motion.div>

              {/* Layer 4: White Inner Border Card */}
              <motion.div
                className="absolute inset-0 bg-neutral-100 p-[2px] rounded-[1px] shadow-2xl"
                initial={{ opacity: 0, scale: 0.94, rotate: 3, x: 6, y: 4 }}
                animate={{ opacity: 1, scale: 1, rotate: 2, x: 2, y: 2 }}
                transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="w-full h-full bg-neutral-900 overflow-hidden">
                  <img
                    src={heroImg}
                    alt="Editorial model showcase"
                    className="w-full h-full object-cover filter contrast-105"
                  />
                </div>
              </motion.div>

              {/* Layer 5: Top Main Fashion Model Card */}
              <motion.div
                className="absolute inset-0 bg-white p-[2px] rounded-[1px] shadow-2xl overflow-hidden border border-neutral-200"
                initial={{ opacity: 0, scale: 0.96, rotate: -1, x: -2, y: 2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0, x: 0, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="relative w-full h-full overflow-hidden bg-[#ded8ce]">
                  <img
                    src={herImg}
                    alt="OUTFIT Main Editorial Fashion Cutout"
                    className="w-full h-full object-cover object-top filter contrast-115 brightness-105"
                  />
                  {/* Subtle ++ fashion mark matching reference screenshot */}
                  <div className="absolute bottom-3 right-3 text-black text-lg font-black tracking-tighter opacity-90">
                    ++
                  </div>
                </div>
              </motion.div>

            </div>

            {/* Oversized OUTFIT. Typography Overlapping Central Collage */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.55, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="text-[#eee9e0] font-black uppercase tracking-tighter text-[16vw] sm:text-[17vw] md:text-[18vw] leading-none flex items-baseline drop-shadow-2xl font-sans">
                <span>OUTFIT.</span>
                <span className="text-[0.14em] font-bold self-baseline ml-[0.2vw] tracking-normal">
                  ®
                </span>
              </h1>
            </motion.div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

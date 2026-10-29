import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// Fashion images from assets
import portraitImg from '../assets/images/season_dark_forest_1791908203381.jpg';
import himImg from '../assets/images/campaign_for_him_1791908163466.jpg';
import heroImg from '../assets/images/season_dune_red_sun_1791908201156.jpg';
import streetImg from '../assets/images/season_monochrome_street_1791908200992.jpg';

interface IntroSequenceProps {
  onComplete: () => void;
}

export const IntroSequence: React.FC<IntroSequenceProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = prefersReducedMotion ? 1500 : 3600;

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const handleExitComplete = () => {
    onComplete();
  };

  const handleSkip = () => {
    setIsVisible(false);
  };

  // Letters array for bottom-to-top staggered sequence animation
  const letters = [
    { char: 'O', delay: 0.60 },
    { char: 'U', delay: 0.66 },
    { char: 'T', delay: 0.72 },
    { char: 'F', delay: 0.78 },
    { char: 'I', delay: 0.84 },
    { char: 'T', delay: 0.90 },
    { char: '.', delay: 0.96 },
  ];

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-black text-[#eee9e0] flex items-center justify-center overflow-hidden select-none cursor-pointer"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          onClick={handleSkip}
          aria-label="Intro animation. Click to skip."
        >
          {/* Main composition container */}
          <div className="relative w-full max-w-[1280px] h-[90vh] flex items-center justify-center px-4">

            {/* Layered Fashion Image Collage (Tilted stack matching reference photo) */}
            <div className="relative w-[170px] sm:w-[220px] md:w-[310px] lg:w-[350px] aspect-[3/4] flex items-center justify-center z-0">

              {/* Layer 1: Bottom Red Backing Card */}
              <motion.div
                className="absolute inset-0 bg-[#ff0001] rounded-[1px] shadow-2xl"
                initial={{ opacity: 0, scale: 0.85, rotate: 2, x: -10, y: 10 }}
                animate={{ opacity: 1, scale: 1, rotate: 4, x: -5, y: 5 }}
                transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              />

              {/* Layer 2: White Backing Card */}
              <motion.div
                className="absolute inset-0 bg-white rounded-[1px] shadow-xl overflow-hidden"
                initial={{ opacity: 0, scale: 0.88, rotate: 12, x: 12, y: -6 }}
                animate={{ opacity: 1, scale: 1, rotate: 10, x: 6, y: -3 }}
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
                initial={{ opacity: 0, scale: 0.90, rotate: 3, x: -6, y: -4 }}
                animate={{ opacity: 1, scale: 1, rotate: 5, x: -2, y: -2 }}
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
                className="absolute inset-0 bg-white p-[2px] rounded-[1px] shadow-2xl"
                initial={{ opacity: 0, scale: 0.93, rotate: 10, x: 8, y: 4 }}
                animate={{ opacity: 1, scale: 1, rotate: 8.5, x: 4, y: 2 }}
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

              {/* Layer 5: Top Main Fashion Model Card (Tilted ~7.5 degrees) */}
              <motion.div
                className="absolute inset-0 bg-white p-[2px] rounded-[1px] shadow-2xl overflow-hidden border border-neutral-200"
                initial={{ opacity: 0, scale: 0.95, rotate: 0, x: 0, y: 0 }}
                animate={{ opacity: 1, scale: 1, rotate: 7.5, x: 0, y: 0 }}
                transition={{ delay: 0.5, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="relative w-full h-full overflow-hidden bg-[#e8e4dc]">
                  <img
                    src={portraitImg}
                    alt="OUTFIT Main Editorial Cutout"
                    className="w-full h-full object-cover object-center filter contrast-115 brightness-105"
                  />
                  {/* Subtle ++ fashion mark matching reference screenshot */}
                  <div className="absolute bottom-4 right-4 text-black text-xl sm:text-2xl font-black tracking-tighter opacity-90">
                    ++
                  </div>
                </div>
              </motion.div>

            </div>

            {/* Oversized OUTFIT. Typography with blend mode negative effect and staggered bottom-to-top entry */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 mix-blend-difference">
              <h1 className="text-white font-black uppercase tracking-tighter text-[22vw] sm:text-[18vw] md:text-[17vw] lg:text-[18vw] leading-none flex items-baseline font-sans">
                {letters.map((item, idx) => (
                  <motion.span
                    key={idx}
                    className="inline-block"
                    initial={{ y: 55, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      delay: item.delay,
                      duration: 0.55,
                      ease: [0.215, 0.61, 0.355, 1],
                    }}
                  >
                    {item.char}
                  </motion.span>
                ))}

                {/* Registered Trademark Symbol */}
                <motion.span
                  className="text-[0.14em] font-bold self-baseline ml-[0.3vw] tracking-normal inline-block"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.08, duration: 0.45 }}
                >
                  ®
                </motion.span>
              </h1>
            </div>

            {/* "092" Tag Positioned at Lower Right Composition Area */}
            <motion.div
              className="absolute bottom-[20%] right-[10%] sm:right-[15%] md:right-[18%] text-xl sm:text-2xl md:text-3xl font-sans tracking-tight text-[#eee9e0] font-semibold z-30"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              092
            </motion.div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

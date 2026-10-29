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
  const [counter, setCounter] = useState(0);

  // Animated Counter from 0 to 99
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setCounter(99);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 1000);
      return () => clearTimeout(timer);
    }

    const duration = 2200; // Total counter duration in ms
    const steps = 100;
    const intervalTime = duration / steps; // ~22ms per tick

    const interval = setInterval(() => {
      setCounter((prev) => {
        if (prev >= 99) {
          clearInterval(interval);
          // Brief pause on 99 before triggering exit
          setTimeout(() => {
            setIsVisible(false);
          }, 200);
          return 99;
        }
        return prev + 1;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, []);

  const handleExitComplete = () => {
    onComplete();
  };

  const handleSkip = () => {
    setIsVisible(false);
  };

  // Letters array for staggered sequence animation
  const letters = [
    { char: 'P', delay: 0.25 },
    { char: 'U', delay: 0.28 },
    { char: 'R', delay: 0.31 },
    { char: 'E', delay: 0.34 },
    { char: '\u00A0', delay: 0.37 },
    { char: 'P', delay: 0.40 },
    { char: 'O', delay: 0.43 },
    { char: 'R', delay: 0.46 },
    { char: 'T', delay: 0.49 },
    { char: 'I', delay: 0.52 },
    { char: 'O', delay: 0.55 },
    { char: 'N', delay: 0.58 },
    { char: 'S', delay: 0.61 },
    { char: '.', delay: 0.64 },
  ];

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-black text-[#eee9e0] flex items-center justify-center overflow-hidden select-none cursor-pointer"
          initial={{ y: '0%' }}
          animate={{ y: '0%' }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
          onClick={handleSkip}
          aria-label="Intro animation. Click to skip."
        >
          {/* Main composition container */}
          <div className="relative w-full max-w-[1280px] h-[90vh] flex items-center justify-center px-4">

            {/* Layered Fashion Image Collage (Left tilted, Right tilted, Normal center top) */}
            <motion.div
              className="relative w-[170px] sm:w-[220px] md:w-[310px] lg:w-[350px] aspect-[3/4] flex items-center justify-center z-0"
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.82, y: 60 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >

              {/* LAYER 1: LEFT-TILTED IMAGE STACK (-15deg rotation) */}
              {/* Left Backing Red Accent Frame */}
              <motion.div
                className="absolute inset-0 bg-[#ff0001] rounded-[1px] shadow-2xl"
                initial={{ opacity: 0, scale: 0.85, rotate: 0, x: 0, y: 0 }}
                animate={{ opacity: 1, scale: 1, rotate: -18, x: -28, y: 12 }}
                exit={{ rotate: 0, x: 0, y: 40, opacity: 0 }}
                transition={{ delay: 0.1, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              />

              {/* Left Image Card: Monochrome / Fashion Shot */}
              <motion.div
                className="absolute inset-0 bg-white p-[2px] rounded-[1px] shadow-2xl overflow-hidden"
                initial={{ opacity: 0, scale: 0.88, rotate: 0, x: 0, y: 0 }}
                animate={{ opacity: 1, scale: 1, rotate: -15, x: -22, y: 6 }}
                exit={{ rotate: 0, x: 0, y: 40, opacity: 0 }}
                transition={{ delay: 0.2, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="w-full h-full bg-neutral-900 overflow-hidden">
                  <img
                    src={streetImg}
                    alt="Left tilted fashion layer"
                    className="w-full h-full object-cover filter grayscale contrast-125 brightness-90"
                  />
                </div>
              </motion.div>

              {/* LAYER 2: RIGHT-TILTED IMAGE STACK (+15deg rotation) */}
              {/* Right Backing Red Accent Frame */}
              <motion.div
                className="absolute inset-0 bg-[#ff0001] rounded-[1px] shadow-2xl"
                initial={{ opacity: 0, scale: 0.85, rotate: 0, x: 0, y: 0 }}
                animate={{ opacity: 1, scale: 1, rotate: 18, x: 28, y: 12 }}
                exit={{ rotate: 0, x: 0, y: 40, opacity: 0 }}
                transition={{ delay: 0.15, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              />

              {/* Right Image Card: Dune Editorial Shot */}
              <motion.div
                className="absolute inset-0 bg-white p-[2px] rounded-[1px] shadow-2xl overflow-hidden"
                initial={{ opacity: 0, scale: 0.88, rotate: 0, x: 0, y: 0 }}
                animate={{ opacity: 1, scale: 1, rotate: 15, x: 22, y: 6 }}
                exit={{ rotate: 0, x: 0, y: 40, opacity: 0 }}
                transition={{ delay: 0.3, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="w-full h-full bg-neutral-900 overflow-hidden">
                  <img
                    src={heroImg}
                    alt="Right tilted fashion showcase"
                    className="w-full h-full object-cover filter contrast-110"
                  />
                </div>
              </motion.div>

              {/* LAYER 3: TOP MAIN IMAGE CARD (TOTALLY NORMAL / 0deg rotation) */}
              <motion.div
                className="absolute inset-0 bg-white p-[2px] rounded-[1px] shadow-2xl overflow-hidden border border-neutral-200 z-10"
                initial={{ opacity: 0, scale: 0.92, rotate: 0, x: 0, y: 0 }}
                animate={{ opacity: 1, scale: 1, rotate: 0, x: 0, y: 0 }}
                exit={{ opacity: 0, scale: 0.88, y: 40 }}
                transition={{ delay: 0.45, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="relative w-full h-full overflow-hidden bg-[#e8e4dc]">
                  <img
                    src={portraitImg}
                    alt="Pure Portions Main Editorial Cutout"
                    className="w-full h-full object-cover object-center filter contrast-115 brightness-105"
                  />
                  {/* Subtle ++ fashion mark matching reference screenshot */}
                  <div className="absolute bottom-4 right-4 text-black text-xl sm:text-2xl font-black tracking-tighter opacity-90">
                    ++
                  </div>
                </div>
              </motion.div>

            </motion.div>

            {/* Oversized PURE PORTIONS. Typography with blend mode negative effect and staggered entrance/exit */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 mix-blend-difference">
              <h1 className="text-white font-black uppercase tracking-tighter text-[11vw] sm:text-[9.5vw] md:text-[8.5vw] lg:text-[9vw] leading-none flex items-baseline font-sans whitespace-nowrap">
                {letters.map((item, idx) => (
                  <motion.span
                    key={idx}
                    className="inline-block"
                    initial={{ y: 65, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 80, opacity: 0 }}
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
                  exit={{ y: 40, opacity: 0 }}
                  transition={{
                    delay: 0.75,
                    duration: 0.45,
                  }}
                >
                  ®
                </motion.span>
              </h1>
            </div>

            {/* Counter Number Animated 00 - 99 Positioned at Lower Right Composition Area */}
            <motion.div
              className="absolute bottom-[20%] right-[10%] sm:right-[15%] md:right-[18%] text-xl sm:text-2xl md:text-3xl font-sans tracking-tight text-[#eee9e0] font-semibold z-30 tabular-nums"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{
                delay: 0.2,
                duration: 0.5,
              }}
            >
              {String(counter).padStart(2, '0')}
            </motion.div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

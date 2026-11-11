import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  RotateCcw,
  Check,
  ShoppingBag,
  ExternalLink,
  Flame,
  Clock,
  Compass,
  Calendar,
  Layers,
  HeartHandshake,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import {
  FinderAnswers,
  FinderMetadata,
  RecommendationResponse,
  RecommendedPerfume,
  FragranceProduct
} from '../types';
import { fetchFinderMetadata, getPerfumeRecommendations } from '../services/api';

interface PerfumeFinderProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToProduct: (product: FragranceProduct | string) => void;
  onAddToCart: (product: FragranceProduct, size: string, price: number, qty?: number) => void;
}

// 8 Questions Configuration
const FRAGRANCE_FAMILIES = [
  { id: 'Fresh & Aquatic', label: 'Fresh & Aquatic', desc: 'Ocean air, marine ozones, clean water' },
  { id: 'Woody & Earthy', label: 'Woody & Earthy', desc: 'Cedarwood, sandalwood, vetiver, damp forest' },
  { id: 'Sweet & Gourmand', label: 'Sweet & Gourmand', desc: 'Madagascar vanilla, toasted tonka, praline' },
  { id: 'Floral', label: 'Floral', desc: 'Damask rose, white jasmine, luminous neroli' },
  { id: 'Citrus & Zesty', label: 'Citrus & Zesty', desc: 'Calabrian bergamot, solar dew, crisp lemon' },
  { id: 'Spicy & Warm', label: 'Spicy & Warm', desc: 'Cardamom, saffron, cinnamon, golden amber' },
  { id: 'Musky', label: 'Musky', desc: 'White musk, cashmeran, clean skin intimacies' },
  { id: 'Oud & Oriental', label: 'Oud & Oriental', desc: 'Smoked royal oud, incenses, dark resins' },
  { id: 'Aromatic', label: 'Aromatic', desc: 'French lavender, clary sage, herbal vitality' }
];

const OCCASIONS = [
  { id: 'Everyday / Casual', label: 'Everyday / Casual', desc: 'Versatile signature wear for daily routines' },
  { id: 'Office / Professional', label: 'Office / Professional', desc: 'Crisp, inoffensive, composed sophistication' },
  { id: 'Date Night', label: 'Date Night', desc: 'Intimate, warm, alluring sillage' },
  { id: 'Parties & Events', label: 'Parties & Events', desc: 'Social energy, projecting and memorable' },
  { id: 'Special Occasions', label: 'Special Occasions', desc: 'Black tie, weddings, galas, unforgettable milestones' },
  { id: 'Gym / Outdoor', label: 'Gym / Outdoor', desc: 'Invigorating, light, fresh athletic endurance' }
];

const SEASONS = [
  { id: 'Summer', label: 'Summer', desc: 'Light, effervescent, cooling citrus and aquatic accords' },
  { id: 'Winter', label: 'Winter', desc: 'Deep, enveloping amber, vanilla, rich woods & spices' },
  { id: 'Spring', label: 'Spring', desc: 'Fresh floral blooms, green moss, dew and crisp air' },
  { id: 'Autumn', label: 'Autumn', desc: 'Smoked leaves, cinnamon, golden amber, earthy resins' },
  { id: 'All Seasons', label: 'All Seasons', desc: 'Versatile year-round signature versatility' }
];

const INTENSITIES = [
  { id: 'Light & Subtle', label: 'Light & Subtle', desc: 'Close skin-scent, delicate and personal' },
  { id: 'Moderate & Balanced', label: 'Moderate & Balanced', desc: 'Noticeable at conversational arm’s length' },
  { id: 'Strong & Noticeable', label: 'Strong & Noticeable', desc: 'Leaves a distinct sillage trail as you move' },
  { id: 'Beast Mode / Powerful Projection', label: 'Beast Mode / Powerful', desc: 'Dominates the room with formidable projection' }
];

const LONGEVITIES = [
  { id: '2–4 Hours', label: '2–4 Hours', desc: 'Light eau de cologne or subtle freshener' },
  { id: '4–6 Hours', label: '4–6 Hours', desc: 'Balanced daytime eau de toilette longevity' },
  { id: '6–8 Hours', label: '6–8 Hours', desc: 'Full workday durability without re-spraying' },
  { id: '8+ Hours', label: '8+ Hours', desc: 'Concentrated extrait lasting morning through night' }
];

const EXPERIENCES = [
  { id: 'Something Safe & Crowd-Pleasing', label: 'Safe & Crowd-Pleasing', desc: 'Universal appeal, universally admired' },
  { id: 'Something Unique & Different', label: 'Unique & Different', desc: 'Niche, intriguing and unconventional note blends' },
  { id: 'Compliment Getter', label: 'Compliment Getter', desc: 'Engineered for head-turns and spontaneous praise' },
  { id: 'Luxury & Sophisticated', label: 'Luxury & Sophisticated', desc: 'Opulent, aristocratic, regal quiet luxury' },
  { id: 'Bold & Attention-Grabbing', label: 'Bold & Attention-Grabbing', desc: 'Unapologetic, potent, unmistakable presence' }
];

export const PerfumeFinder: React.FC<PerfumeFinderProps> = ({
  isOpen,
  onClose,
  onNavigateToProduct,
  onAddToCart
}) => {
  const [step, setStep] = useState<number>(1);
  const totalSteps = 8;

  const [answers, setAnswers] = useState<FinderAnswers>({
    gender: undefined,
    families: [],
    occasion: undefined,
    season: undefined,
    intensity: undefined,
    longevity: undefined,
    budget: undefined,
    experience: undefined
  });

  const [metadata, setMetadata] = useState<FinderMetadata | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisTextIndex, setAnalysisTextIndex] = useState<number>(0);
  const [results, setResults] = useState<RecommendationResponse | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<{ [productId: string]: string }>({});

  const analysisPhases = [
    'Consulting artisanal master formulas...',
    'Analyzing olfactory pyramid preferences...',
    'Evaluating skin longevity & seasonal projection...',
    'Cross-referencing live decant inventory...',
    'Finalizing your personalized compatibility scores...'
  ];

  // Fetch metadata on mount
  useEffect(() => {
    if (isOpen) {
      fetchFinderMetadata().then((data) => {
        if (data) setMetadata(data);
      });
    }
  }, [isOpen]);

  // Intermediate Analysis Animation effect
  useEffect(() => {
    let interval: any;
    if (isAnalyzing) {
      interval = setInterval(() => {
        setAnalysisTextIndex((prev) => (prev + 1) % analysisPhases.length);
      }, 700);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  if (!isOpen) return null;

  const handleGenderSelect = (val: string) => {
    setAnswers((prev) => ({ ...prev, gender: val }));
  };

  const handleFamilyToggle = (id: string) => {
    setAnswers((prev) => {
      const curr = prev.families || [];
      const next = curr.includes(id) ? curr.filter((f) => f !== id) : [...curr, id];
      return { ...prev, families: next };
    });
  };

  const handleOccasionSelect = (val: string) => {
    setAnswers((prev) => ({ ...prev, occasion: val }));
  };

  const handleSeasonSelect = (val: string) => {
    setAnswers((prev) => ({ ...prev, season: val }));
  };

  const handleIntensitySelect = (val: string) => {
    setAnswers((prev) => ({ ...prev, intensity: val }));
  };

  const handleLongevitySelect = (val: string) => {
    setAnswers((prev) => ({ ...prev, longevity: val }));
  };

  const handleBudgetSelect = (val: string) => {
    setAnswers((prev) => ({ ...prev, budget: val }));
  };

  const handleExperienceSelect = (val: string) => {
    setAnswers((prev) => ({ ...prev, experience: val }));
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep((prev) => prev + 1);
    } else {
      executeAnalysis();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const executeAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisTextIndex(0);

    // Call API and give user a realistic luxury consultant feel
    const [recData] = await Promise.all([
      getPerfumeRecommendations(answers),
      new Promise((resolve) => setTimeout(resolve, 2200))
    ]);

    setIsAnalyzing(false);
    if (recData) {
      setResults(recData);
      // Pre-select first purchasable size for each recommended product
      const defaults: { [id: string]: string } = {};
      recData.recommendations.forEach((p) => {
        if (p.sizes && p.sizes.length > 0) {
          defaults[p.id] = p.sizes[0].size;
        }
      });
      setSelectedVariants(defaults);
      setStep(totalSteps + 1); // Go to results view
    }
  };

  const handleReset = () => {
    setStep(1);
    setResults(null);
    setAnswers({
      gender: undefined,
      families: [],
      occasion: undefined,
      season: undefined,
      intensity: undefined,
      longevity: undefined,
      budget: undefined,
      experience: undefined
    });
  };

  // Check whether current step has a selection
  const canContinue = () => {
    switch (step) {
      case 1:
        return !!answers.gender;
      case 2:
        return (answers.families || []).length > 0;
      case 3:
        return !!answers.occasion;
      case 4:
        return !!answers.season;
      case 5:
        return !!answers.intensity;
      case 6:
        return !!answers.longevity;
      case 7:
        return !!answers.budget;
      case 8:
        return !!answers.experience;
      default:
        return true;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in font-sans">
      <div
        className="relative w-full max-w-3xl bg-white text-zinc-950 border border-zinc-200 shadow-2xl flex flex-col min-h-[580px] max-h-[92vh] overflow-hidden my-auto rounded-none"
        style={{
          backgroundColor: 'var(--theme-surface, #FFFFFF)',
          color: 'var(--theme-primary, #111111)',
          borderColor: 'var(--theme-border, #E5E5E5)'
        }}
      >
        {/* Top Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b shrink-0"
          style={{ borderColor: 'var(--theme-border-subtle, #EAEAEA)' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-zinc-950 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            </div>
            <div>
              <h2 className="font-serif text-base sm:text-lg tracking-tight uppercase font-medium">
                Fragrance Consultant
              </h2>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">
                Intelligent Rule-Based Olfactory Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {step > totalSteps && (
              <button
                onClick={handleReset}
                className="text-xs font-semibold uppercase tracking-wider text-zinc-600 hover:text-black flex items-center gap-1.5 px-3 py-1.5 border border-zinc-300 hover:border-black transition-colors cursor-pointer"
                title="Start a new fragrance consultation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Retake</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-500 hover:text-zinc-950 transition-colors cursor-pointer"
              aria-label="Close fragrance finder"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar (Only during question stages) */}
        {step <= totalSteps && !isAnalyzing && (
          <div className="w-full bg-zinc-100 h-1 shrink-0">
            <motion.div
              className="bg-zinc-950 h-1"
              initial={{ width: 0 }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}

        {/* Modal Body Container */}
        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {/* Intermediate Luxury Analysis Screen */}
            {isAnalyzing ? (
              <motion.div
                key="analyzing-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center text-center py-16 space-y-6"
              >
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-2 border-zinc-200 border-t-zinc-950 animate-spin flex items-center justify-center" />
                  <Sparkles className="w-7 h-7 text-amber-500 absolute inset-0 m-auto animate-pulse" />
                </div>
                <div className="space-y-2 max-w-sm">
                  <h3 className="font-serif text-2xl tracking-tight font-normal">
                    Crafting Your Profile
                  </h3>
                  <p className="text-xs tracking-wider uppercase font-mono text-zinc-500 h-6">
                    {analysisPhases[analysisTextIndex]}
                  </p>
                </div>
              </motion.div>
            ) : step <= totalSteps ? (
              /* Questions 1 - 8 */
              <motion.div
                key={`question-${step}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-6 flex-1 flex flex-col"
              >
                {/* Step Subheader */}
                <div className="flex items-center justify-between border-b pb-3 border-zinc-100">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400">
                    Question {step} of {totalSteps}
                  </span>
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-zinc-700">
                    {step === 2 ? 'Multiple Selections Allowed' : 'Select One Option'}
                  </span>
                </div>

                {/* Question 1: Target User */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-serif text-2xl sm:text-3xl font-normal text-zinc-950">
                        Who are you shopping for?
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1">
                        Select who will be wearing this signature fragrance.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {[
                        { id: 'For Him', label: 'For Him', desc: 'Masculine aromatic, smoky, woody notes' },
                        { id: 'For Her', label: 'For Her', desc: 'Feminine luminous florals, gourmands, soft musks' },
                        { id: 'Unisex', label: 'Unisex', desc: 'Universal artisanal blends, solar ambers, rich resins' },
                        { id: "Doesn't matter", label: "Doesn't matter", desc: 'Open to discovering all magnificent creations' }
                      ].map((opt) => {
                        const isSelected = answers.gender === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleGenderSelect(opt.id)}
                            className={`p-4 text-left border transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? 'border-zinc-950 bg-zinc-950 text-white shadow-md'
                                : 'border-zinc-200 bg-white hover:border-zinc-400 text-zinc-900'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full mb-1">
                              <span className="font-serif text-lg font-medium">{opt.label}</span>
                              {isSelected && <Check className="w-4 h-4 text-amber-300" />}
                            </div>
                            <span className={`text-[11px] ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                              {opt.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Question 2: Fragrance Family (Multi-Select) */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-serif text-2xl sm:text-3xl font-normal text-zinc-950">
                        What kind of fragrance do you prefer?
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1">
                        Select one or more olfactory families that resonate with your taste.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                      {FRAGRANCE_FAMILIES.map((fam) => {
                        const isSelected = (answers.families || []).includes(fam.id);
                        return (
                          <button
                            key={fam.id}
                            type="button"
                            onClick={() => handleFamilyToggle(fam.id)}
                            className={`p-3 text-left border transition-all cursor-pointer flex flex-col justify-between min-h-[82px] ${
                              isSelected
                                ? 'border-zinc-950 bg-zinc-950 text-white shadow-sm'
                                : 'border-zinc-200 bg-white hover:border-zinc-400 text-zinc-900'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="font-serif text-sm font-semibold">{fam.label}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-amber-300" />}
                            </div>
                            <span className={`text-[10px] mt-1 leading-tight ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                              {fam.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Question 3: Occasion */}
                {step === 3 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-serif text-2xl sm:text-3xl font-normal text-zinc-950">
                        When will you mostly wear it?
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1">
                        Different moments call for specific projection levels and scent profiles.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {OCCASIONS.map((occ) => {
                        const isSelected = answers.occasion === occ.id;
                        return (
                          <button
                            key={occ.id}
                            type="button"
                            onClick={() => handleOccasionSelect(occ.id)}
                            className={`p-4 text-left border transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? 'border-zinc-950 bg-zinc-950 text-white shadow-md'
                                : 'border-zinc-200 bg-white hover:border-zinc-400 text-zinc-900'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full mb-1">
                              <span className="font-serif text-base font-semibold">{occ.label}</span>
                              {isSelected && <Check className="w-4 h-4 text-amber-300" />}
                            </div>
                            <span className={`text-[11px] ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                              {occ.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Question 4: Season */}
                {step === 4 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-serif text-2xl sm:text-3xl font-normal text-zinc-950">
                        Which season do you prefer wearing it in?
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1">
                        Temperature and humidity deeply influence how fragrance molecules evolve.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {SEASONS.map((sea) => {
                        const isSelected = answers.season === sea.id;
                        return (
                          <button
                            key={sea.id}
                            type="button"
                            onClick={() => handleSeasonSelect(sea.id)}
                            className={`p-4 text-left border transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? 'border-zinc-950 bg-zinc-950 text-white shadow-md'
                                : 'border-zinc-200 bg-white hover:border-zinc-400 text-zinc-900'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full mb-1">
                              <span className="font-serif text-base font-semibold">{sea.label}</span>
                              {isSelected && <Check className="w-4 h-4 text-amber-300" />}
                            </div>
                            <span className={`text-[11px] ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                              {sea.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Question 5: Intensity */}
                {step === 5 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-serif text-2xl sm:text-3xl font-normal text-zinc-950">
                        What intensity do you prefer?
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1">
                        From intimate skin scents to formidable room-filling presence.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {INTENSITIES.map((int) => {
                        const isSelected = answers.intensity === int.id;
                        return (
                          <button
                            key={int.id}
                            type="button"
                            onClick={() => handleIntensitySelect(int.id)}
                            className={`p-4 text-left border transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? 'border-zinc-950 bg-zinc-950 text-white shadow-md'
                                : 'border-zinc-200 bg-white hover:border-zinc-400 text-zinc-900'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full mb-1">
                              <span className="font-serif text-base font-semibold">{int.label}</span>
                              {isSelected && <Check className="w-4 h-4 text-amber-300" />}
                            </div>
                            <span className={`text-[11px] ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                              {int.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Question 6: Longevity */}
                {step === 6 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-serif text-2xl sm:text-3xl font-normal text-zinc-950">
                        What is your preferred longevity?
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1">
                        How many hours do you wish the perfume dry-down to linger on skin?
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {LONGEVITIES.map((lon) => {
                        const isSelected = answers.longevity === lon.id;
                        return (
                          <button
                            key={lon.id}
                            type="button"
                            onClick={() => handleLongevitySelect(lon.id)}
                            className={`p-4 text-left border transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? 'border-zinc-950 bg-zinc-950 text-white shadow-md'
                                : 'border-zinc-200 bg-white hover:border-zinc-400 text-zinc-900'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full mb-1">
                              <span className="font-serif text-base font-semibold">{lon.label}</span>
                              {isSelected && <Check className="w-4 h-4 text-amber-300" />}
                            </div>
                            <span className={`text-[11px] ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                              {lon.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Question 7: Budget */}
                {step === 7 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-serif text-2xl sm:text-3xl font-normal text-zinc-950">
                        What's your budget?
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1">
                        Calculated dynamically from our active decant catalog prices (in {metadata?.currency || 'BDT'}).
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {[
                        {
                          id: 'budget',
                          label: metadata?.budget_tiers?.budget?.label || 'Budget-friendly',
                          desc: metadata?.budget_tiers?.budget?.description || 'Under ৳ 450'
                        },
                        {
                          id: 'mid',
                          label: metadata?.budget_tiers?.mid?.label || 'Mid-range',
                          desc: metadata?.budget_tiers?.mid?.description || '৳ 450 – ৳ 580'
                        },
                        {
                          id: 'premium',
                          label: metadata?.budget_tiers?.premium?.label || 'Premium',
                          desc: metadata?.budget_tiers?.premium?.description || 'Above ৳ 580'
                        },
                        {
                          id: 'any',
                          label: metadata?.budget_tiers?.any?.label || 'No Budget Limit',
                          desc: metadata?.budget_tiers?.any?.description || 'Show me the best match regardless of price'
                        }
                      ].map((bgt) => {
                        const isSelected = answers.budget === bgt.id;
                        return (
                          <button
                            key={bgt.id}
                            type="button"
                            onClick={() => handleBudgetSelect(bgt.id)}
                            className={`p-4 text-left border transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? 'border-zinc-950 bg-zinc-950 text-white shadow-md'
                                : 'border-zinc-200 bg-white hover:border-zinc-400 text-zinc-900'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full mb-1">
                              <span className="font-serif text-base font-semibold">{bgt.label}</span>
                              {isSelected && <Check className="w-4 h-4 text-amber-300" />}
                            </div>
                            <span className={`text-[11px] ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                              {bgt.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Question 8: Experience */}
                {step === 8 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-serif text-2xl sm:text-3xl font-normal text-zinc-950">
                        What kind of fragrance experience are you looking for?
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1">
                        The emotional impression and olfactory character you want to project.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {EXPERIENCES.map((exp) => {
                        const isSelected = answers.experience === exp.id;
                        return (
                          <button
                            key={exp.id}
                            type="button"
                            onClick={() => handleExperienceSelect(exp.id)}
                            className={`p-4 text-left border transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? 'border-zinc-950 bg-zinc-950 text-white shadow-md'
                                : 'border-zinc-200 bg-white hover:border-zinc-400 text-zinc-900'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full mb-1">
                              <span className="font-serif text-base font-semibold">{exp.label}</span>
                              {isSelected && <Check className="w-4 h-4 text-amber-300" />}
                            </div>
                            <span className={`text-[11px] ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                              {exp.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              /* Step 9+: Results View */
              <motion.div
                key="results-screen"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-8 flex-1"
              >
                {/* Heading & Profile Summary */}
                <div className="text-center max-w-xl mx-auto space-y-2 border-b pb-6 border-zinc-200">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-zinc-800 text-[10px] font-mono tracking-widest uppercase mb-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Personal Fragrance Profile Match</span>
                  </div>
                  <h3 className="font-serif text-3xl sm:text-4xl text-zinc-950 font-normal">
                    Your Fragrance Profile
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 font-sans leading-relaxed">
                    Based on your preferences, we've found fragrances from our authentic decant collection that perfectly match your personality and lifestyle.
                  </p>
                  {results?.profileSummary && (
                    <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 pt-1">
                      {results.profileSummary}
                    </p>
                  )}

                  {results?.fallbackApplied && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs text-left flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                      <div>
                        <span className="font-semibold block">Alternative Matches Displayed</span>
                        <span>
                          Some criteria were gently broadened to ensure only 100% available and authentic decants are recommended.
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Recommendations List (Top 3-5) */}
                {results?.recommendations && results.recommendations.length > 0 ? (
                  <div className="space-y-6">
                    {results.recommendations.map((perfume, idx) => {
                      const activeSize = selectedVariants[perfume.id] || (perfume.sizes?.[0]?.size ?? '5ml');
                      const activeVariant = perfume.sizes?.find((s) => s.size === activeSize) || perfume.sizes?.[0];
                      const currentPrice = activeVariant ? activeVariant.price : perfume.startingPrice;

                      return (
                        <div
                          key={perfume.id}
                          className="border border-zinc-200 bg-white p-4 sm:p-6 flex flex-col md:flex-row gap-6 hover:shadow-lg transition-shadow relative"
                        >
                          {/* Rank & Compatibility Badge */}
                          <div className="absolute top-4 right-4 flex items-center gap-2">
                            <span className="bg-zinc-950 text-white text-xs font-mono font-bold px-2.5 py-1 tracking-wider uppercase border border-zinc-800">
                              {perfume.compatibilityScore}% Match
                            </span>
                          </div>

                          {/* Left: Product Imagery */}
                          <div className="w-full md:w-44 h-48 md:h-auto bg-zinc-50 border border-zinc-100 p-3 shrink-0 flex items-center justify-center relative">
                            <span className="absolute top-2 left-2 text-[10px] font-mono text-zinc-400">
                              #{idx + 1}
                            </span>
                            <img
                              src={perfume.image}
                              alt={perfume.name}
                              className="max-h-40 max-w-full object-contain mix-blend-multiply"
                            />
                          </div>

                          {/* Right: Olfactory Details & Actions */}
                          <div className="flex-1 flex flex-col justify-between space-y-4">
                            <div>
                              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">
                                {perfume.brand} · {perfume.concentration || 'Eau de Parfum'}
                              </p>
                              <h4 className="font-serif text-xl sm:text-2xl text-zinc-950 font-normal">
                                {perfume.name}
                              </h4>
                              <p className="text-xs text-zinc-500 font-mono mt-0.5">
                                Family: <span className="text-zinc-800 font-sans font-medium">{perfume.fragranceFamily}</span>
                              </p>

                              {/* Why it Matches Card */}
                              <div className="mt-3 p-3 bg-zinc-50 border border-zinc-200/80 text-xs text-zinc-800 leading-relaxed font-sans">
                                <span className="font-bold text-zinc-950 block text-[11px] uppercase tracking-wider mb-0.5">
                                  Why This Matches You:
                                </span>
                                {perfume.whyMatches || perfume.explanation}
                              </div>

                              {/* Accords Preview */}
                              {perfume.accords && perfume.accords.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-1.5 items-center">
                                  <span className="text-[10px] uppercase font-mono text-zinc-400 mr-1">Accords:</span>
                                  {perfume.accords.slice(0, 4).map((acc, aIdx) => (
                                    <span
                                      key={aIdx}
                                      style={{ backgroundColor: acc.color ? `${acc.color}33` : '#f4f4f4', borderColor: acc.color || '#ccc' }}
                                      className="px-2 py-0.5 text-[10px] border font-medium text-zinc-900 uppercase"
                                    >
                                      {acc.name}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Longevity & Projection Tags */}
                              <div className="mt-2.5 flex items-center gap-4 text-[11px] text-zinc-500 font-mono">
                                <span>Longevity: <strong className="text-zinc-800 font-sans">{perfume.longevity}</strong></span>
                                <span>·</span>
                                <span>Projection: <strong className="text-zinc-800 font-sans">{perfume.projection}</strong></span>
                              </div>
                            </div>

                            {/* Bottom: Decant Size Selector, Price & CTA Buttons */}
                            <div className="pt-3 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              {/* Decant Size Selector */}
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-mono">Size:</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {perfume.sizes.map((s) => (
                                    <button
                                      key={s.size}
                                      onClick={() => setSelectedVariants((prev) => ({ ...prev, [perfume.id]: s.size }))}
                                      className={`px-2.5 py-1 text-xs font-mono uppercase border transition-colors cursor-pointer ${
                                        activeSize === s.size
                                          ? 'border-zinc-950 bg-zinc-950 text-white font-bold'
                                          : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400'
                                      }`}
                                    >
                                      {s.size}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Price & Action Buttons */}
                              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                                <div className="text-right">
                                  <span className="text-base sm:text-lg font-mono font-bold text-zinc-950">
                                    ৳ {currentPrice}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      onClose();
                                      onNavigateToProduct(perfume);
                                    }}
                                    className="p-2 border border-zinc-300 hover:border-zinc-950 text-zinc-700 hover:text-black transition-colors cursor-pointer"
                                    title="View Product Details"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </button>

                                  <button
                                    onClick={() => {
                                      onAddToCart(perfume, activeSize, currentPrice, 1);
                                    }}
                                    className="px-4 py-2 bg-zinc-950 text-white hover:bg-amber-400 hover:text-black text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
                                  >
                                    <ShoppingBag className="w-3.5 h-3.5" />
                                    <span>Add Decant</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Zero Match Fallback */
                  <div className="p-8 text-center bg-zinc-50 border border-zinc-200 space-y-4">
                    <AlertCircle className="w-10 h-10 mx-auto text-zinc-400" />
                    <h4 className="font-serif text-xl font-normal text-zinc-900">
                      No Exact Inventory Matches Found
                    </h4>
                    <p className="text-xs text-zinc-600 max-w-md mx-auto">
                      All decants matching your precise constraints are currently reserved or out of stock. Try broadening your preferences or exploring our complete catalog.
                    </p>
                    <button
                      onClick={handleReset}
                      className="px-6 py-2.5 bg-zinc-950 text-white hover:bg-zinc-800 text-xs uppercase tracking-wider font-semibold cursor-pointer"
                    >
                      Adjust Preferences
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Modal Bottom Controls (During Question Flow) */}
        {step <= totalSteps && !isAnalyzing && (
          <div
            className="px-6 py-4 border-t flex items-center justify-between shrink-0 bg-white"
            style={{ borderColor: 'var(--theme-border-subtle, #EAEAEA)' }}
          >
            {/* Back Button */}
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 border border-zinc-200 hover:border-zinc-400 text-xs uppercase tracking-wider font-semibold text-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {/* Right: Skip and Continue */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSkip}
                className="px-3 py-2 text-xs uppercase tracking-wider text-zinc-500 hover:text-zinc-950 transition-colors cursor-pointer mr-1"
              >
                Skip Question
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={!canContinue()}
                className={`px-6 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  canContinue()
                    ? 'bg-zinc-950 text-white hover:bg-amber-400 hover:text-black shadow-sm'
                    : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                }`}
              >
                <span>{step === totalSteps ? 'Reveal Matches' : 'Continue'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

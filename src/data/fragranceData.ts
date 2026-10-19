import { FragranceProduct, ReviewItem, SocialCard, JournalArticle } from '../types';

// Asset references matching generated images
export const IMAGES = {
  hero: '/src/assets/images/hero_pure_portions_arrina_1791911761493.jpg',
  heroArchitecturalOriginal: '/src/assets/images/hero_perfume_architectural_1791908158566.jpg',
  purePortionsBottle: '/src/assets/images/element_pure_portions_bottle_1791911761812.jpg',
  purePortionsIngredients: '/src/assets/images/element_vanilla_neroli_1791911761343.jpg',
  products: {
    purePortions: '/src/assets/images/element_pure_portions_bottle_1791911761812.jpg',
    rose01: '/src/assets/images/perfume_rose01_1791908158391.jpg',
    vanilla01: '/src/assets/images/perfume_vanilla01_1791908158466.jpg',
    genesisLeo: '/src/assets/images/perfume_genesis_leo_1791908160379.jpg',
    venena: '/src/assets/images/perfume_venena_1791908161282.jpg',
    asdaafRaneen: '/src/assets/images/perfume_asdaaf_raneen_1791908163183.jpg'
  },
  campaigns: {
    forHim: '/src/assets/images/campaign_for_him_1791908163466.jpg',
    forHer: '/src/assets/images/campaign_for_her_1791908163547.jpg'
  },
  seasons: {
    autumnDune: '/src/assets/images/season_dune_red_sun_1791908201156.jpg',
    winterStreet: '/src/assets/images/season_monochrome_street_1791908200992.jpg',
    summerRoses: '/src/assets/images/season_sculptural_roses_1791908202058.jpg',
    springForest: '/src/assets/images/season_dark_forest_1791908203381.jpg'
  },
  studio: {
    travertine: '/src/assets/images/studio_social_travertine_1791908203434.jpg',
    handDecant: '/src/assets/images/studio_social_hand_decant_1791908204628.jpg',
    goldFlacon: '/src/assets/images/studio_social_gold_flacon_1791908204833.jpg',
    amberMist: '/src/assets/images/studio_social_amber_spray_1791908204588.jpg'
  },
  articles: {
    buyersGuide: '/src/assets/images/article_decant_buyers_guide_1791908274237.jpg',
    perfumeRoses: '/src/assets/images/article_perfume_roses_water_1791908274460.jpg',
    lilacPricing: '/src/assets/images/article_lilac_pricing_1791908274975.jpg'
  }
};

export const NEW_ARRIVALS: FragranceProduct[] = [
  {
    id: 'prod-pure-portions',
    slug: 'pure-portions',
    brand: 'ARRINA',
    name: 'Pure Portions (5ml Atomizer)',
    category: 'Solar Floral Amber',
    gender: 'Unisex',
    concentration: 'Extrait de Parfum',
    startingPrice: 490,
    image: '/src/assets/images/element_pure_portions_bottle_1791911761812.jpg',
    images: [
      '/src/assets/images/element_pure_portions_bottle_1791911761812.jpg',
      '/src/assets/images/element_vanilla_neroli_1791911761343.jpg',
      '/src/assets/images/hero_pure_portions_arrina_1791911761493.jpg',
      '/src/assets/images/studio_social_amber_spray_1791908204588.jpg'
    ],
    additionalImages: [
      '/src/assets/images/element_vanilla_neroli_1791911761343.jpg',
      '/src/assets/images/hero_pure_portions_arrina_1791911761493.jpg',
      '/src/assets/images/studio_social_amber_spray_1791908204588.jpg'
    ],
    shortDescription: 'Weightless neroli blossom, cured Madagascar bourbon vanilla, and radiant golden amber suspended in pure olfactory clarity.',
    description: 'Pure Portions is ARRINA ATELIER\'s hallmark decant edition. Encased in high-clarity Italian glass tubes with precision fine-mist dispersion nozzles, each portion is freshly decanted directly from sealed retail flacons without exposure to heat or oxygen.',
    notes: ['Neroli Blossom', 'Madagascar Bourbon Vanilla', 'Golden Amber Crystals', 'Solar Dew'],
    topNotes: ['Neroli Blossom', 'Solar Dew', 'Bergamot Zest'],
    heartNotes: ['Madagascar Bourbon Vanilla', 'Orchid Petals', 'White Jasmine'],
    baseNotes: ['Golden Amber Crystals', 'Sandalwood', 'Cashmeran'],
    sizes: [
      { size: '5ml', price: 490 },
      { size: '10ml (2x5ml)', price: 920 },
      { size: '15ml Boxed Set', price: 1350 }
    ]
  },
  {
    id: 'prod-rose01',
    slug: 'rose-01',
    brand: 'SWISS ARABIAN',
    name: 'Rose 01',
    category: 'Floral',
    gender: 'Her',
    concentration: 'Eau de Parfum',
    startingPrice: 661,
    image: '/src/assets/images/perfume_rose01_1791908158391.jpg',
    images: [
      '/src/assets/images/perfume_rose01_1791908158391.jpg',
      '/src/assets/images/season_sculptural_roses_1791908202058.jpg',
      '/src/assets/images/campaign_for_her_1791908163547.jpg',
      '/src/assets/images/article_perfume_roses_water_1791908274460.jpg'
    ],
    additionalImages: [
      '/src/assets/images/season_sculptural_roses_1791908202058.jpg',
      '/src/assets/images/campaign_for_her_1791908163547.jpg',
      '/src/assets/images/article_perfume_roses_water_1791908274460.jpg'
    ],
    shortDescription: 'A captivating bouquet of velvet damask roses wrapped in radiant pink peppercorns and cashmeran.',
    description: 'Rose 01 by Swiss Arabian is an opulent tribute to classical floral elegance infused with modern warmth. Opening with sparkling pink pepper, it unfolds into a luscious heart of freshly blooming damask rose and dries down into velvety cashmeran and clean white musk.',
    notes: ['Damask Rose', 'Pink Peppercorn', 'Cashmeran', 'White Musk'],
    topNotes: ['Pink Peppercorn', 'Lychee', 'Bergamot'],
    heartNotes: ['Damask Rose', 'Peony', 'Nutmeg'],
    baseNotes: ['Cashmeran', 'White Musk', 'Cedarwood'],
    sizes: [
      { size: '3ml', price: 661 },
      { size: '5ml', price: 990 },
      { size: '9ml', price: 1650 },
      { size: '15ml', price: 2580 }
    ]
  },
  {
    id: 'prod-vanilla01',
    slug: 'vanilla-01',
    brand: 'SWISS ARABIAN',
    name: 'Vanilla 01',
    category: 'Gourmand',
    gender: 'Unisex',
    concentration: 'Eau de Parfum',
    startingPrice: 661,
    image: '/src/assets/images/perfume_vanilla01_1791908158466.jpg',
    images: [
      '/src/assets/images/perfume_vanilla01_1791908158466.jpg',
      '/src/assets/images/element_vanilla_neroli_1791911761343.jpg',
      '/src/assets/images/studio_social_gold_flacon_1791908204833.jpg'
    ],
    additionalImages: [
      '/src/assets/images/element_vanilla_neroli_1791911761343.jpg',
      '/src/assets/images/studio_social_gold_flacon_1791908204833.jpg'
    ],
    shortDescription: 'Rich, sun-cured vanilla bean infused with golden ambergris and warm brown sugar.',
    description: 'Vanilla 01 is an intoxicating gourmand masterpiece. Deep, resinous Madagascar vanilla pods blend smoothly with salted ambergris and caramelized sugar, leaving an irresistible trail of sensual tonka bean.',
    notes: ['Madagascar Bourbon Vanilla', 'Ambergris', 'Brown Sugar', 'Tonka'],
    topNotes: ['Brown Sugar', 'Almond Blossom'],
    heartNotes: ['Madagascar Bourbon Vanilla', 'Caramel'],
    baseNotes: ['Ambergris', 'Tonka Bean', 'White Musk'],
    sizes: [
      { size: '3ml', price: 661 },
      { size: '5ml', price: 990 },
      { size: '9ml', price: 1650 },
      { size: '15ml', price: 2580 }
    ]
  },
  {
    id: 'prod-genesis-leo',
    slug: 'genesis-leo',
    brand: 'FRENCH AVENUE',
    name: 'Genesis Leo',
    category: 'Woody Oriental',
    gender: 'Him',
    concentration: 'Extrait de Parfum',
    startingPrice: 302,
    image: '/src/assets/images/perfume_genesis_leo_1791908160379.jpg',
    images: [
      '/src/assets/images/perfume_genesis_leo_1791908160379.jpg',
      '/src/assets/images/campaign_for_him_1791908163466.jpg',
      '/src/assets/images/season_dark_forest_1791908203381.jpg'
    ],
    additionalImages: [
      '/src/assets/images/campaign_for_him_1791908163466.jpg',
      '/src/assets/images/season_dark_forest_1791908203381.jpg'
    ],
    shortDescription: 'Regal smoked oud laced with spicy saffron, birch wood, and dark Tuscan leather.',
    description: 'Genesis Leo by French Avenue is a command of strength and presence. Crafted in Extrait de Parfum concentration, it opens with brilliant crimson saffron before unleashing a dark core of smoked birch, royal oud resin, and smooth leather.',
    notes: ['Royal Oud', 'Saffron', 'Smoked Birch', 'Leather'],
    topNotes: ['Saffron', 'Thyme', 'Raspberry'],
    heartNotes: ['Smoked Birch', 'Olibanum', 'Jasmine'],
    baseNotes: ['Royal Oud', 'Tuscan Leather', 'Amberwood'],
    sizes: [
      { size: '3ml', price: 302 },
      { size: '5ml', price: 470 },
      { size: '9ml', price: 790 },
      { size: '15ml', price: 1250 }
    ]
  },
  {
    id: 'prod-venena',
    slug: 'venena',
    brand: 'FRENCH AVENUE',
    name: 'Venena',
    category: 'Spicy Amber',
    gender: 'Him',
    concentration: 'Eau de Parfum',
    startingPrice: 411,
    image: '/src/assets/images/perfume_venena_1791908161282.jpg',
    images: [
      '/src/assets/images/perfume_venena_1791908161282.jpg',
      '/src/assets/images/season_dune_red_sun_1791908201156.jpg',
      '/src/assets/images/studio_social_travertine_1791908203434.jpg'
    ],
    additionalImages: [
      '/src/assets/images/season_dune_red_sun_1791908201156.jpg',
      '/src/assets/images/studio_social_travertine_1791908203434.jpg'
    ],
    shortDescription: 'Dark cardamom and sweet black plum layered over smoldering incense and dark tobacco.',
    description: 'Venena by French Avenue evokes magnetic mystery. Rich black plum notes intersect with green crushed cardamom pods and warm tobacco leaves, settling into a smokey amber base.',
    notes: ['Black Plum', 'Cardamom', 'Dark Tobacco', 'Incense'],
    topNotes: ['Green Cardamom', 'Black Plum'],
    heartNotes: ['Dark Tobacco Leaf', 'Incense Smoke'],
    baseNotes: ['Amber Resins', 'Guaiac Wood', 'Vanilla'],
    sizes: [
      { size: '3ml', price: 411 },
      { size: '5ml', price: 640 },
      { size: '9ml', price: 1080 },
      { size: '15ml', price: 1690 }
    ]
  },
  {
    id: 'prod-asdaaf-raneen',
    slug: 'asdaaf-raneen',
    brand: 'ASDAAF',
    name: 'Raneen',
    category: 'Floral Amber',
    gender: 'Her',
    concentration: 'Eau de Parfum',
    startingPrice: 336,
    image: '/src/assets/images/perfume_asdaaf_raneen_1791908163183.jpg',
    images: [
      '/src/assets/images/perfume_asdaaf_raneen_1791908163183.jpg',
      '/src/assets/images/studio_social_hand_decant_1791908204628.jpg',
      '/src/assets/images/hero_perfume_architectural_1791908158566.jpg'
    ],
    additionalImages: [
      '/src/assets/images/studio_social_hand_decant_1791908204628.jpg',
      '/src/assets/images/hero_perfume_architectural_1791908158566.jpg'
    ],
    shortDescription: 'Sweet orange blossom and buttery praline drizzled with white jasmine nectar.',
    description: 'Raneen by Asdaaf is a joyful, luminous floral amber fragrance. Crisp citrus blossoms lead into creamy praline accords and delicate jasmine blossoms.',
    notes: ['Orange Blossom', 'Praline', 'White Jasmine', 'Sweet Vanilla'],
    topNotes: ['Orange Blossom', 'Mandarin'],
    heartNotes: ['White Jasmine', 'Praline'],
    baseNotes: ['Sweet Vanilla', 'Sandalwood', 'Musk'],
    sizes: [
      { size: '3ml', price: 336 },
      { size: '5ml', price: 520 },
      { size: '9ml', price: 880 },
      { size: '15ml', price: 1390 }
    ]
  }
];

export const BRANDS_LIST = [
  { name: 'HERRERA', isNew: false },
  { name: 'ARMAF', isNew: true },
  { name: 'DOLCE & GABBANA', isNew: false },
  { name: 'LATTAFA', isNew: true },
  { name: 'GIORGIO ARMANI', isNew: false },
  { name: 'CALVIN KLEIN', isNew: true },
  { name: 'CHANEL', isNew: false },
  { name: 'RIFFS', isNew: false },
  { name: 'DAVIDOFF', isNew: false },
  { name: 'CREED', isNew: false },
  { name: 'AHMED', isNew: false }
];

export const REVIEWS_LIST: ReviewItem[] = [
  {
    id: 'rev-1',
    quote: '...and videos. It seemed to be an existing fetched the ...ng more from...',
    content: '...and videos. It seemed to be an existing fetched the original blend without any evaporation or adulteration. Ordering more from here next week.',
    author: 'Tahmidur Rahman',
    rating: 5,
    verified: true
  },
  {
    id: 'rev-2',
    quote: '"Best in business. Absolute class."',
    content: 'Best in business. Absolute class. Packaging was bulletproof, and the 5ml spray atomizers give the exact same fine mist dispersion as a full retail bottle.',
    author: 'Jubayer Islam Bhuiyan',
    rating: 5,
    verified: true
  },
  {
    id: 'rev-3',
    quote: 'Very wide range of products...',
    content: 'Very wide range of products, bottle designs, perfume authenticity, customer service, everything is high quality 💯 Top notch. The customer service is also especially excellent, they are very responsive and also answers and provides your needs/enquiries well. 👌',
    author: 'Faiyaz Masud',
    rating: 5,
    verified: true
  },
  {
    id: 'rev-4',
    quote: 'Great packaging, great decants...',
    content: 'Great packaging, great decants, highly recommend! Even came with protective shrink seals on each glass tube.',
    author: 'Samiul Masuk Dihan',
    rating: 5,
    verified: true
  }
];

export const SOCIAL_CARDS: SocialCard[] = [
  {
    id: 'soc-1',
    handle: '@aromaticone',
    image: '/src/assets/images/studio_social_travertine_1791908203434.jpg',
    likes: 223,
    comments: 2,
    tag: 'REALITY ≠ REVIEWS'
  },
  {
    id: 'soc-2',
    handle: '@aromaticone',
    image: '/src/assets/images/studio_social_hand_decant_1791908204628.jpg',
    likes: 234,
    comments: 1,
    tag: 'AUTHENTIC DECANTS'
  },
  {
    id: 'soc-3',
    handle: '@aromaticone',
    image: '/src/assets/images/studio_social_gold_flacon_1791908204833.jpg',
    likes: 86,
    comments: 8,
    tag: 'AUTHENTIC DECANTS'
  },
  {
    id: 'soc-4',
    handle: '@aromaticone',
    image: '/src/assets/images/studio_social_amber_spray_1791908204588.jpg',
    likes: 85,
    comments: 5,
    tag: 'STUDIO AROMA'
  }
];

export const JOURNAL_ARTICLES: JournalArticle[] = [
  {
    id: 'art-1',
    date: 'FEB 01, 2026',
    publisher: 'AROMATICA ONE',
    title: "Don't Buy Decants From Us Before Reading This!",
    description: 'Read this before you buy your first decant. Especially the part about why we genuinely cannot guarantee longevity, and what factors actually control skin chemistry...',
    image: '/src/assets/images/article_decant_buyers_guide_1791908274237.jpg'
  },
  {
    id: 'art-2',
    date: 'FEB 01, 2026',
    publisher: 'AROMATICA ONE',
    title: 'Why Did You Mix Water With My Decant?',
    description: 'Weak fragrance does not mean fake decant. Here is what is actually going on, and what you can do about maceration, temperature shock, and olfactory fatigue.',
    image: '/src/assets/images/article_perfume_roses_water_1791908274460.jpg'
  },
  {
    id: 'art-3',
    date: 'FEB 01, 2026',
    publisher: 'AROMATICA ONE',
    title: 'Hidden Reality Of Our Pricing!',
    description: 'Our pricing is not just random numbers. Here is the full, unvarnished math behind decant margins, high-pressure glass bottling, and genuine retail procurement.',
    image: '/src/assets/images/article_lilac_pricing_1791908274975.jpg'
  }
];

export const FAQ_ITEMS = [
  {
    id: 'faq-1',
    question: 'What is a decant?',
    answer: 'A decant is a smaller atomizer that contains a portion of perfume from the original bottle. Decanting means transferring perfume from the main bottle into a smaller bottle. It allows you to test luxury scents on skin for several weeks without committing to full retail prices.'
  },
  {
    id: 'faq-2',
    question: 'But I can just test at a perfume shop by sniffing?',
    answer: 'Sniffing perfume on a paper strip in a boutique only reveals the volatile top notes (first 5-10 minutes). A decant lets you experience the true dry-down, skin chemistry, projection, and sillage over an entire day in your natural climate and routines.'
  },
  {
    id: 'faq-3',
    question: 'Are the fragrances 100% Genuine?',
    answer: 'Every milliliter is extracted directly from original brand flacons sourced from authorized European and Middle Eastern distributors. We never dilute, alter, or mix scents with carrier oils.'
  },
  {
    id: 'faq-4',
    question: 'What is the shipping cost?',
    answer: 'Standard door-to-door delivery inside Dhaka is BDT 70, and outside Dhaka nationwide is BDT 130. We offer free shipping on orders above BDT 3,000.'
  },
  {
    id: 'faq-5',
    question: 'How long does shipping take?',
    answer: 'Orders are freshly decanted within 24 hours of confirmation. Delivery within Dhaka takes 1-2 business days, and all other districts take 2-4 business days via verified express couriers.'
  }
];

import React, { useState, useEffect } from 'react';
import { Layout, Save, Sparkles, Plus, Trash2, Edit2, Check, RefreshCw, ArrowUp, ArrowDown, Film } from 'lucide-react';
import { getErrorMessage } from '../services/api';
import { ImageUploader } from './ImageUploader';
import { VideoUploader } from './VideoUploader';
import { VideoShowcaseCard } from '../types';

interface HomepageCMSProps {
  csrfToken: string;
}

export const HomepageCMS: React.FC<HomepageCMSProps> = ({ csrfToken }) => {
  const [activeTab, setActiveTab] = useState<'hero' | 'campaigns' | 'seasons' | 'video' | 'sections' | 'marquee' | 'reviews' | 'faqs' | 'articles'>('hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<Array<{ id: string; name: string; brand: string; image?: string }>>([]);

  // Hero Form
  const [heroForm, setHeroForm] = useState({
    headline: 'LUXURY, BY THE ML',
    tagline: 'Weightless neroli blossom, cured Madagascar bourbon vanilla, and radiant golden amber suspended in pure olfactory clarity. Engineered for pocket elegance.',
    specifier: '5 ML ( 75+ SPRAYS )',
    primary_cta_text: 'ORDER PURE PORTIONS · ৳ 490',
    secondary_cta_text: 'EXPLORE ALL DECANTS',
    image: '/src/assets/images/hero_pure_portions_arrina_1791911761493.jpg'
  });

  // Campaign Banners Form (For Him / For Her)
  const [campaignForm, setCampaignForm] = useState({
    section_title: 'FOR HIM | HER',
    for_him_title: 'For Him',
    for_him_button_text: 'SHOP DECANTS',
    for_him_image: '/src/assets/images/campaign_for_him_1791908163466.jpg',
    for_her_title: 'For Her',
    for_her_button_text: 'SHOP DECANTS',
    for_her_image: '/src/assets/images/campaign_for_her_1791908163547.jpg'
  });

  // Seasons Gallery Form
  const [seasonsHeader, setSeasonsHeader] = useState({
    section_title: 'SEASONS',
    section_subtitle: 'CHOOSE YOURS'
  });

  const [seasonCards, setSeasonCards] = useState<Array<{ id: string; name: string; description: string; image: string; alt?: string }>>([
    {
      id: 'season-autumn',
      name: 'Autumn Bloom',
      description: 'Red sun dunes & smoked woods',
      image: '/src/assets/images/season_dune_red_sun_1791908201156.jpg',
      alt: 'Autumn Dune with Blood Red Sun fragrance campaign'
    },
    {
      id: 'season-winter',
      name: 'Architectural Winter',
      description: 'Concrete geometry & crimson sillage',
      image: '/src/assets/images/season_monochrome_street_1791908200992.jpg',
      alt: 'Monochrome street architecture with crimson ribbon fragrance campaign'
    },
    {
      id: 'season-summer',
      name: 'Midnight Rose',
      description: 'Velvet petals & monochrome pedestal',
      image: '/src/assets/images/season_sculptural_roses_1791908202058.jpg',
      alt: 'Sculptural velvet roses on geometric pedestal campaign'
    },
    {
      id: 'season-spring',
      name: 'Crimson Shadows',
      description: 'Stark birch forest & damp moss',
      image: '/src/assets/images/season_dark_forest_1791908203381.jpg',
      alt: 'Dark birch forest with red branches fragrance campaign'
    }
  ]);

  // Video Product Showcase Section State
  const [showcaseHeader, setShowcaseHeader] = useState({
    headline: 'AURA & SILLAGE IN MOTION',
    tagline: 'Weightless liquid gold suspended in high-pressure glass atomizers. Experience the delicate art of artisanal decanting.',
    badge_text: 'ARRINA CINEMATIC ATELIER',
    is_enabled: true
  });

  const [showcaseCards, setShowcaseCards] = useState<VideoShowcaseCard[]>([]);

  // Dynamic Custom Sections (4 Sections)
  const [customSections, setCustomSections] = useState<Record<string, { title: string; subtitle: string; is_enabled: boolean; product_ids: string[] }>>({
    custom_section_1: {
      title: 'MOST LOVED DECANTS',
      subtitle: 'CURATED BESTSELLERS FOR DISCOVERING YOUR SIGNATURE SCENT',
      is_enabled: true,
      product_ids: ['prod-pure-portions', 'prod-vanilla01', 'prod-rose01']
    },
    custom_section_2: {
      title: 'ORIENTAL & OUD SELECTIONS',
      subtitle: 'DEEP, SMOKY & REFINED RESINS',
      is_enabled: true,
      product_ids: ['prod-genesis-leo', 'prod-venena']
    },
    custom_section_3: {
      title: 'FLORAL & AMBER ESSENCES',
      subtitle: 'RADIANT VELVET PETALS & SOLAR DEW',
      is_enabled: true,
      product_ids: ['prod-asdaaf-raneen', 'prod-rose01']
    },
    custom_section_4: {
      title: 'LIMITED VAULT EDITIONS',
      subtitle: 'EXCLUSIVE BATCH ALLOCATIONS',
      is_enabled: true,
      product_ids: ['prod-vanilla01', 'prod-genesis-leo', 'prod-pure-portions']
    }
  });

  // Marquee
  const [marqueeText, setMarqueeText] = useState('CURATE, JUDGE, REFINE, TEST');

  // FAQs
  const [faqs, setFaqs] = useState<Array<{ id: string; question: string; answer: string }>>([]);
  const [editingFaq, setEditingFaq] = useState<{ id: string; question: string; answer: string } | null>(null);

  // Reviews
  const [reviews, setReviews] = useState<Array<{ id: string; quote: string; content: string; author: string; rating: number }>>([]);
  const [editingReview, setEditingReview] = useState<{ id: string; quote: string; content: string; author: string; rating: number } | null>(null);

  // Articles
  const [articles, setArticles] = useState<Array<{ id: string; title: string; date: string; publisher: string; description: string; image: string }>>([]);
  const [editingArticle, setEditingArticle] = useState<{ id: string; title: string; date: string; publisher: string; description: string; image: string } | null>(null);

  const fetchCMSData = async () => {
    setLoading(true);
    try {
      const [cmsRes, prodRes] = await Promise.all([
        fetch('/api/admin/homepage.php'),
        fetch('/api/admin/products.php')
      ]);

      const data = await cmsRes.json();
      const pData = await prodRes.json();

      if (pData.success && Array.isArray(pData.data)) {
        setAvailableProducts(pData.data.map((p: any) => ({ id: p.id, name: p.name, brand: p.brand, image: p.image })));
      }

      if (data.success && data.data) {
        const payload = data.data;

        // Hero
        const heroSec = payload.sections?.hero;
        if (heroSec && heroSec.content) {
          setHeroForm((prev) => ({ ...prev, ...heroSec.content }));
        }

        // Campaign Banners (For Him | Her)
        const campSec = payload.sections?.campaign_banners;
        if (campSec && campSec.content) {
          setCampaignForm((prev) => ({ ...prev, ...campSec.content }));
        }

        // Seasons Gallery
        const seasonsSec = payload.sections?.seasons_gallery;
        if (seasonsSec && seasonsSec.content) {
          setSeasonsHeader({
            section_title: seasonsSec.title || seasonsSec.content.section_title || 'SEASONS',
            section_subtitle: seasonsSec.subtitle || seasonsSec.content.section_subtitle || 'CHOOSE YOURS'
          });
          if (Array.isArray(seasonsSec.content.cards)) {
            setSeasonCards(seasonsSec.content.cards);
          }
        }

        // Video Showcase
        const vidSec = payload.sections?.video_showcase || payload.sections?.video_hero;
        if (vidSec && vidSec.content) {
          setShowcaseHeader({
            headline: vidSec.title || vidSec.content.headline || 'AURA & SILLAGE IN MOTION',
            tagline: vidSec.subtitle || vidSec.content.tagline || 'Weightless liquid gold suspended in high-pressure glass atomizers.',
            badge_text: vidSec.content.badge_text || 'ARRINA CINEMATIC ATELIER',
            is_enabled: vidSec.is_enabled !== undefined ? Boolean(vidSec.is_enabled) : true
          });

          if (Array.isArray(vidSec.content.cards)) {
            setShowcaseCards(vidSec.content.cards);
          } else if (vidSec.content.video_url) {
            setShowcaseCards([
              {
                id: 'card-1',
                product_id: 'prod-pure-portions',
                title: vidSec.content.headline || 'Pure Portions (5ml)',
                video_url: vidSec.content.video_url,
                thumbnail_url: vidSec.content.poster_image,
                display_order: 1,
                is_enabled: true
              }
            ]);
          }
        }

        // Custom Sections
        const nextCustom: any = { ...customSections };
        ['custom_section_1', 'custom_section_2', 'custom_section_3', 'custom_section_4'].forEach((key) => {
          if (payload.sections?.[key]) {
            const sec = payload.sections[key];
            nextCustom[key] = {
              title: sec.title || nextCustom[key].title,
              subtitle: sec.subtitle || nextCustom[key].subtitle,
              is_enabled: sec.is_enabled !== undefined ? Boolean(sec.is_enabled) : true,
              product_ids: Array.isArray(sec.content?.product_ids) ? sec.content.product_ids : nextCustom[key].product_ids
            };
          }
        });
        setCustomSections(nextCustom);

        // Marquee
        const marqueeSec = payload.sections?.category_marquee;
        if (marqueeSec && marqueeSec.content?.items) {
          setMarqueeText(marqueeSec.content.items.join(', '));
        }

        // FAQs
        if (Array.isArray(payload.faqs)) setFaqs(payload.faqs);

        // Reviews
        if (Array.isArray(payload.reviews)) setReviews(payload.reviews);

        // Articles
        if (Array.isArray(payload.articles)) setArticles(payload.articles);
      }
    } catch (e) {
      console.error('Failed to load CMS data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCMSData();
  }, []);

  const handleSaveVideoShowcase = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formattedCards = showcaseCards.map((card, index) => ({
        ...card,
        display_order: index + 1
      }));

      const res = await fetch('/api/admin/homepage.php', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({
          type: 'section',
          section_key: 'video_showcase',
          title: showcaseHeader.headline || 'AURA & SILLAGE IN MOTION',
          subtitle: showcaseHeader.tagline || 'Weightless liquid gold suspended in high-pressure glass atomizers.',
          content: {
            headline: showcaseHeader.headline,
            tagline: showcaseHeader.tagline,
            badge_text: showcaseHeader.badge_text,
            is_enabled: showcaseHeader.is_enabled,
            cards: formattedCards
          },
          is_enabled: showcaseHeader.is_enabled ? 1 : 0,
          display_order: 3
        })
      });

      const data = await res.json();
      if (data.success) {
        alert('Video Product Showcase saved successfully!');
        fetchCMSData();
      } else {
        alert(getErrorMessage(data?.error || data, 'Failed to save Video section'));
      }
    } catch (e) {
      alert('Error saving Video section');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCard = () => {
    const newCard: VideoShowcaseCard = {
      id: 'card-' + Date.now(),
      product_id: availableProducts[0]?.id || '',
      title: availableProducts[0]?.name || 'New Video Product Showcase',
      video_url: 'https://assets.mixkit.co/videos/preview/mixkit-perfume-bottle-in-a-dark-background-41527-large.mp4',
      thumbnail_url: availableProducts[0]?.image || '/src/assets/images/element_pure_portions_bottle_1791911761493.jpg',
      display_order: showcaseCards.length + 1,
      is_enabled: true
    };
    setShowcaseCards([...showcaseCards, newCard]);
  };

  const handleUpdateCard = (id: string, updates: Partial<VideoShowcaseCard>) => {
    setShowcaseCards((prev) =>
      prev.map((card) => {
        if (card.id !== id) return card;
        const updated = { ...card, ...updates };

        // Auto-fill title & thumbnail if product_id is updated
        if (updates.product_id && updates.product_id !== card.product_id) {
          const matchedProd = availableProducts.find((p) => p.id === updates.product_id);
          if (matchedProd) {
            if (!updated.title || updated.title === card.title) updated.title = matchedProd.name;
            if (!updated.thumbnail_url || updated.thumbnail_url === card.thumbnail_url) {
              updated.thumbnail_url = matchedProd.image || '';
            }
          }
        }
        return updated;
      })
    );
  };

  const handleDeleteCard = (id: string) => {
    if (!confirm('Are you sure you want to delete this showcase video card?')) return;
    setShowcaseCards((prev) => prev.filter((c) => c.id !== id));
  };

  const handleMoveCard = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === showcaseCards.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const next = [...showcaseCards];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;
    setShowcaseCards(next);
  };

  const handleSaveCustomSection = async (secKey: string) => {
    setSaving(true);
    const secData = customSections[secKey];
    try {
      const res = await fetch('/api/admin/homepage.php', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({
          type: 'section',
          section_key: secKey,
          title: secData.title,
          subtitle: secData.subtitle,
          content: {
            is_enabled: secData.is_enabled,
            product_ids: secData.product_ids
          },
          is_enabled: secData.is_enabled ? 1 : 0,
          display_order: 4 + parseInt(secKey.slice(-1) || '1', 10)
        })
      });

      const data = await res.json();
      if (data.success) {
        alert(`Collection "${secData.title}" saved successfully!`);
        fetchCMSData();
      } else {
        alert(getErrorMessage(data?.error || data, 'Failed to save collection section'));
      }
    } catch (e) {
      alert('Error saving collection section');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCampaignBanners = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/homepage.php', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({
          type: 'section',
          section_key: 'campaign_banners',
          title: campaignForm.section_title || 'FOR HIM | HER',
          subtitle: 'GENDER CATEGORY CAMPAIGNS',
          content: campaignForm,
          is_enabled: true,
          display_order: 2.5
        })
      });

      const data = await res.json();
      if (data.success) {
        alert('Campaign Banners (For Him / Her) saved successfully!');
        fetchCMSData();
      } else {
        alert(getErrorMessage(data?.error || data, 'Failed to save Campaign Banners'));
      }
    } catch (e) {
      alert('Error saving Campaign Banners');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSeasonsGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/homepage.php', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({
          type: 'section',
          section_key: 'seasons_gallery',
          title: seasonsHeader.section_title || 'SEASONS',
          subtitle: seasonsHeader.section_subtitle || 'CHOOSE YOURS',
          content: {
            section_title: seasonsHeader.section_title,
            section_subtitle: seasonsHeader.section_subtitle,
            cards: seasonCards
          },
          is_enabled: true,
          display_order: 2.8
        })
      });

      const data = await res.json();
      if (data.success) {
        alert('Seasons Gallery saved successfully!');
        fetchCMSData();
      } else {
        alert(getErrorMessage(data?.error || data, 'Failed to save Seasons Gallery'));
      }
    } catch (e) {
      alert('Error saving Seasons Gallery');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSeasonCard = () => {
    const newCard = {
      id: 'season-' + Date.now(),
      name: 'New Season Edition',
      description: 'Fragrance notes & sensory descriptor',
      image: '/src/assets/images/season_dune_red_sun_1791908201156.jpg',
      alt: 'Seasonal fragrance campaign image'
    };
    setSeasonCards([...seasonCards, newCard]);
  };

  const handleUpdateSeasonCard = (id: string, updates: Partial<{ name: string; description: string; image: string; alt: string }>) => {
    setSeasonCards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, ...updates } : card))
    );
  };

  const handleDeleteSeasonCard = (id: string) => {
    if (!confirm('Are you sure you want to delete this seasonal card?')) return;
    setSeasonCards((prev) => prev.filter((c) => c.id !== id));
  };

  const handleMoveSeasonCard = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === seasonCards.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const next = [...seasonCards];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;
    setSeasonCards(next);
  };

  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/homepage.php', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({
          type: 'section',
          section_key: 'hero',
          title: 'LUXURY, BY THE ML',
          subtitle: 'THE SIGNATURE DECANTS EDITION · ARRINA ATELIER',
          content: heroForm,
          is_enabled: true,
          display_order: 1
        })
      });

      const data = await res.json();
      if (data.success) {
        alert('Hero Section saved successfully!');
        fetchCMSData();
      } else {
        alert(getErrorMessage(data?.error || data, 'Failed to save Hero section'));
      }
    } catch (e) {
      alert('Error saving Hero section');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMarquee = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const items = marqueeText
        .split(',')
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);

      const res = await fetch('/api/admin/homepage.php', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({
          type: 'section',
          section_key: 'category_marquee',
          title: 'Category Marquee',
          content: { items },
          is_enabled: true,
          display_order: 2
        })
      });

      const data = await res.json();
      if (data.success) {
        alert('Category Marquee saved successfully!');
        fetchCMSData();
      } else {
        alert(getErrorMessage(data?.error || data, 'Failed to save Category Marquee'));
      }
    } catch (e) {
      alert('Error saving Category Marquee');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFaq = async (faqObj: { id: string; question: string; answer: string }) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/homepage.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({
          type: 'faq',
          ...faqObj
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('FAQ saved successfully!');
        setEditingFaq(null);
        fetchCMSData();
      } else {
        alert(getErrorMessage(data?.error || data, 'Failed to save FAQ'));
      }
    } catch (e) {
      alert('Error saving FAQ');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      const res = await fetch(`/api/admin/homepage.php?type=faq&id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { 'X-CSRF-Token': csrfToken }
      });
      const data = await res.json();
      if (data.success) {
        fetchCMSData();
      } else {
        alert(getErrorMessage(data?.error || data, 'Failed to delete FAQ'));
      }
    } catch (e) {
      alert('Error deleting FAQ');
    }
  };

  const handleSaveReview = async (revObj: { id: string; quote: string; content: string; author: string; rating: number }) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/homepage.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({
          type: 'review',
          ...revObj
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Review saved successfully!');
        setEditingReview(null);
        fetchCMSData();
      } else {
        alert(getErrorMessage(data?.error || data, 'Failed to save Review'));
      }
    } catch (e) {
      alert('Error saving Review');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm('Are you sure you want to delete this Review?')) return;
    try {
      const res = await fetch(`/api/admin/homepage.php?type=review&id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { 'X-CSRF-Token': csrfToken }
      });
      const data = await res.json();
      if (data.success) {
        fetchCMSData();
      } else {
        alert(getErrorMessage(data?.error || data, 'Failed to delete Review'));
      }
    } catch (e) {
      alert('Error deleting Review');
    }
  };

  const handleSaveArticle = async (artObj: { id: string; title: string; date: string; publisher: string; description: string; image: string }) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/homepage.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({
          type: 'article',
          ...artObj
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Article saved successfully!');
        setEditingArticle(null);
        fetchCMSData();
      } else {
        alert(getErrorMessage(data?.error || data, 'Failed to save Article'));
      }
    } catch (e) {
      alert('Error saving Article');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm('Are you sure you want to delete this Article?')) return;
    try {
      const res = await fetch(`/api/admin/homepage.php?type=article&id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { 'X-CSRF-Token': csrfToken }
      });
      const data = await res.json();
      if (data.success) {
        fetchCMSData();
      } else {
        alert(getErrorMessage(data?.error || data, 'Failed to delete Article'));
      }
    } catch (e) {
      alert('Error deleting Article');
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-[#737373] text-xs flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-[#111111]" />
        <span>Loading live CMS content from database...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header Bar */}
      <div className="bg-white border border-[#EAEAEA] p-6 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-xl text-[#111111] font-normal">Homepage Content Builder</h2>
          <p className="text-xs text-[#737373] mt-0.5">
            Modify live homepage copy, hero imagery, video showcase cards, marquee text, FAQs, and reviews
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#EAEAEA] space-x-2 overflow-x-auto">
        {[
          { id: 'hero', label: 'Hero Banner' },
          { id: 'campaigns', label: 'For Him / Her Banners' },
          { id: 'seasons', label: 'Seasons Gallery' },
          { id: 'video', label: 'Video Showcase Cards' },
          { id: 'sections', label: 'Custom Product Sections' },
          { id: 'marquee', label: 'Marquee Ticker' },
          { id: 'reviews', label: 'Customer Reviews' },
          { id: 'faqs', label: 'FAQs' },
          { id: 'articles', label: 'Journal Articles' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 text-xs uppercase tracking-wider font-medium border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === tab.id
                ? 'border-[#111111] text-[#111111] bg-white/60'
                : 'border-transparent text-[#737373] hover:text-[#111111]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Hero Banner Form */}
      {activeTab === 'hero' && (
        <form onSubmit={handleSaveHero} className="bg-white border border-[#EAEAEA] p-6 space-y-5 text-xs text-[#111111]">
          <div className="flex items-center gap-2 pb-3 border-b border-[#EAEAEA] text-[#111111]">
            <Sparkles className="w-4 h-4" />
            <h3 className="font-serif text-base text-[#111111]">Hero Campaign Banner Settings</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">Main Headline</label>
              <input
                type="text"
                value={heroForm.headline}
                onChange={(e) => setHeroForm({ ...heroForm, headline: e.target.value })}
                className="w-full bg-[#F8F8F8] border border-[#EAEAEA] px-3 py-2 text-xs text-[#111111] focus:border-[#111111]"
              />
            </div>

            <div>
              <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">Volume Specifier Ribbon</label>
              <input
                type="text"
                value={heroForm.specifier}
                onChange={(e) => setHeroForm({ ...heroForm, specifier: e.target.value })}
                className="w-full bg-[#F8F8F8] border border-[#EAEAEA] px-3 py-2 text-xs text-[#111111] focus:border-[#111111]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">Editorial Tagline / Story</label>
            <textarea
              value={heroForm.tagline}
              onChange={(e) => setHeroForm({ ...heroForm, tagline: e.target.value })}
              rows={3}
              className="w-full bg-[#F8F8F8] border border-[#EAEAEA] px-3 py-2 text-xs text-[#111111] focus:border-[#111111]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">Primary CTA Button Label</label>
              <input
                type="text"
                value={heroForm.primary_cta_text}
                onChange={(e) => setHeroForm({ ...heroForm, primary_cta_text: e.target.value })}
                className="w-full bg-[#F8F8F8] border border-[#EAEAEA] px-3 py-2 text-xs text-[#111111] focus:border-[#111111]"
              />
            </div>

            <div>
              <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">Secondary CTA Button Label</label>
              <input
                type="text"
                value={heroForm.secondary_cta_text}
                onChange={(e) => setHeroForm({ ...heroForm, secondary_cta_text: e.target.value })}
                className="w-full bg-[#F8F8F8] border border-[#EAEAEA] px-3 py-2 text-xs text-[#111111] focus:border-[#111111]"
              />
            </div>
          </div>

          <ImageUploader
            label="Hero Backdrop Image"
            value={heroForm.image}
            onChange={(url) => setHeroForm({ ...heroForm, image: url })}
            csrfToken={csrfToken}
          />

          <div className="pt-4 border-t border-[#EAEAEA] flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#111111] text-white hover:bg-amber-300 hover:text-[#111111] text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Hero Section'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab: Campaign Banners (For Him / For Her) */}
      {activeTab === 'campaigns' && (
        <form onSubmit={handleSaveCampaignBanners} className="bg-white border border-[#EAEAEA] p-6 space-y-6 text-xs text-[#111111]">
          <div className="flex items-center gap-2 pb-3 border-b border-[#EAEAEA] text-[#111111]">
            <Sparkles className="w-4 h-4" />
            <h3 className="font-serif text-base text-[#111111]">FOR HIM | HER Campaign Banners</h3>
          </div>

          <div>
            <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">Section Title</label>
            <input
              type="text"
              value={campaignForm.section_title}
              onChange={(e) => setCampaignForm({ ...campaignForm, section_title: e.target.value })}
              className="w-full bg-[#F8F8F8] border border-[#EAEAEA] px-3 py-2 text-xs text-[#111111] focus:border-[#111111] max-w-md"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* For Him Box */}
            <div className="bg-[#F8F8F8] border border-[#EAEAEA] p-5 space-y-4">
              <h4 className="font-serif text-sm text-[#111111] font-medium pb-2 border-b border-[#EAEAEA]">
                For Him Banner
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">Title</label>
                  <input
                    type="text"
                    value={campaignForm.for_him_title}
                    onChange={(e) => setCampaignForm({ ...campaignForm, for_him_title: e.target.value })}
                    className="w-full bg-white border border-[#EAEAEA] px-3 py-1.5 text-xs text-[#111111]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">Button Label</label>
                  <input
                    type="text"
                    value={campaignForm.for_him_button_text}
                    onChange={(e) => setCampaignForm({ ...campaignForm, for_him_button_text: e.target.value })}
                    className="w-full bg-white border border-[#EAEAEA] px-3 py-1.5 text-xs text-[#111111]"
                  />
                </div>
              </div>

              <ImageUploader
                label="For Him Campaign Image"
                value={campaignForm.for_him_image}
                onChange={(url) => setCampaignForm({ ...campaignForm, for_him_image: url })}
                csrfToken={csrfToken}
              />
            </div>

            {/* For Her Box */}
            <div className="bg-[#F8F8F8] border border-[#EAEAEA] p-5 space-y-4">
              <h4 className="font-serif text-sm text-[#111111] font-medium pb-2 border-b border-[#EAEAEA]">
                For Her Banner
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">Title</label>
                  <input
                    type="text"
                    value={campaignForm.for_her_title}
                    onChange={(e) => setCampaignForm({ ...campaignForm, for_her_title: e.target.value })}
                    className="w-full bg-white border border-[#EAEAEA] px-3 py-1.5 text-xs text-[#111111]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">Button Label</label>
                  <input
                    type="text"
                    value={campaignForm.for_her_button_text}
                    onChange={(e) => setCampaignForm({ ...campaignForm, for_her_button_text: e.target.value })}
                    className="w-full bg-white border border-[#EAEAEA] px-3 py-1.5 text-xs text-[#111111]"
                  />
                </div>
              </div>

              <ImageUploader
                label="For Her Campaign Image"
                value={campaignForm.for_her_image}
                onChange={(url) => setCampaignForm({ ...campaignForm, for_her_image: url })}
                csrfToken={csrfToken}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#EAEAEA] flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#111111] text-white hover:bg-amber-300 hover:text-[#111111] text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save For Him / Her Banners'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab: Seasons Gallery */}
      {activeTab === 'seasons' && (
        <form onSubmit={handleSaveSeasonsGallery} className="bg-white border border-[#EAEAEA] p-6 space-y-6 text-xs text-[#111111]">
          <div className="flex items-center gap-2 pb-3 border-b border-[#EAEAEA] text-[#111111]">
            <Sparkles className="w-4 h-4" />
            <h3 className="font-serif text-base text-[#111111]">Seasons Campaign Gallery</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F8F8F8] p-4 border border-[#EAEAEA]">
            <div>
              <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">Section Title</label>
              <input
                type="text"
                value={seasonsHeader.section_title}
                onChange={(e) => setSeasonsHeader({ ...seasonsHeader, section_title: e.target.value })}
                className="w-full bg-white border border-[#EAEAEA] px-3 py-1.5 text-xs text-[#111111] focus:border-[#111111]"
              />
            </div>

            <div>
              <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">Section Subtitle</label>
              <input
                type="text"
                value={seasonsHeader.section_subtitle}
                onChange={(e) => setSeasonsHeader({ ...seasonsHeader, section_subtitle: e.target.value })}
                className="w-full bg-white border border-[#EAEAEA] px-3 py-1.5 text-xs text-[#111111] focus:border-[#111111]"
              />
            </div>
          </div>

          {/* Season Cards Manager */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-2">
              <h4 className="font-serif text-sm text-[#111111] font-normal">
                Seasonal Cards ({seasonCards.length})
              </h4>
              <button
                type="button"
                onClick={handleAddSeasonCard}
                className="px-3.5 py-1.5 bg-[#111111] text-white hover:bg-amber-300 hover:text-[#111111] text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Season Card</span>
              </button>
            </div>

            {seasonCards.length === 0 ? (
              <div className="p-8 text-center text-[#737373] border border-dashed border-[#EAEAEA]">
                No season cards configured. Click "Add Season Card" to create one.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {seasonCards.map((card, idx) => (
                  <div
                    key={card.id}
                    className="bg-[#F8F8F8] border border-[#EAEAEA] p-4 space-y-4 relative transition-colors hover:border-[#EAEAEA]"
                  >
                    <div className="flex items-center justify-between border-b border-[#EAEAEA]/80 pb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-[#111111]">
                          Season #{idx + 1}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveSeasonCard(idx, 'up')}
                            className="p-1 bg-white hover:bg-[#F4F4F4] text-[#111111] disabled:opacity-30 rounded cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === seasonCards.length - 1}
                            onClick={() => handleMoveSeasonCard(idx, 'down')}
                            className="p-1 bg-white hover:bg-[#F4F4F4] text-[#111111] disabled:opacity-30 rounded cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteSeasonCard(card.id)}
                        className="p-1 text-[#737373] hover:text-red-400 transition-colors"
                        title="Delete Season Card"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">Card Name</label>
                        <input
                          type="text"
                          value={card.name}
                          onChange={(e) => handleUpdateSeasonCard(card.id, { name: e.target.value })}
                          className="w-full bg-white border border-[#EAEAEA] px-3 py-1.5 text-xs text-[#111111] focus:border-[#111111]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">Description / Scent Notes</label>
                        <input
                          type="text"
                          value={card.description}
                          onChange={(e) => handleUpdateSeasonCard(card.id, { description: e.target.value })}
                          className="w-full bg-white border border-[#EAEAEA] px-3 py-1.5 text-xs text-[#111111] focus:border-[#111111]"
                        />
                      </div>

                      <ImageUploader
                        label="Seasonal Image"
                        value={card.image}
                        onChange={(url) => handleUpdateSeasonCard(card.id, { image: url })}
                        csrfToken={csrfToken}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#EAEAEA] flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#111111] text-white hover:bg-amber-300 hover:text-[#111111] text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Seasons Gallery'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Premium Video Showcase Manager */}
      {activeTab === 'video' && (
        <form onSubmit={handleSaveVideoShowcase} className="bg-white border border-[#EAEAEA] p-6 space-y-6 text-xs text-[#111111]">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAEAEA]">
            <div className="flex items-center gap-2 text-[#111111]">
              <Film className="w-4 h-4" />
              <h3 className="font-serif text-base text-[#111111]">Premium Video Product Showcase Settings</h3>
            </div>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <span className="text-[#737373] text-xs">Entire Section Active</span>
              <input
                type="checkbox"
                checked={showcaseHeader.is_enabled}
                onChange={(e) => setShowcaseHeader({ ...showcaseHeader, is_enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#111111] text-white relative"></div>
            </label>
          </div>

          {/* Section Header Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#F8F8F8] p-4 border border-[#EAEAEA]">
            <div>
              <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">Badge / Ribbon Text</label>
              <input
                type="text"
                value={showcaseHeader.badge_text}
                onChange={(e) => setShowcaseHeader({ ...showcaseHeader, badge_text: e.target.value })}
                className="w-full bg-white border border-[#EAEAEA] px-3 py-1.5 text-xs text-[#111111] focus:border-[#111111]"
              />
            </div>
            <div>
              <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">Section Headline</label>
              <input
                type="text"
                value={showcaseHeader.headline}
                onChange={(e) => setShowcaseHeader({ ...showcaseHeader, headline: e.target.value })}
                className="w-full bg-white border border-[#EAEAEA] px-3 py-1.5 text-xs text-[#111111] focus:border-[#111111]"
              />
            </div>
            <div>
              <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">Tagline Narrative</label>
              <input
                type="text"
                value={showcaseHeader.tagline}
                onChange={(e) => setShowcaseHeader({ ...showcaseHeader, tagline: e.target.value })}
                className="w-full bg-white border border-[#EAEAEA] px-3 py-1.5 text-xs text-[#111111] focus:border-[#111111]"
              />
            </div>
          </div>

          {/* Cards List Manager */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-2">
              <h4 className="font-serif text-sm text-[#111111] font-normal">
                Showcase Video Cards ({showcaseCards.length})
              </h4>
              <button
                type="button"
                onClick={handleAddCard}
                className="px-3.5 py-1.5 bg-[#111111] text-white hover:bg-amber-300 hover:text-[#111111] text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Video Card</span>
              </button>
            </div>

            {showcaseCards.length === 0 ? (
              <div className="p-8 text-center text-[#737373] border border-dashed border-[#EAEAEA]">
                No video cards in showcase. Click "Add Video Card" to start.
              </div>
            ) : (
              <div className="space-y-4">
                {showcaseCards.map((card, idx) => (
                  <div
                    key={card.id}
                    className="bg-[#F8F8F8] border border-[#EAEAEA] p-4 space-y-4 relative transition-colors hover:border-[#EAEAEA]"
                  >
                    {/* Top Bar for Card */}
                    <div className="flex items-center justify-between border-b border-[#EAEAEA]/80 pb-2.5">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-[#111111]">
                          Card #{idx + 1}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveCard(idx, 'up')}
                            className="p-1 bg-white hover:bg-[#F4F4F4] text-[#111111] disabled:opacity-30 rounded cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === showcaseCards.length - 1}
                            onClick={() => handleMoveCard(idx, 'down')}
                            className="p-1 bg-white hover:bg-[#F4F4F4] text-[#111111] disabled:opacity-30 rounded cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <span className="text-[#737373] text-[10px]">Enabled</span>
                          <input
                            type="checkbox"
                            checked={card.is_enabled !== false}
                            onChange={(e) => handleUpdateCard(card.id, { is_enabled: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-7 h-4 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#111111] text-white relative"></div>
                        </label>

                        <button
                          type="button"
                          onClick={() => handleDeleteCard(card.id)}
                          className="p-1 text-[#737373] hover:text-red-400 transition-colors"
                          title="Delete Card"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Card Content Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Product Selector & Display Title */}
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">
                            Associated Product (Optional)
                          </label>
                          <select
                            value={card.product_id || ''}
                            onChange={(e) => handleUpdateCard(card.id, { product_id: e.target.value })}
                            className="w-full bg-white border border-[#EAEAEA] px-3 py-2 text-xs text-[#111111] focus:border-[#111111]"
                          >
                            <option value="">-- Custom (No direct product link) --</option>
                            {availableProducts.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.brand} - {p.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">
                            Card Title (Displayed on bottom panel)
                          </label>
                          <input
                            type="text"
                            value={card.title}
                            onChange={(e) => handleUpdateCard(card.id, { title: e.target.value })}
                            placeholder="Product name or headline"
                            className="w-full bg-white border border-[#EAEAEA] px-3 py-2 text-xs text-[#111111] focus:border-[#111111]"
                          />
                        </div>
                      </div>

                      {/* Thumbnail Image Uploader */}
                      <div>
                        <ImageUploader
                          label="Product Thumbnail Image"
                          value={card.thumbnail_url || ''}
                          onChange={(url) => handleUpdateCard(card.id, { thumbnail_url: url })}
                          csrfToken={csrfToken}
                          placeholder="Select thumbnail or upload image"
                        />
                      </div>
                    </div>

                    {/* Video File Uploader */}
                    <div>
                      <VideoUploader
                        label="Product Video File (.mp4 / .webm)"
                        value={card.video_url}
                        onChange={(url) => handleUpdateCard(card.id, { video_url: url })}
                        csrfToken={csrfToken}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#EAEAEA] flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#111111] text-white hover:bg-amber-300 hover:text-[#111111] text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Video Showcase Changes'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Custom Product Sections Form */}
      {activeTab === 'sections' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#EAEAEA] p-4">
            <h3 className="font-serif text-base text-[#111111]">Custom Dynamic Homepage Sections</h3>
            <p className="text-xs text-[#737373] mt-1">
              Create and customize 3–4 dynamic product collections on your storefront. Rename section titles and select assigned products.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {['custom_section_1', 'custom_section_2', 'custom_section_3', 'custom_section_4'].map((secKey, idx) => {
              const sec = customSections[secKey] || {
                title: `Collection Section ${idx + 1}`,
                subtitle: 'Curated selection',
                is_enabled: true,
                product_ids: []
              };

              return (
                <div key={secKey} className="bg-white border border-[#EAEAEA] p-5 space-y-4 text-xs text-[#111111]">
                  <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-2">
                    <span className="font-mono text-[11px] font-bold text-[#111111] uppercase">
                      Section #{idx + 1} ({secKey})
                    </span>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <span className="text-[#737373] text-[10px]">Active</span>
                      <input
                        type="checkbox"
                        checked={sec.is_enabled}
                        onChange={(e) => {
                          setCustomSections({
                            ...customSections,
                            [secKey]: { ...sec, is_enabled: e.target.checked }
                          });
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-7 h-4 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#111111] text-white relative"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">Section Title</label>
                    <input
                      type="text"
                      value={sec.title}
                      onChange={(e) => {
                        setCustomSections({
                          ...customSections,
                          [secKey]: { ...sec, title: e.target.value }
                        });
                      }}
                      className="w-full bg-[#F8F8F8] border border-[#EAEAEA] px-3 py-1.5 text-xs text-[#111111] focus:border-[#111111]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">Subtitle / Descriptor</label>
                    <input
                      type="text"
                      value={sec.subtitle}
                      onChange={(e) => {
                        setCustomSections({
                          ...customSections,
                          [secKey]: { ...sec, subtitle: e.target.value }
                        });
                      }}
                      className="w-full bg-[#F8F8F8] border border-[#EAEAEA] px-3 py-1.5 text-xs text-[#111111] focus:border-[#111111]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">
                      Assigned Products ({sec.product_ids.length} selected)
                    </label>
                    <div className="max-h-36 overflow-y-auto bg-[#F8F8F8] border border-[#EAEAEA] p-2 space-y-1">
                      {availableProducts.map((p) => {
                        const isSelected = sec.product_ids.includes(p.id);
                        return (
                          <label
                            key={p.id}
                            className={`flex items-center justify-between p-1.5 text-[11px] rounded cursor-pointer transition-colors ${
                              isSelected ? 'bg-[#111111] text-white' : 'text-[#737373] hover:bg-[#F4F4F4]'
                            }`}
                          >
                            <span>
                              <strong className="text-[#111111] font-normal">{p.brand}</strong> — {p.name}
                            </span>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                const nextIds = e.target.checked
                                  ? [...sec.product_ids, p.id]
                                  : sec.product_ids.filter((id) => id !== p.id);
                                setCustomSections({
                                  ...customSections,
                                  [secKey]: { ...sec, product_ids: nextIds }
                                });
                              }}
                              className="accent-amber-400 cursor-pointer"
                            />
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#EAEAEA] flex justify-end">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => handleSaveCustomSection(secKey)}
                      className="px-4 py-1.5 bg-[#111111] text-white hover:bg-amber-300 hover:text-[#111111] text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Section #{idx + 1}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Marquee Form */}
      {activeTab === 'marquee' && (
        <form onSubmit={handleSaveMarquee} className="bg-white border border-[#EAEAEA] p-6 space-y-5 text-xs text-[#111111]">
          <div className="flex items-center gap-2 pb-3 border-b border-[#EAEAEA] text-[#111111]">
            <Layout className="w-4 h-4" />
            <h3 className="font-serif text-base text-[#111111]">Category Marquee Ticker Settings</h3>
          </div>

          <div>
            <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">
              Infinite Marquee Words / Ticker Items (comma-separated)
            </label>
            <input
              type="text"
              value={marqueeText}
              onChange={(e) => setMarqueeText(e.target.value)}
              placeholder="CURATE, JUDGE, REFINE, TEST"
              className="w-full bg-[#F8F8F8] border border-[#EAEAEA] px-3 py-2 text-xs text-[#111111] focus:border-[#111111] font-mono"
            />
            <p className="text-[10px] text-[#737373] mt-1">
              Example: CURATE, JUDGE, REFINE, TEST, LUXURY DECANTS
            </p>
          </div>

          <div className="pt-4 border-t border-[#EAEAEA] flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#111111] text-white hover:bg-amber-300 hover:text-[#111111] text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Marquee Ticker'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 5: Reviews Manager */}
      {activeTab === 'reviews' && (
        <div className="bg-white border border-[#EAEAEA] p-6 space-y-6 text-xs text-[#111111]">
          <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-3">
            <h3 className="font-serif text-base text-[#111111]">Customer Reviews ({reviews.length})</h3>
            <button
              onClick={() =>
                setEditingReview({
                  id: 'rev-' + Date.now(),
                  quote: 'Awesome fragrance!',
                  content: '100% authentic decant and fast shipping in Dhaka!',
                  author: 'New Customer',
                  rating: 5
                })
              }
              className="px-3 py-1.5 bg-[#111111] text-white hover:bg-amber-300 hover:text-[#111111] text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Review</span>
            </button>
          </div>

          {editingReview && (
            <div className="bg-[#F8F8F8] border border-[#111111]/50 p-4 space-y-3 rounded-xs">
              <h4 className="font-semibold text-[#111111] uppercase text-[10px]">
                {reviews.some((r) => r.id === editingReview.id) ? 'Edit Review' : 'Create New Review'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-[#737373] uppercase mb-1">Author Name</label>
                  <input
                    type="text"
                    value={editingReview.author}
                    onChange={(e) => setEditingReview({ ...editingReview, author: e.target.value })}
                    className="w-full bg-white border border-[#EAEAEA] px-3 py-1.5 text-xs text-[#111111]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#737373] uppercase mb-1">Rating (1-5 Stars)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={editingReview.rating}
                    onChange={(e) => setEditingReview({ ...editingReview, rating: Number(e.target.value) })}
                    className="w-full bg-white border border-[#EAEAEA] px-3 py-1.5 text-xs text-[#111111]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-[#737373] uppercase mb-1">Quote Headline</label>
                <input
                  type="text"
                  value={editingReview.quote}
                  onChange={(e) => setEditingReview({ ...editingReview, quote: e.target.value })}
                  className="w-full bg-white border border-[#EAEAEA] px-3 py-1.5 text-xs text-[#111111]"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[#737373] uppercase mb-1">Full Review Body Text</label>
                <textarea
                  value={editingReview.content}
                  onChange={(e) => setEditingReview({ ...editingReview, content: e.target.value })}
                  rows={3}
                  className="w-full bg-white border border-[#EAEAEA] px-3 py-1.5 text-xs text-[#111111]"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setEditingReview(null)}
                  className="px-3 py-1 bg-[#F4F4F4] text-[#111111] text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveReview(editingReview)}
                  className="px-4 py-1 bg-[#111111] text-white font-semibold text-xs"
                >
                  Save Review
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="bg-[#F8F8F8] border border-[#EAEAEA] p-4 space-y-2 relative group">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#111111] text-xs">{rev.author}</span>
                  <span className="text-[#111111] text-xs">{'★'.repeat(rev.rating)}</span>
                </div>
                <p className="text-[#111111] font-serif italic text-xs">"{rev.quote}"</p>
                <p className="text-[#737373] text-[11px] leading-relaxed">{rev.content}</p>
                <div className="pt-2 border-t border-[#EAEAEA] flex justify-end gap-2">
                  <button
                    onClick={() => setEditingReview(rev)}
                    className="p-1 text-[#737373] hover:text-[#111111]"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteReview(rev.id)}
                    className="p-1 text-[#737373] hover:text-red-400"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: FAQs Manager */}
      {activeTab === 'faqs' && (
        <div className="bg-white border border-[#EAEAEA] p-6 space-y-6 text-xs text-[#111111]">
          <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-3">
            <h3 className="font-serif text-base text-[#111111]">Frequently Asked Questions ({faqs.length})</h3>
            <button
              onClick={() =>
                setEditingFaq({
                  id: 'faq-' + Date.now(),
                  question: 'New Question Title?',
                  answer: 'Detailed answer response explaining order or decant policies.'
                })
              }
              className="px-3 py-1.5 bg-[#111111] text-white hover:bg-amber-300 hover:text-[#111111] text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New FAQ</span>
            </button>
          </div>

          {editingFaq && (
            <div className="bg-[#F8F8F8] border border-[#111111]/50 p-4 space-y-3 rounded-xs">
              <h4 className="font-semibold text-[#111111] uppercase text-[10px]">
                {faqs.some((f) => f.id === editingFaq.id) ? 'Edit FAQ' : 'Create New FAQ'}
              </h4>
              <div>
                <label className="block text-[10px] text-[#737373] uppercase mb-1">Question Title</label>
                <input
                  type="text"
                  value={editingFaq.question}
                  onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                  className="w-full bg-white border border-[#EAEAEA] px-3 py-1.5 text-xs text-[#111111]"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[#737373] uppercase mb-1">Detailed Answer Text</label>
                <textarea
                  value={editingFaq.answer}
                  onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                  rows={3}
                  className="w-full bg-white border border-[#EAEAEA] px-3 py-1.5 text-xs text-[#111111]"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setEditingFaq(null)}
                  className="px-3 py-1 bg-[#F4F4F4] text-[#111111] text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveFaq(editingFaq)}
                  className="px-4 py-1 bg-[#111111] text-white font-semibold text-xs"
                >
                  Save FAQ
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-[#F8F8F8] border border-[#EAEAEA] p-4 flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <p className="font-semibold text-[#111111] text-xs">Q: {faq.question}</p>
                  <p className="text-[#737373] text-[11px]">A: {faq.answer}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setEditingFaq(faq)}
                    className="p-1 text-[#737373] hover:text-[#111111]"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteFaq(faq.id)}
                    className="p-1 text-[#737373] hover:text-red-400"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 7: Articles Manager */}
      {activeTab === 'articles' && (
        <div className="bg-white border border-[#EAEAEA] p-6 space-y-6 text-xs text-[#111111]">
          <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-3">
            <h3 className="font-serif text-base text-[#111111]">Journal / Editorial Articles ({articles.length})</h3>
            <button
              onClick={() =>
                setEditingArticle({
                  id: 'art-' + Date.now(),
                  title: 'New Article Headline',
                  date: 'FEB 20, 2026',
                  publisher: 'AROMATICA ONE',
                  description: 'Short introduction or preview snippet of the editorial fragrance guide.',
                  image: '/src/assets/images/article_decant_buyers_guide_1791908274237.jpg'
                })
              }
              className="px-3 py-1.5 bg-[#111111] text-white hover:bg-amber-300 hover:text-[#111111] text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Article</span>
            </button>
          </div>

          {editingArticle && (
            <div className="bg-[#F8F8F8] border border-[#111111]/50 p-4 space-y-3 rounded-xs">
              <h4 className="font-semibold text-[#111111] uppercase text-[10px]">
                {articles.some((a) => a.id === editingArticle.id) ? 'Edit Article' : 'Create New Article'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] text-[#737373] uppercase mb-1">Article Title</label>
                  <input
                    type="text"
                    value={editingArticle.title}
                    onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                    className="w-full bg-white border border-[#EAEAEA] px-3 py-1.5 text-xs text-[#111111]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#737373] uppercase mb-1">Date String</label>
                  <input
                    type="text"
                    value={editingArticle.date}
                    onChange={(e) => setEditingArticle({ ...editingArticle, date: e.target.value })}
                    className="w-full bg-white border border-[#EAEAEA] px-3 py-1.5 text-xs text-[#111111]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#737373] uppercase mb-1">Publisher</label>
                  <input
                    type="text"
                    value={editingArticle.publisher}
                    onChange={(e) => setEditingArticle({ ...editingArticle, publisher: e.target.value })}
                    className="w-full bg-white border border-[#EAEAEA] px-3 py-1.5 text-xs text-[#111111]"
                  />
                </div>
              </div>
              <ImageUploader
                label="Cover Image"
                value={editingArticle.image}
                onChange={(url) => setEditingArticle({ ...editingArticle, image: url })}
                csrfToken={csrfToken}
              />
              <div>
                <label className="block text-[10px] text-[#737373] uppercase mb-1">Description / Excerpt Snippet</label>
                <textarea
                  value={editingArticle.description}
                  onChange={(e) => setEditingArticle({ ...editingArticle, description: e.target.value })}
                  rows={3}
                  className="w-full bg-white border border-[#EAEAEA] px-3 py-1.5 text-xs text-[#111111]"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setEditingArticle(null)}
                  className="px-3 py-1 bg-[#F4F4F4] text-[#111111] text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveArticle(editingArticle)}
                  className="px-4 py-1 bg-[#111111] text-white font-semibold text-xs"
                >
                  Save Article
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {articles.map((art) => (
              <div key={art.id} className="bg-[#F8F8F8] border border-[#EAEAEA] p-4 space-y-2 flex flex-col justify-between">
                <div>
                  <img src={art.image} alt={art.title} className="w-full aspect-[4/3] object-cover mb-2" />
                  <span className="text-[10px] text-[#737373] uppercase font-mono">{art.date} · {art.publisher}</span>
                  <h4 className="font-serif text-sm font-semibold text-[#111111] mt-1">{art.title}</h4>
                  <p className="text-[#737373] text-[11px] mt-1 line-clamp-3">{art.description}</p>
                </div>
                <div className="pt-2 border-t border-[#EAEAEA] flex justify-end gap-2">
                  <button
                    onClick={() => setEditingArticle(art)}
                    className="p-1 text-[#737373] hover:text-[#111111]"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteArticle(art.id)}
                    className="p-1 text-[#737373] hover:text-red-400"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

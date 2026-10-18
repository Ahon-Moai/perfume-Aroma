import React, { useState, useEffect } from 'react';
import { Layout, Save, Sparkles, Plus, Trash2, Edit2, Check, RefreshCw } from 'lucide-react';
import { getErrorMessage } from '../services/api';
import { ImageUploader } from './ImageUploader';

interface HomepageCMSProps {
  csrfToken: string;
}

export const HomepageCMS: React.FC<HomepageCMSProps> = ({ csrfToken }) => {
  const [activeTab, setActiveTab] = useState<'hero' | 'video' | 'sections' | 'marquee' | 'reviews' | 'faqs' | 'articles'>('hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<Array<{ id: string; name: string; brand: string }>>([]);

  // Hero Form
  const [heroForm, setHeroForm] = useState({
    headline: 'LUXURY, BY THE ML',
    tagline: 'Weightless neroli blossom, cured Madagascar bourbon vanilla, and radiant golden amber suspended in pure olfactory clarity. Engineered for pocket elegance.',
    specifier: '5 ML ( 75+ SPRAYS )',
    primary_cta_text: 'ORDER PURE PORTIONS · ৳ 490',
    secondary_cta_text: 'EXPLORE ALL DECANTS',
    image: '/src/assets/images/hero_pure_portions_arrina_1791911761493.jpg'
  });

  // Video Section Form
  const [videoForm, setVideoForm] = useState({
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-perfume-bottle-in-a-dark-background-41527-large.mp4',
    poster_image: '/src/assets/images/hero_pure_portions_arrina_1791911761493.jpg',
    headline: 'ELEGANCE REFRACTED IN MOTION',
    tagline: 'Experience the delicate liquid craftsmanship of pure decanting, captured in ultra-high precision visual art.',
    cta_text: 'DISCOVER SIGNATURE COLLECTION',
    is_enabled: true
  });

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
        setAvailableProducts(pData.data.map((p: any) => ({ id: p.id, name: p.name, brand: p.brand })));
      }

      if (data.success && data.data) {
        const payload = data.data;

        // Hero
        const heroSec = payload.sections?.hero;
        if (heroSec && heroSec.content) {
          setHeroForm((prev) => ({ ...prev, ...heroSec.content }));
        }

        // Video
        const vidSec = payload.sections?.video_hero;
        if (vidSec && vidSec.content) {
          setVideoForm((prev) => ({
            ...prev,
            ...vidSec.content,
            is_enabled: vidSec.is_enabled !== undefined ? Boolean(vidSec.is_enabled) : true
          }));
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

  const handleSaveVideo = async (e: React.FormEvent) => {
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
          section_key: 'video_hero',
          title: videoForm.headline || 'AURA & SILLAGE IN MOTION',
          subtitle: videoForm.tagline || 'VISUAL OLFACTORY STORY',
          content: videoForm,
          is_enabled: videoForm.is_enabled ? 1 : 0,
          display_order: 3
        })
      });

      const data = await res.json();
      if (data.success) {
        alert('Video Section saved successfully!');
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
      <div className="p-8 text-center text-zinc-400 text-xs flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
        <span>Loading live CMS content from database...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header Bar */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-xl text-white font-normal">Homepage Content Builder</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Modify live homepage copy, hero imagery, marquee text, FAQs, reviews, and editorial diary
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 space-x-2 overflow-x-auto">
        {[
          { id: 'hero', label: 'Hero Banner' },
          { id: 'video', label: 'Homepage Video' },
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
                ? 'border-amber-400 text-amber-300 bg-zinc-900/60'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Hero Banner Form */}
      {activeTab === 'hero' && (
        <form onSubmit={handleSaveHero} className="bg-zinc-900 border border-zinc-800 p-6 space-y-5 text-xs text-zinc-300">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-800 text-amber-300">
            <Sparkles className="w-4 h-4" />
            <h3 className="font-serif text-base text-white">Hero Campaign Banner Settings</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] tracking-widest text-zinc-400 uppercase mb-1">Main Headline</label>
              <input
                type="text"
                value={heroForm.headline}
                onChange={(e) => setHeroForm({ ...heroForm, headline: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-[10px] tracking-widest text-zinc-400 uppercase mb-1">Volume Specifier Ribbon</label>
              <input
                type="text"
                value={heroForm.specifier}
                onChange={(e) => setHeroForm({ ...heroForm, specifier: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] tracking-widest text-zinc-400 uppercase mb-1">Editorial Tagline / Story</label>
            <textarea
              value={heroForm.tagline}
              onChange={(e) => setHeroForm({ ...heroForm, tagline: e.target.value })}
              rows={3}
              className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] tracking-widest text-zinc-400 uppercase mb-1">Primary CTA Button Label</label>
              <input
                type="text"
                value={heroForm.primary_cta_text}
                onChange={(e) => setHeroForm({ ...heroForm, primary_cta_text: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-[10px] tracking-widest text-zinc-400 uppercase mb-1">Secondary CTA Button Label</label>
              <input
                type="text"
                value={heroForm.secondary_cta_text}
                onChange={(e) => setHeroForm({ ...heroForm, secondary_cta_text: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white focus:border-amber-400"
              />
            </div>
          </div>

          <ImageUploader
            label="Hero Backdrop Image"
            value={heroForm.image}
            onChange={(url) => setHeroForm({ ...heroForm, image: url })}
            csrfToken={csrfToken}
          />

          <div className="pt-4 border-t border-zinc-800 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-black text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Hero Section'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Video Section Form */}
      {activeTab === 'video' && (
        <form onSubmit={handleSaveVideo} className="bg-zinc-900 border border-zinc-800 p-6 space-y-5 text-xs text-zinc-300">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2 text-amber-300">
              <Sparkles className="w-4 h-4" />
              <h3 className="font-serif text-base text-white">Homepage Video Showcase Settings</h3>
            </div>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <span className="text-zinc-400 text-xs">Section Enabled</span>
              <input
                type="checkbox"
                checked={videoForm.is_enabled}
                onChange={(e) => setVideoForm({ ...videoForm, is_enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-400 relative"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] tracking-widest text-zinc-400 uppercase mb-1">Direct Video URL (.mp4 / .webm)</label>
              <input
                type="text"
                value={videoForm.video_url}
                onChange={(e) => setVideoForm({ ...videoForm, video_url: e.target.value })}
                placeholder="https://... or /uploads/video.mp4"
                className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white focus:border-amber-400 font-mono"
              />
              <p className="text-[10px] text-zinc-500 mt-1">
                Upload video in Media Manager or paste any standard MP4/WebM media link
              </p>
            </div>

            <ImageUploader
              label="Video Poster Image (Thumbnail)"
              value={videoForm.poster_image}
              onChange={(url) => setVideoForm({ ...videoForm, poster_image: url })}
              csrfToken={csrfToken}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] tracking-widest text-zinc-400 uppercase mb-1">Video Overlay Headline</label>
              <input
                type="text"
                value={videoForm.headline}
                onChange={(e) => setVideoForm({ ...videoForm, headline: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-[10px] tracking-widest text-zinc-400 uppercase mb-1">CTA Button Label</label>
              <input
                type="text"
                value={videoForm.cta_text}
                onChange={(e) => setVideoForm({ ...videoForm, cta_text: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] tracking-widest text-zinc-400 uppercase mb-1">Tagline / Narrative Description</label>
            <textarea
              value={videoForm.tagline}
              onChange={(e) => setVideoForm({ ...videoForm, tagline: e.target.value })}
              rows={2}
              className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white focus:border-amber-400"
            />
          </div>

          {videoForm.video_url && (
            <div className="border border-zinc-800 p-3 bg-zinc-950 rounded space-y-2">
              <span className="text-[10px] uppercase text-zinc-400 tracking-wider">Live Video Preview</span>
              <div className="aspect-video max-w-md mx-auto overflow-hidden bg-black rounded">
                <video src={videoForm.video_url} poster={videoForm.poster_image} controls className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-zinc-800 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-black text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Video Section'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Custom Product Sections Form */}
      {activeTab === 'sections' && (
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 p-4">
            <h3 className="font-serif text-base text-white">Custom Dynamic Homepage Sections</h3>
            <p className="text-xs text-zinc-400 mt-1">
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
                <div key={secKey} className="bg-zinc-900 border border-zinc-800 p-5 space-y-4 text-xs text-zinc-300">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <span className="font-mono text-[11px] font-bold text-amber-300 uppercase">
                      Section #{idx + 1} ({secKey})
                    </span>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <span className="text-zinc-400 text-[10px]">Active</span>
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
                      <div className="w-7 h-4 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-400 relative"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-[10px] tracking-widest text-zinc-400 uppercase mb-1">Section Title</label>
                    <input
                      type="text"
                      value={sec.title}
                      onChange={(e) => {
                        setCustomSections({
                          ...customSections,
                          [secKey]: { ...sec, title: e.target.value }
                        });
                      }}
                      className="w-full bg-zinc-950 border border-zinc-700 px-3 py-1.5 text-xs text-white focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] tracking-widest text-zinc-400 uppercase mb-1">Subtitle / Descriptor</label>
                    <input
                      type="text"
                      value={sec.subtitle}
                      onChange={(e) => {
                        setCustomSections({
                          ...customSections,
                          [secKey]: { ...sec, subtitle: e.target.value }
                        });
                      }}
                      className="w-full bg-zinc-950 border border-zinc-700 px-3 py-1.5 text-xs text-white focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] tracking-widest text-zinc-400 uppercase mb-1">
                      Assigned Products ({sec.product_ids.length} selected)
                    </label>
                    <div className="max-h-36 overflow-y-auto bg-zinc-950 border border-zinc-800 p-2 space-y-1">
                      {availableProducts.map((p) => {
                        const isSelected = sec.product_ids.includes(p.id);
                        return (
                          <label
                            key={p.id}
                            className={`flex items-center justify-between p-1.5 text-[11px] rounded cursor-pointer transition-colors ${
                              isSelected ? 'bg-amber-400/20 text-white' : 'text-zinc-400 hover:bg-zinc-800'
                            }`}
                          >
                            <span>
                              <strong className="text-amber-300 font-normal">{p.brand}</strong> — {p.name}
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

                  <div className="pt-2 border-t border-zinc-800 flex justify-end">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => handleSaveCustomSection(secKey)}
                      className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-black text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
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
        <form onSubmit={handleSaveMarquee} className="bg-zinc-900 border border-zinc-800 p-6 space-y-5 text-xs text-zinc-300">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-800 text-amber-300">
            <Layout className="w-4 h-4" />
            <h3 className="font-serif text-base text-white">Category Marquee Ticker Settings</h3>
          </div>

          <div>
            <label className="block text-[10px] tracking-widest text-zinc-400 uppercase mb-1">
              Infinite Marquee Words / Ticker Items (comma-separated)
            </label>
            <input
              type="text"
              value={marqueeText}
              onChange={(e) => setMarqueeText(e.target.value)}
              placeholder="CURATE, JUDGE, REFINE, TEST"
              className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white focus:border-amber-400 font-mono"
            />
            <p className="text-[10px] text-zinc-500 mt-1">
              Example: CURATE, JUDGE, REFINE, TEST, LUXURY DECANTS
            </p>
          </div>

          <div className="pt-4 border-t border-zinc-800 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-black text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Marquee Ticker'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Reviews Manager */}
      {activeTab === 'reviews' && (
        <div className="bg-zinc-900 border border-zinc-800 p-6 space-y-6 text-xs text-zinc-300">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="font-serif text-base text-white">Customer Reviews ({reviews.length})</h3>
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
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-black text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Review</span>
            </button>
          </div>

          {editingReview && (
            <div className="bg-zinc-950 border border-amber-400/50 p-4 space-y-3 rounded-xs">
              <h4 className="font-semibold text-amber-300 uppercase text-[10px]">
                {reviews.some((r) => r.id === editingReview.id) ? 'Edit Review' : 'Create New Review'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase mb-1">Author Name</label>
                  <input
                    type="text"
                    value={editingReview.author}
                    onChange={(e) => setEditingReview({ ...editingReview, author: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase mb-1">Rating (1-5 Stars)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={editingReview.rating}
                    onChange={(e) => setEditingReview({ ...editingReview, rating: Number(e.target.value) })}
                    className="w-full bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">Quote Headline</label>
                <input
                  type="text"
                  value={editingReview.quote}
                  onChange={(e) => setEditingReview({ ...editingReview, quote: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">Full Review Body Text</label>
                <textarea
                  value={editingReview.content}
                  onChange={(e) => setEditingReview({ ...editingReview, content: e.target.value })}
                  rows={3}
                  className="w-full bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setEditingReview(null)}
                  className="px-3 py-1 bg-zinc-800 text-zinc-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveReview(editingReview)}
                  className="px-4 py-1 bg-amber-400 text-black font-semibold text-xs"
                >
                  Save Review
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="bg-zinc-950 border border-zinc-800 p-4 space-y-2 relative group">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{rev.author}</span>
                  <span className="text-amber-400 text-xs">{'★'.repeat(rev.rating)}</span>
                </div>
                <p className="text-zinc-300 font-serif italic text-xs">"{rev.quote}"</p>
                <p className="text-zinc-400 text-[11px] leading-relaxed">{rev.content}</p>
                <div className="pt-2 border-t border-zinc-800 flex justify-end gap-2">
                  <button
                    onClick={() => setEditingReview(rev)}
                    className="p-1 text-zinc-400 hover:text-amber-300"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteReview(rev.id)}
                    className="p-1 text-zinc-400 hover:text-red-400"
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

      {/* Tab 4: FAQs Manager */}
      {activeTab === 'faqs' && (
        <div className="bg-zinc-900 border border-zinc-800 p-6 space-y-6 text-xs text-zinc-300">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="font-serif text-base text-white">Frequently Asked Questions ({faqs.length})</h3>
            <button
              onClick={() =>
                setEditingFaq({
                  id: 'faq-' + Date.now(),
                  question: 'New Question Title?',
                  answer: 'Detailed answer response explaining order or decant policies.'
                })
              }
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-black text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New FAQ</span>
            </button>
          </div>

          {editingFaq && (
            <div className="bg-zinc-950 border border-amber-400/50 p-4 space-y-3 rounded-xs">
              <h4 className="font-semibold text-amber-300 uppercase text-[10px]">
                {faqs.some((f) => f.id === editingFaq.id) ? 'Edit FAQ' : 'Create New FAQ'}
              </h4>
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">Question Title</label>
                <input
                  type="text"
                  value={editingFaq.question}
                  onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">Detailed Answer Text</label>
                <textarea
                  value={editingFaq.answer}
                  onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                  rows={3}
                  className="w-full bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setEditingFaq(null)}
                  className="px-3 py-1 bg-zinc-800 text-zinc-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveFaq(editingFaq)}
                  className="px-4 py-1 bg-amber-400 text-black font-semibold text-xs"
                >
                  Save FAQ
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-zinc-950 border border-zinc-800 p-4 flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <p className="font-semibold text-white text-xs">Q: {faq.question}</p>
                  <p className="text-zinc-400 text-[11px]">A: {faq.answer}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setEditingFaq(faq)}
                    className="p-1 text-zinc-400 hover:text-amber-300"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteFaq(faq.id)}
                    className="p-1 text-zinc-400 hover:text-red-400"
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

      {/* Tab 5: Articles Manager */}
      {activeTab === 'articles' && (
        <div className="bg-zinc-900 border border-zinc-800 p-6 space-y-6 text-xs text-zinc-300">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="font-serif text-base text-white">Journal / Editorial Articles ({articles.length})</h3>
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
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-black text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Article</span>
            </button>
          </div>

          {editingArticle && (
            <div className="bg-zinc-950 border border-amber-400/50 p-4 space-y-3 rounded-xs">
              <h4 className="font-semibold text-amber-300 uppercase text-[10px]">
                {articles.some((a) => a.id === editingArticle.id) ? 'Edit Article' : 'Create New Article'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase mb-1">Article Title</label>
                  <input
                    type="text"
                    value={editingArticle.title}
                    onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase mb-1">Date String</label>
                  <input
                    type="text"
                    value={editingArticle.date}
                    onChange={(e) => setEditingArticle({ ...editingArticle, date: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase mb-1">Publisher</label>
                  <input
                    type="text"
                    value={editingArticle.publisher}
                    onChange={(e) => setEditingArticle({ ...editingArticle, publisher: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-white"
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
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">Description / Excerpt Snippet</label>
                <textarea
                  value={editingArticle.description}
                  onChange={(e) => setEditingArticle({ ...editingArticle, description: e.target.value })}
                  rows={3}
                  className="w-full bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setEditingArticle(null)}
                  className="px-3 py-1 bg-zinc-800 text-zinc-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveArticle(editingArticle)}
                  className="px-4 py-1 bg-amber-400 text-black font-semibold text-xs"
                >
                  Save Article
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {articles.map((art) => (
              <div key={art.id} className="bg-zinc-950 border border-zinc-800 p-4 space-y-2 flex flex-col justify-between">
                <div>
                  <img src={art.image} alt={art.title} className="w-full aspect-[4/3] object-cover mb-2" />
                  <span className="text-[10px] text-zinc-400 uppercase font-mono">{art.date} · {art.publisher}</span>
                  <h4 className="font-serif text-sm font-semibold text-white mt-1">{art.title}</h4>
                  <p className="text-zinc-400 text-[11px] mt-1 line-clamp-3">{art.description}</p>
                </div>
                <div className="pt-2 border-t border-zinc-800 flex justify-end gap-2">
                  <button
                    onClick={() => setEditingArticle(art)}
                    className="p-1 text-zinc-400 hover:text-amber-300"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteArticle(art.id)}
                    className="p-1 text-zinc-400 hover:text-red-400"
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

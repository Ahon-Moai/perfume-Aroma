import React, { useState, useEffect } from 'react';
import { Layout, Save, Sparkles, Plus, Trash2, Edit2, Check, RefreshCw } from 'lucide-react';
import { getErrorMessage } from '../services/api';
import { ImageUploader } from './ImageUploader';

interface HomepageCMSProps {
  csrfToken: string;
}

export const HomepageCMS: React.FC<HomepageCMSProps> = ({ csrfToken }) => {
  const [activeTab, setActiveTab] = useState<'hero' | 'marquee' | 'reviews' | 'faqs' | 'articles'>('hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Hero Form
  const [heroForm, setHeroForm] = useState({
    headline: 'LUXURY, BY THE ML',
    tagline: 'Weightless neroli blossom, cured Madagascar bourbon vanilla, and radiant golden amber suspended in pure olfactory clarity. Engineered for pocket elegance.',
    specifier: '5 ML ( 75+ SPRAYS )',
    primary_cta_text: 'ORDER PURE PORTIONS · ৳ 490',
    secondary_cta_text: 'EXPLORE ALL DECANTS',
    image: '/src/assets/images/hero_pure_portions_arrina_1791911761493.jpg'
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
      const res = await fetch('/api/admin/homepage.php');
      const data = await res.json();
      if (data.success && data.data) {
        const payload = data.data;

        // Hero
        const heroSec = payload.sections?.hero;
        if (heroSec && heroSec.content) {
          setHeroForm((prev) => ({ ...prev, ...heroSec.content }));
        }

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

      {/* Tab 2: Marquee Form */}
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

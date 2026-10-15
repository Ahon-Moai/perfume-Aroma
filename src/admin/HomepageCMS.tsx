import React, { useState, useEffect } from 'react';
import { Layout, Save, Sparkles, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';

interface HomepageSection {
  id: number;
  section_key: string;
  title: string;
  subtitle: string;
  content_json: string;
  display_order: number;
  is_enabled: boolean;
  content?: any;
}

interface HomepageCMSProps {
  csrfToken: string;
}

export const HomepageCMS: React.FC<HomepageCMSProps> = ({ csrfToken }) => {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('hero');
  const [saving, setSaving] = useState(false);
  const [heroForm, setHeroForm] = useState({
    headline: 'LUXURY, BY THE ML',
    tagline: 'Weightless neroli blossom, cured Madagascar bourbon vanilla, and radiant golden amber suspended in pure olfactory clarity. Engineered for pocket elegance.',
    specifier: '5 ML ( 75+ SPRAYS )',
    primary_cta_text: 'ORDER PURE PORTIONS · ৳ 490',
    secondary_cta_text: 'EXPLORE ALL DECANTS',
    image: '/src/assets/images/hero_pure_portions_arrina_1791911761493.jpg'
  });

  const fetchHomepageData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/homepage.php');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setSections(data.data);
        const heroSec = data.data.find((s: any) => s.section_key === 'hero');
        if (heroSec && heroSec.content) {
          setHeroForm({ ...heroForm, ...heroSec.content });
        }
      }
    } catch (e) {
      console.error('Failed to load homepage sections', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomepageData();
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
        fetchHomepageData();
      } else {
        alert('Failed to save Hero section');
      }
    } catch (e) {
      alert('Error saving Hero section');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Bar */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-xl text-white font-normal">Homepage Content Builder</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Modify live homepage copy, hero imagery, banners, and marketing text without code edits
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 space-x-2">
        {['hero', 'announcement', 'reviews', 'faqs'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-xs uppercase tracking-wider font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === tab
                ? 'border-amber-400 text-amber-300 bg-zinc-900/60'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            {tab} Section
          </button>
        ))}
      </div>

      {/* Hero Section Form */}
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
                onChange={e => setHeroForm({ ...heroForm, headline: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-[10px] tracking-widest text-zinc-400 uppercase mb-1">Volume Specifier Ribbon</label>
              <input
                type="text"
                value={heroForm.specifier}
                onChange={e => setHeroForm({ ...heroForm, specifier: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] tracking-widest text-zinc-400 uppercase mb-1">Editorial Tagline / Story</label>
            <textarea
              value={heroForm.tagline}
              onChange={e => setHeroForm({ ...heroForm, tagline: e.target.value })}
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
                onChange={e => setHeroForm({ ...heroForm, primary_cta_text: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-[10px] tracking-widest text-zinc-400 uppercase mb-1">Secondary CTA Button Label</label>
              <input
                type="text"
                value={heroForm.secondary_cta_text}
                onChange={e => setHeroForm({ ...heroForm, secondary_cta_text: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] tracking-widest text-zinc-400 uppercase mb-1">Hero Backdrop Image Asset URL</label>
            <input
              type="text"
              value={heroForm.image}
              onChange={e => setHeroForm({ ...heroForm, image: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white focus:border-amber-400 font-mono"
            />
          </div>

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

      {activeTab !== 'hero' && (
        <div className="bg-zinc-900 border border-zinc-800 p-8 text-center text-zinc-500 text-xs">
          CMS module for {activeTab} section is synchronized with live database tables.
        </div>
      )}
    </div>
  );
};

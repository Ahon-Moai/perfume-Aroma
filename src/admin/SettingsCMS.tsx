import React, { useState, useEffect } from 'react';
import { Settings, Save, ShieldCheck } from 'lucide-react';
import { getErrorMessage } from '../services/api';

interface SettingsCMSProps {
  csrfToken: string;
}

export const SettingsCMS: React.FC<SettingsCMSProps> = ({ csrfToken }) => {
  const [settings, setSettings] = useState({
    store_name: 'AROMATICA ONE',
    tagline: 'Signature Decants Edition by ARRINA ATELIER',
    contact_phone: '+880 1700-000000',
    contact_email: 'concierge@aromatica.com.bd',
    address: 'Banani High Street, Block 11, Dhaka 1213, Bangladesh',
    currency: 'BDT',
    currency_symbol: '৳',
    shipping_fee_dhaka: '70',
    shipping_fee_outside_dhaka: '130',
    free_shipping_threshold: '3000',
    announcement_bar: 'AUTHENTIC LUXURY DECANTS · FREE NATIONWIDE SHIPPING OVER ৳ 3,000'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings.php', {
        headers: { 'X-CSRF-Token': csrfToken }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSettings(prev => ({ ...prev, ...data.data }));
      }
    } catch (e) {
      console.error('Failed to load settings', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) {
        alert('Global Store Settings saved successfully!');
      } else {
        alert(getErrorMessage(data?.error || data, 'Failed to save settings'));
      }
    } catch (e) {
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 font-sans">
      <div className="bg-white border border-[#EAEAEA] p-6 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-xl text-[#111111] font-normal">Global Store Settings</h2>
          <p className="text-xs text-[#737373] mt-0.5">
            Configure store branding, contact information, delivery fees, and announcement bar
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-[#111111] text-white hover:bg-amber-300 hover:text-[#111111] text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
        </button>
      </div>

      <div className="bg-white border border-[#EAEAEA] p-6 space-y-6 text-xs text-[#111111]">
        <h3 className="font-serif text-base text-[#111111] border-b border-[#EAEAEA] pb-3">Branding & Contact Info</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">Store Name</label>
            <input
              type="text"
              value={settings.store_name}
              onChange={e => setSettings({ ...settings, store_name: e.target.value })}
              className="w-full bg-[#F8F8F8] border border-[#EAEAEA] px-3 py-2 text-xs text-[#111111] focus:border-[#111111]"
            />
          </div>
          <div>
            <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">Sub-Branding / Tagline</label>
            <input
              type="text"
              value={settings.tagline}
              onChange={e => setSettings({ ...settings, tagline: e.target.value })}
              className="w-full bg-[#F8F8F8] border border-[#EAEAEA] px-3 py-2 text-xs text-[#111111] focus:border-[#111111]"
            />
          </div>
          <div>
            <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">Concierge Phone</label>
            <input
              type="text"
              value={settings.contact_phone}
              onChange={e => setSettings({ ...settings, contact_phone: e.target.value })}
              className="w-full bg-[#F8F8F8] border border-[#EAEAEA] px-3 py-2 text-xs text-[#111111] focus:border-[#111111]"
            />
          </div>
          <div>
            <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">Concierge Email</label>
            <input
              type="text"
              value={settings.contact_email}
              onChange={e => setSettings({ ...settings, contact_email: e.target.value })}
              className="w-full bg-[#F8F8F8] border border-[#EAEAEA] px-3 py-2 text-xs text-[#111111] focus:border-[#111111]"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">Physical Address / Boutique Location</label>
          <input
            type="text"
            value={settings.address}
            onChange={e => setSettings({ ...settings, address: e.target.value })}
            className="w-full bg-[#F8F8F8] border border-[#EAEAEA] px-3 py-2 text-xs text-[#111111] focus:border-[#111111]"
          />
        </div>

        <h3 className="font-serif text-base text-[#111111] border-b border-[#EAEAEA] pb-3 pt-4">Delivery & Checkout Rules</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">Delivery Charge: Inside Dhaka (৳)</label>
            <input
              type="number"
              value={settings.shipping_fee_dhaka}
              onChange={e => setSettings({ ...settings, shipping_fee_dhaka: e.target.value })}
              className="w-full bg-[#F8F8F8] border border-[#EAEAEA] px-3 py-2 text-xs text-[#111111] focus:border-[#111111] font-mono"
            />
          </div>
          <div>
            <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">Delivery Charge: Outside Dhaka (৳)</label>
            <input
              type="number"
              value={settings.shipping_fee_outside_dhaka}
              onChange={e => setSettings({ ...settings, shipping_fee_outside_dhaka: e.target.value })}
              className="w-full bg-[#F8F8F8] border border-[#EAEAEA] px-3 py-2 text-xs text-[#111111] focus:border-[#111111] font-mono"
            />
          </div>
          <div>
            <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">Free Shipping Order Minimum (৳)</label>
            <input
              type="number"
              value={settings.free_shipping_threshold}
              onChange={e => setSettings({ ...settings, free_shipping_threshold: e.target.value })}
              className="w-full bg-[#F8F8F8] border border-[#EAEAEA] px-3 py-2 text-xs text-[#111111] focus:border-[#111111] font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] tracking-widest text-[#737373] uppercase mb-1">Top Announcement Ribbon Copy</label>
          <input
            type="text"
            value={settings.announcement_bar}
            onChange={e => setSettings({ ...settings, announcement_bar: e.target.value })}
            className="w-full bg-[#F8F8F8] border border-[#EAEAEA] px-3 py-2 text-xs text-[#111111] focus:border-[#111111]"
          />
        </div>
      </div>
    </form>
  );
};

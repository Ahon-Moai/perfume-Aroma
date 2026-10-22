import React from 'react';
import { IMAGES } from '../data/fragranceData';
import { CampaignBannersData } from '../types';

interface CampaignBannersProps {
  onSelectCategory: (gender: 'Him' | 'Her') => void;
  onNavigateToCollection?: (slug: string) => void;
  campaignData?: CampaignBannersData;
}

export const CampaignBanners: React.FC<CampaignBannersProps> = ({ onSelectCategory, onNavigateToCollection, campaignData }) => {
  const sectionTitle = campaignData?.section_title || 'FOR HIM | HER';
  const forHimTitle = campaignData?.for_him_title || 'For Him';
  const forHimButtonText = campaignData?.for_him_button_text || 'SHOP DECANTS';
  const forHimImage = campaignData?.for_him_image || IMAGES.campaigns.forHim;

  const forHerTitle = campaignData?.for_her_title || 'For Her';
  const forHerButtonText = campaignData?.for_her_button_text || 'SHOP DECANTS';
  const forHerImage = campaignData?.for_her_image || IMAGES.campaigns.forHer;

  return (
    <section id="for-him-her" className="w-full bg-white pt-8 pb-14 border-b border-zinc-100">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Right-aligned Section Heading as in screenshot */}
        <div className="flex justify-end mb-4 sm:mb-6">
          <h2 className="font-serif text-lg sm:text-2xl font-light tracking-[0.16em] text-zinc-950 uppercase">
            {sectionTitle}
          </h2>
        </div>

        {/* 2-Column Grid with Narrow Gutter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {/* For Him Card */}
          <div
            onClick={() => onNavigateToCollection ? onNavigateToCollection('forhim') : onSelectCategory('Him')}
            className="group relative cursor-pointer overflow-hidden flex flex-col bg-zinc-950"
          >
            <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-zinc-900">
              <img
                src={forHimImage}
                alt={`${forHimTitle} luxury fragrance decants campaign set`}
                className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
            </div>

            {/* Black Lower Bar */}
            <div className="bg-black text-white px-5 py-3.5 flex items-center justify-between border-t border-zinc-900">
              <span className="font-serif text-sm sm:text-base font-normal tracking-wide text-zinc-100">
                {forHimTitle}
              </span>
              <span className="text-[10px] sm:text-[11px] font-sans tracking-[0.18em] uppercase text-zinc-300 group-hover:text-white group-hover:underline underline-offset-4 transition-all">
                {forHimButtonText}
              </span>
            </div>
          </div>

          {/* For Her Card */}
          <div
            onClick={() => onNavigateToCollection ? onNavigateToCollection('forher') : onSelectCategory('Her')}
            className="group relative cursor-pointer overflow-hidden flex flex-col bg-zinc-950"
          >
            <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-zinc-900">
              <img
                src={forHerImage}
                alt={`${forHerTitle} luxury fragrance decants campaign vanity`}
                className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
            </div>

            {/* Black Lower Bar */}
            <div className="bg-black text-white px-5 py-3.5 flex items-center justify-between border-t border-zinc-900">
              <span className="font-serif text-sm sm:text-base font-normal tracking-wide text-zinc-100">
                {forHerTitle}
              </span>
              <span className="text-[10px] sm:text-[11px] font-sans tracking-[0.18em] uppercase text-zinc-300 group-hover:text-white group-hover:underline underline-offset-4 transition-all">
                {forHerButtonText}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

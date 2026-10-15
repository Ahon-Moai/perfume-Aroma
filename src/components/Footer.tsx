import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setSubscribed(true);
    setTimeout(() => {
      setEmail('');
    }, 3000);
  };

  return (
    <footer id="account-section" className="w-full bg-[#070707] text-white pt-8 pb-12 overflow-hidden border-t border-zinc-900">
      {/* Massive AROMATICA Wordmark Banner matching screenshot */}
      <div className="w-full border-b border-zinc-900/80 bg-zinc-950/60 py-6 sm:py-10 select-none overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-center flex items-center justify-center">
          <h1 className="font-serif text-[11vw] sm:text-[10vw] lg:text-[8.5vw] font-extralight tracking-[0.28em] text-white/95 uppercase leading-none scale-y-105">
            AROMATICA
          </h1>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Column: Newsletter & Member Access */}
          <div className="lg:col-span-5 space-y-5">
            <h3 className="font-serif text-2xl sm:text-3xl font-light text-zinc-100">
              Stay in the Loop
            </h3>
            
            <p className="text-xs text-zinc-400 font-sans font-light leading-relaxed max-w-md">
              Be the first to know about new arrivals, exclusive offers, and behind-the-scenes stories.
            </p>

            <form onSubmit={handleSubscribe} className="max-w-md space-y-2">
              <div className="relative flex items-center">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter your email"
                  className="w-full bg-zinc-900/90 border border-zinc-800 text-white placeholder-zinc-500 text-xs px-4 py-3 pr-28 focus:outline-none focus:border-zinc-500 transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 px-4 bg-zinc-100 hover:bg-white text-zinc-950 text-[11px] font-sans font-medium tracking-wider uppercase transition-colors flex items-center gap-1.5"
                >
                  {subscribed ? (
                    <>
                      <span>Joined</span>
                      <Check className="w-3 h-3 text-emerald-600" />
                    </>
                  ) : (
                    <>
                      <span>Subscribe</span>
                      <ArrowRight className="w-3 h-3" />
                    </>
                  )}
                </button>
              </div>

              {error && <p className="text-red-400 text-[11px] font-sans">{error}</p>}
              {subscribed && (
                <p className="text-emerald-400 text-[11px] font-sans">
                  Welcome to the AROMATICA circle. Check your inbox shortly.
                </p>
              )}
            </form>

            <p className="text-[10px] text-zinc-500 font-sans">
              By subscribing, you agree to our <a href="#privacy" className="underline hover:text-zinc-300">Privacy Policy</a>. Unsubscribe anytime.
            </p>

            <div className="pt-2 text-xs text-zinc-400 font-sans">
              <p>Already a member?</p>
              <button
                onClick={() => alert('Member sign-in available via SMS OTP at checkout.')}
                className="text-zinc-200 hover:text-white underline underline-offset-4 mt-1 flex items-center gap-1"
              >
                Log in to your account <span>→</span>
              </button>
            </div>
          </div>

          {/* Right Column: Tagline & Navigation Columns */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
            <p className="text-xs sm:text-sm font-sans text-zinc-300 font-light tracking-wide">
              The finest fragrances in the world. By the ml. For you.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs font-sans">
              {/* SHOP */}
              <div className="space-y-3">
                <p className="text-[10px] tracking-[0.2em] uppercase text-zinc-400 font-semibold">
                  SHOP
                </p>
                <ul className="space-y-2 text-zinc-400 font-light">
                  <li><a href="#new-arrivals" className="hover:text-white transition-colors">Best Sellers</a></li>
                  <li><a href="#brands" className="hover:text-white transition-colors">Explore Fragrance DNAs'</a></li>
                  <li><a href="#reviews" className="hover:text-white transition-colors">Reviews</a></li>
                  <li><a href="#seasons" className="hover:text-white transition-colors">Gallery</a></li>
                  <li><a href="#journal" className="hover:text-white transition-colors">Blog</a></li>
                </ul>
              </div>

              {/* CONNECT */}
              <div className="space-y-3">
                <p className="text-[10px] tracking-[0.2em] uppercase text-zinc-400 font-semibold">
                  CONNECT
                </p>
                <ul className="space-y-2 text-zinc-400 font-light">
                  <li><a href="#faq" className="hover:text-white transition-colors">How It Works</a></li>
                  <li><a href="#faq" className="hover:text-white transition-colors">FAQs</a></li>
                  <li><a href="#shipping" className="hover:text-white transition-colors">Shipping</a></li>
                  <li><a href="#payments" className="hover:text-white transition-colors">Payment methods</a></li>
                  <li><a href="#returns" className="hover:text-white transition-colors">Returns | Refunds | Exchanges</a></li>
                  <li><a href="#terms" className="hover:text-white transition-colors">Terms And Condition</a></li>
                  <li><a href="#contact" className="hover:text-white transition-colors">Contact Us</a></li>
                  <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
                  <li><a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                </ul>
              </div>

              {/* ACCOUNT */}
              <div className="space-y-3">
                <p className="text-[10px] tracking-[0.2em] uppercase text-zinc-400 font-semibold">
                  ACCOUNT
                </p>
                <ul className="space-y-2 text-zinc-400 font-light">
                  <li><a href="#orders" className="hover:text-white transition-colors">Orders</a></li>
                  <li><a href="#profile" className="hover:text-white transition-colors">Profile</a></li>
                  <li><a href="#settings" className="hover:text-white transition-colors">Settings</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Social Icons row */}
        <div className="mt-14 pt-8 border-t border-zinc-900/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-5 text-zinc-400">
            {/* Facebook */}
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="hover:text-white transition-colors">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95C18.05 21.45 22 17.19 22 12z"/>
              </svg>
            </a>
            {/* Instagram */}
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:text-white transition-colors">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            {/* YouTube */}
            <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube" className="hover:text-white transition-colors">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>

          <div className="text-[10px] text-zinc-500 font-sans text-center sm:text-right">
            © 2026, AROMATICA Powered by Shopify · Privacy policy · Refund policy · Terms of service · Contact information · Shipping policy
          </div>
        </div>
      </div>
    </footer>
  );
};

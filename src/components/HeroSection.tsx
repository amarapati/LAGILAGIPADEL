import React from 'react';
import { Calendar, Users, Trophy, Sparkles, ShieldCheck, MapPin, ArrowRight, Play } from 'lucide-react';
import { LOCATIONS } from '../data/mockData';

interface HeroSectionProps {
  onStartBooking: (locationId?: string) => void;
  onExploreMatches: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartBooking,
  onExploreMatches
}) => {
  return (
    <section id="hero" className="relative pt-8 pb-16 overflow-hidden bg-[#F6FAF9]">
      {/* Subtle ambient light glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-80 bg-gradient-to-b from-[#006A6A]/10 via-[#6E4D8B]/5 to-transparent blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Asymmetric Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            {/* Social Proof Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#D8DFDE] text-xs text-[#3D5A57] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#006A6A] animate-pulse" />
              <span className="font-semibold text-[#191C1C]">#1 Official Padel Club</span>
              <span className="text-[#6F7978]">·</span>
              <span className="text-[#6F7978]">World Padel Tour Certified Turf</span>
            </div>

            {/* Primary Headline */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#191C1C] leading-[1.08] font-display">
              The Home of Padel <br className="hidden sm:inline" />
              in Indonesia.
            </h1>

            <p className="text-[#3D5A57] text-base sm:text-lg max-w-2xl leading-relaxed">
              Mainkan olahraga terpopuler di dunia di fasilitas resmi berstandar World Padel Tour (WPT). Nikmati <span className="text-[#006A6A] font-semibold">Iconic Pink Court</span> di Kemang serta arena indoor berpendingin udara di Satrio Club Jakarta.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onStartBooking()}
                className="px-6 py-3.5 text-sm font-semibold text-white bg-[#006A6A] hover:bg-[#007A7C] active:bg-[#005252] rounded-xl shadow-lg shadow-[#006A6A]/20 transition-all cursor-pointer flex items-center gap-2 group"
              >
                <Calendar className="w-4 h-4 text-[#A4F2F2]" />
                <span>Pesan Lapangan Sekarang</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={onExploreMatches}
                className="px-6 py-3.5 text-sm font-semibold text-[#191C1C] hover:text-[#006A6A] bg-white hover:bg-[#EEF4F3] border border-[#D8DFDE] rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-xs"
              >
                <Users className="w-4 h-4 text-[#006A6A]" />
                <span>Cari Lawan / Open Match</span>
              </button>
            </div>

            {/* Quick Location Cards */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
              {LOCATIONS.map((loc) => (
                <div
                  key={loc.id}
                  onClick={() => onStartBooking(loc.id)}
                  className="p-3.5 rounded-xl border border-[#D8DFDE] bg-white hover:bg-[#EEF4F3] hover:border-[#006A6A]/60 transition-all cursor-pointer group shadow-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-[#191C1C] group-hover:text-[#006A6A] transition-colors">
                      {loc.name}
                    </span>
                    <span className="text-xs text-[#6F7978] font-mono">
                      {loc.courtsCount} Courts
                    </span>
                  </div>
                  <p className="text-xs text-[#3D5A57] line-clamp-1">
                    {loc.featuredCourt}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Hero Visual Asset */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-[#D8DFDE] bg-white shadow-xl group">
              <img
                src="/src/assets/images/hero_padel_court_1790169815946.jpg"
                alt="LagiLagiPadel Indonesia WPT Court"
                className="w-full h-[380px] sm:h-[440px] object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              {/* Bottom Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

              {/* In-image highlight tag */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md border border-[#D8DFDE] rounded-xl px-3 py-1.5 text-xs text-[#191C1C] font-semibold flex items-center gap-1.5 shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-[#006A6A]" />
                <span>WPT Panoramic Glass</span>
              </div>

              {/* Bottom image caption */}
              <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-xl bg-white/95 backdrop-blur-md border border-[#D8DFDE] shadow-md">
                <div className="flex items-center justify-between text-xs text-[#191C1C]">
                  <span className="font-bold text-[#191C1C]">Center Court & Pink Court</span>
                  <span className="text-[#006A6A] font-bold">Buka 06:00 - 24:00</span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-[#3D5A57]">
                  <MapPin className="w-3 h-3 text-[#006A6A] shrink-0" />
                  <span className="truncate">Kemang II & Satrio Kuningan, Jakarta Selatan</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Adjacent Quantitative Proof Metrics */}
        <div className="mt-14 pt-8 border-t border-[#D8DFDE] grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#191C1C] font-display tabular-nums">
              8 Courts
            </div>
            <p className="text-xs text-[#3D5A57]">
              Mondo Supercourt XN turf, panoramic glass anti-glare
            </p>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#006A6A] font-display tabular-nums">
              4,800+
            </div>
            <p className="text-xs text-[#3D5A57]">
              Pemain aktif terdaftar di komunitas LagiLagiPadel
            </p>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#191C1C] font-display tabular-nums">
              12 Coaches
            </div>
            <p className="text-xs text-[#3D5A57]">
              Pelatih tersertifikasi International Padel Federation (FIP)
            </p>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#6E4D8B] font-display tabular-nums">
              100% Instant
            </div>
            <p className="text-xs text-[#3D5A57]">
              Booking otomatis via QRIS, barcode gate akses langsung
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

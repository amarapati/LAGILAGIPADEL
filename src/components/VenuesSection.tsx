import React from 'react';
import { MapPin, Phone, Clock, ArrowRight, ExternalLink, Sparkles } from 'lucide-react';
import { LOCATIONS } from '../data/mockData';

interface VenuesSectionProps {
  onSelectLocationForBooking: (locationId: string) => void;
}

export const VenuesSection: React.FC<VenuesSectionProps> = ({
  onSelectLocationForBooking
}) => {
  return (
    <section id="venues" className="py-12 lg:py-20 border-b border-[#D8DFDE] bg-[#F6FAF9] text-[#191C1C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="max-w-2xl mb-12">
          <div className="text-xs font-semibold text-[#006A6A] tracking-wider uppercase mb-1">
            Fasilitas Standar Dunia
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#191C1C] tracking-tight font-display">
            Klub & Lokasi Jakarta
          </h2>
          <p className="text-sm sm:text-base text-[#3D5A57] mt-2">
            Dua lokasi strategis di Jakarta Selatan dengan lapangan spesifikasi World Padel Tour, kaca tempered panoramik, lounge nyaman, dan kafe spesialis kopi & recovery.
          </p>
        </div>

        {/* Venues Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {LOCATIONS.map((loc) => {
            const isKemang = loc.id === 'kemang';

            return (
              <div
                key={loc.id}
                className="rounded-2xl border border-[#D8DFDE] bg-white overflow-hidden flex flex-col justify-between group hover:border-[#006A6A]/60 transition-all shadow-sm"
              >
                {/* Visual Image Banner */}
                <div className="relative h-64 sm:h-72 overflow-hidden bg-[#E9EFEF]">
                  <img
                    src={loc.imageUrl}
                    alt={loc.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Corner Badge */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md border border-[#D8DFDE] rounded-xl px-3 py-1.5 text-xs text-[#191C1C] font-semibold flex items-center gap-1.5 shadow-md">
                    <Sparkles className="w-3.5 h-3.5 text-[#006A6A]" />
                    <span>{isKemang ? '6 Covered Courts' : 'Indoor AC Arena'}</span>
                  </div>

                  {/* In-image title overlay */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-extrabold text-white font-display">
                      {loc.name}
                    </h3>
                    <p className="text-xs text-[#A4F2F2] font-medium mt-0.5">
                      {loc.featuredCourt}
                    </p>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    <p className="text-xs sm:text-sm text-[#3D5A57] leading-relaxed">
                      {loc.description}
                    </p>

                    {/* Contact & Hours */}
                    <div className="space-y-2 text-xs text-[#3D5A57]">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-[#006A6A] shrink-0 mt-0.5" />
                        <span className="text-[#191C1C] font-medium">{loc.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#006A6A] shrink-0" />
                        <span>{loc.hours}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#6F7978] shrink-0" />
                        <span>Tel: {loc.phone} · WA: {loc.whatsapp}</span>
                      </div>
                    </div>

                    {/* Amenities Pill Grid */}
                    <div className="pt-2">
                      <div className="text-[11px] font-semibold text-[#6F7978] uppercase tracking-wider mb-2 font-mono">
                        Fasilitas & Keunggulan Klub:
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {loc.amenities.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[#191C1C]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#006A6A] shrink-0" />
                            <span className="truncate">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Buttons */}
                  <div className="pt-4 border-t border-[#D8DFDE] flex items-center justify-between gap-3">
                    <a
                      href={loc.googleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2.5 rounded-xl border border-[#D8DFDE] hover:border-[#006A6A]/50 bg-[#F6FAF9] text-xs font-semibold text-[#3D5A57] hover:text-[#191C1C] transition-all flex items-center gap-1.5"
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#6F7978]" />
                      <span>Petunjuk Arah</span>
                      <ExternalLink className="w-3 h-3 text-[#6F7978]" />
                    </a>

                    <button
                      onClick={() => onSelectLocationForBooking(loc.id)}
                      className="px-4 py-2.5 rounded-xl bg-[#006A6A] hover:bg-[#007A7C] active:bg-[#005252] text-white text-xs font-semibold shadow-md shadow-[#006A6A]/20 transition-all flex items-center gap-1.5 group cursor-pointer"
                    >
                      <span>Booking Lapangan di {loc.shortName}</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

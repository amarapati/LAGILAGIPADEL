import React from 'react';
import { Phone, Mail, MapPin, Instagram, Globe } from 'lucide-react';
import { LOCATIONS } from '../data/mockData';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-[#D8DFDE] bg-white text-[#6F7978] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Col 1 & 2: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#006A6A] flex items-center justify-center font-black text-white text-xs shadow-xs">
                LLP
              </div>
              <span className="text-xl font-black text-[#191C1C] tracking-tight font-display">
                LagiLagi<span className="text-[#006A6A]">Padel</span>
              </span>
            </div>

            <p className="text-[#3D5A57] text-xs leading-relaxed max-w-sm">
              Platform turnamen, online live scoring wasit, serta booking klub padel berstandar internasional di Indonesia. Menghadirkan lapangan World Padel Tour (WPT), akademi berlisensi FIP Madrid, dan komunitas inklusif untuk semua pemain.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-xl bg-[#F6FAF9] border border-[#D8DFDE] flex items-center justify-center text-[#3D5A57] hover:text-[#006A6A] hover:border-[#006A6A] transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/6281188997233"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-xl bg-[#F6FAF9] border border-[#D8DFDE] flex items-center justify-center text-[#3D5A57] hover:text-[#006A6A] hover:border-[#006A6A] transition-colors"
                aria-label="WhatsApp"
              >
                <Phone className="w-4 h-4" />
              </a>
              <a
                href="mailto:hello@lagilagipadel.id"
                className="w-8 h-8 rounded-xl bg-[#F6FAF9] border border-[#D8DFDE] flex items-center justify-center text-[#3D5A57] hover:text-[#006A6A] hover:border-[#006A6A] transition-colors"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 3: Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#191C1C] font-mono">
              Navigasi Klub
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('booking')}
                  className="hover:text-[#006A6A] transition-colors text-left"
                >
                  Sewa Lapangan WPT
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('venues')}
                  className="hover:text-[#006A6A] transition-colors text-left"
                >
                  Lokasi Kemang & Satrio
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('open-matches')}
                  className="hover:text-[#006A6A] transition-colors text-left"
                >
                  Open Match & Mabar
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('academy')}
                  className="hover:text-[#006A6A] transition-colors text-left"
                >
                  Akademi & Coaching FIP
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('tournaments')}
                  className="hover:text-[#006A6A] transition-colors text-left"
                >
                  Turnamen Resmi & Rating
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('pro-shop')}
                  className="hover:text-[#006A6A] transition-colors text-left"
                >
                  Pro Shop & Raket Demo
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Club Locations */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#191C1C] font-mono">
              Lokasi Arena
            </h4>
            <div className="space-y-4">
              {LOCATIONS.map((loc) => (
                <div key={loc.id} className="space-y-1">
                  <div className="font-semibold text-[#191C1C] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#006A6A]" />
                    <span>{loc.name}</span>
                  </div>
                  <p className="text-[11px] text-[#6F7978] leading-relaxed">
                    {loc.address}
                  </p>
                  <p className="text-[11px] text-[#006A6A] font-mono font-medium">
                    {loc.hours}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Col 5: Operating Hours & Policies */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#191C1C] font-mono">
              Operasional & Bantuan
            </h4>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[#191C1C] block font-medium">Customer Support:</span>
                <span className="text-[#3D5A57]">Setiap Hari, 06:00 - 24:00 WIB</span>
              </div>
              <div>
                <span className="text-[#191C1C] block font-medium">Kebijakan Pembatalan:</span>
                <span className="text-[#3D5A57]">Reschedule gratis hingga 6 jam sebelum jam sewa.</span>
              </div>
              <div>
                <span className="text-[#191C1C] block font-medium">Peminjaman Raket:</span>
                <span className="text-[#3D5A57]">Tersedia di pro shop resepsionis setiap klub.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[#D8DFDE] flex flex-col sm:flex-row items-center justify-between gap-4 text-[#6F7978] text-[11px]">
          <div>
            © {new Date().getFullYear()} LagiLagiPadel Indonesia. Hak Cipta Dilindungi Undang-Undang.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-[#191C1C] cursor-pointer">Syarat & Ketentuan Klub</span>
            <span>·</span>
            <span className="hover:text-[#191C1C] cursor-pointer">Kebijakan Privasi</span>
            <span>·</span>
            <span className="hover:text-[#191C1C] cursor-pointer">FIP Regulations</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

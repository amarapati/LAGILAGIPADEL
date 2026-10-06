import React from 'react';
import { Phone, Mail, Instagram, Trophy, Award, ShieldCheck } from 'lucide-react';
import { ReclubIcon } from './ReclubIcon';

interface FooterProps {
  onNavigate?: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = () => {
  return (
    <footer className="border-t border-[#D8DFDE] bg-white text-[#6F7978] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Col 1 & 2: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <img
                src="https://lagilagipadel.id/cdn/logo-llp.png"
                alt="LagiLagiPadel"
                className="w-8 h-8"
              />
              <span className="text-xl font-black text-[#191C1C] tracking-tight font-display">
                LagiLagi<span className="text-[#006A6A]">Padel</span>
              </span>
            </div>

            <p className="text-[#3D5A57] text-xs leading-relaxed max-w-sm">
              Platform manajemen turnamen padel, live scoring wasit digital, bagan gugur (knockout bracket), dan undian grup berstandar regulasi Federasi Padel Internasional (FIP).
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.instagram.com/lagilagipadel.id"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-xl bg-[#F6FAF9] border border-[#D8DFDE] flex items-center justify-center text-[#3D5A57] hover:text-[#E1306C] hover:border-[#E1306C] transition-colors"
                title="Instagram @lagilagipadel.id"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://reclub.co/clubs/@lagilagipadel.id"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-xl bg-[#F6FAF9] border border-[#D8DFDE] flex items-center justify-center text-[#3D5A57] hover:text-[#FF4A4A] hover:border-[#FF4A4A] transition-colors"
                title="Reclub @lagilagipadel"
                aria-label="Reclub"
              >
                <ReclubIcon className="w-4 h-4" />
              </a>
              <a
                href="mailto:turnamen@lagilagipadel.id"
                className="w-8 h-8 rounded-xl bg-[#F6FAF9] border border-[#D8DFDE] flex items-center justify-center text-[#3D5A57] hover:text-[#006A6A] hover:border-[#006A6A] transition-colors"
                title="Email turnamen@lagilagipadel.id"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[#D8DFDE] flex flex-col sm:flex-row items-center justify-between gap-4 text-[#6F7978] text-[11px]">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#006A6A]" />
            <span>Sistem Turnamen & Skoring Terpadu LagiLagiPadel</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

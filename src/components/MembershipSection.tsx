import React, { useState } from 'react';
import { ShieldCheck, Check, Sparkles, Zap, ArrowRight } from 'lucide-react';
import { MEMBERSHIP_PASSES } from '../data/mockData';
import { formatRupiah } from '../utils/formatters';

interface MembershipSectionProps {
  onNotify: (msg: string) => void;
}

export const MembershipSection: React.FC<MembershipSectionProps> = ({ onNotify }) => {
  const [selectedPass, setSelectedPass] = useState<string | null>(null);

  const handleBuyPass = (passName: string, price: number) => {
    onNotify(
      `Paket "${passName}" (${formatRupiah(price)}) berhasil diproses! Kredit sesi telah ditambahkan ke akun member Anda.`
    );
    setSelectedPass(null);
  };

  return (
    <section className="py-12 lg:py-20 border-b border-[#D8DFDE] bg-[#F6FAF9] text-[#191C1C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-semibold text-[#006A6A] tracking-wider uppercase mb-1">
            Paket Member & Kredit Sesi
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#191C1C] tracking-tight font-display">
            LagiLagiPadel Pass
          </h2>
          <p className="text-sm sm:text-base text-[#3D5A57] mt-2">
            Main lebih sering dengan tarif lebih hemat. Nikmati prioritas booking lapangan hingga H-14 dan diskon eksklusif pro shop.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {MEMBERSHIP_PASSES.map((pass) => (
            <div
              key={pass.id}
              className={`rounded-2xl border p-6 flex flex-col justify-between transition-all relative ${
                pass.popular
                  ? 'bg-white border-[#006A6A] ring-2 ring-[#006A6A] shadow-lg'
                  : 'bg-white border-[#D8DFDE] hover:border-[#006A6A]/50 shadow-xs'
              }`}
            >
              {pass.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#006A6A] text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                  Paling Populer
                </div>
              )}

              <div>
                <div className="text-xs font-mono text-[#6F7978] mb-1">
                  Masa Berlaku: {pass.validity}
                </div>
                <h3 className="text-xl font-bold text-[#191C1C] font-display mb-1">
                  {pass.name}
                </h3>
                <span className="text-xs text-[#006A6A] font-semibold block mb-4">
                  {pass.savingsText}
                </span>

                <div className="mb-6">
                  <span className="text-3xl font-extrabold text-[#191C1C] font-mono">
                    {formatRupiah(pass.price)}
                  </span>
                  <span className="text-xs text-[#6F7978] block mt-0.5">
                    ({pass.sessions} Sesi Bermain / {Math.round(pass.price / pass.sessions / 1000)}k per jam)
                  </span>
                </div>

                {/* Perks list */}
                <div className="space-y-2.5 text-xs text-[#3D5A57] mb-6">
                  {pass.perks.map((perk, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-[#006A6A] shrink-0 mt-0.5" />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleBuyPass(pass.name, pass.price)}
                className={`w-full py-3 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  pass.popular
                    ? 'bg-[#006A6A] hover:bg-[#007A7C] text-white shadow-md shadow-[#006A6A]/20'
                    : 'bg-[#EEF4F3] hover:bg-[#D8DFDE] text-[#191C1C] border border-[#D8DFDE]'
                }`}
              >
                <span>Beli {pass.name}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

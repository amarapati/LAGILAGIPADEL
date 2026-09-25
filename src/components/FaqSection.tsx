import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { FAQ_LIST } from '../data/mockData';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-12 lg:py-20 border-b border-[#D8DFDE] bg-[#F6FAF9] text-[#191C1C]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <div className="text-xs font-semibold text-[#006A6A] tracking-wider uppercase mb-1">
            Panduan & Pertanyaan Umum
          </div>
          <h2 className="text-3xl font-extrabold text-[#191C1C] tracking-tight font-display">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="text-sm text-[#3D5A57] mt-2">
            Segala informasi penting seputar pemesanan lapangan, perlengkapan, dan etika bermain di LagiLagiPadel.
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_LIST.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className="rounded-xl border border-[#D8DFDE] bg-white overflow-hidden transition-all shadow-xs"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#F6FAF9] transition-colors"
                >
                  <span className="text-sm sm:text-base font-semibold text-[#191C1C]">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#6F7978] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#006A6A]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-[#3D5A57] leading-relaxed border-t border-[#D8DFDE] pt-3 bg-white">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

import React, { useState } from 'react';
import { Trophy, Calendar, MapPin, Users, Award, CheckCircle, ArrowRight, ShieldAlert } from 'lucide-react';
import { TOURNAMENTS } from '../data/mockData';
import { Tournament } from '../types';
import { formatRupiah } from '../utils/formatters';

interface TournamentsSectionProps {
  onNotify: (msg: string) => void;
}

export const TournamentsSection: React.FC<TournamentsSectionProps> = ({ onNotify }) => {
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [teamName, setTeamName] = useState('Jakarta Smashers');
  const [player1, setPlayer1] = useState('Rangga Panitis');
  const [player2, setPlayer2] = useState('Aldo Kusuma');
  const [whatsapp, setWhatsapp] = useState('081299887766');

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTournament) return;
    onNotify(
      `Pendaftaran Tim "${teamName}" untuk turnamen "${selectedTournament.title}" berhasil diajukan! Panitia akan mengirimkan panduan drawing & technical meeting ke WhatsApp Anda.`
    );
    setSelectedTournament(null);
  };

  return (
    <section id="tournaments" className="py-12 lg:py-20 border-b border-[#D8DFDE] bg-[#F6FAF9] text-[#191C1C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="text-xs font-semibold text-[#006A6A] tracking-wider uppercase mb-1">
            Turnamen & Liga Komunitas
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#191C1C] tracking-tight font-display">
            Kompetisi Resmi & Social Americano
          </h2>
          <p className="text-sm sm:text-base text-[#3D5A57] mt-2">
            Uji kemampuan Anda di kejuaraan padel resmi atau ikuti Friday Night Americano untuk suasana santai penuh networking dan hadiah menarik.
          </p>
        </div>

        {/* Tournaments Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {TOURNAMENTS.map((t) => {
            const isFull = t.registeredTeams >= t.maxTeams;

            return (
              <div
                key={t.id}
                className="rounded-2xl border border-[#D8DFDE] bg-white p-6 flex flex-col justify-between hover:border-[#006A6A]/50 transition-all group shadow-xs"
              >
                <div className="space-y-4">
                  {/* Status & Category */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#006A6A] font-bold">{t.category}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        t.status === 'Almost Full'
                          ? 'bg-[#6E4D8B]/15 text-[#6E4D8B] border border-[#6E4D8B]/30'
                          : 'bg-[#006A6A]/10 text-[#006A6A] border border-[#006A6A]/30'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-extrabold text-[#191C1C] group-hover:text-[#006A6A] transition-colors font-display">
                      {t.title}
                    </h3>
                    <p className="text-xs text-[#3D5A57] mt-1">{t.subtitle}</p>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-1.5 text-xs text-[#191C1C]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#006A6A]" />
                      <span className="text-[#3D5A57]">{t.dateRange}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#006A6A]" />
                      <span className="text-[#3D5A57]">{t.locationName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-[#6E4D8B]" />
                      <span className="text-[#6E4D8B] font-bold">Total Hadiah: {t.prizePool}</span>
                    </div>
                  </div>

                  {/* Slots progress bar */}
                  <div className="space-y-1 pt-2">
                    <div className="flex justify-between text-[11px] text-[#6F7978]">
                      <span>Kuota Slot Tim:</span>
                      <span className="font-mono text-[#191C1C] font-semibold">
                        {t.registeredTeams} / {t.maxTeams} Tim
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-[#EEF4F3] rounded-full overflow-hidden border border-[#D8DFDE]">
                      <div
                        className="h-full bg-gradient-to-r from-[#006A6A] to-[#4CDAD8]"
                        style={{ width: `${(t.registeredTeams / t.maxTeams) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="pt-6 mt-6 border-t border-[#D8DFDE] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#6F7978] uppercase font-mono block">Biaya Registrasi</span>
                    <span className="text-sm font-bold text-[#006A6A] font-mono">
                      {formatRupiah(t.registrationFee)} / tim
                    </span>
                  </div>

                  <button
                    disabled={isFull}
                    onClick={() => setSelectedTournament(t)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isFull
                        ? 'bg-[#EEF4F3] text-[#6F7978] cursor-not-allowed border border-[#D8DFDE]'
                        : 'bg-[#006A6A] hover:bg-[#007A7C] text-white shadow-md shadow-[#006A6A]/20'
                    }`}
                  >
                    <span>{isFull ? 'Slot Penuh' : 'Daftar Turnamen'}</span>
                    {!isFull && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Registration Modal */}
      {selectedTournament && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-[#D8DFDE] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#D8DFDE] pb-3">
              <div>
                <span className="text-xs uppercase text-[#006A6A] font-bold">Registrasi Turnamen</span>
                <h3 className="text-base font-bold text-[#191C1C] font-display">{selectedTournament.title}</h3>
              </div>
              <button
                onClick={() => setSelectedTournament(null)}
                className="text-[#6F7978] hover:text-[#191C1C]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-[#191C1C] font-medium block mb-1">Nama Tim / Pasangan:</label>
                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F6FAF9] border border-[#D8DFDE] text-[#191C1C] focus:outline-none focus:border-[#006A6A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[#191C1C] font-medium block mb-1">Pemain 1 (Kapten):</label>
                  <input
                    type="text"
                    required
                    value={player1}
                    onChange={(e) => setPlayer1(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F6FAF9] border border-[#D8DFDE] text-[#191C1C] focus:outline-none focus:border-[#006A6A]"
                  />
                </div>
                <div>
                  <label className="text-[#191C1C] font-medium block mb-1">Pemain 2 (Partner):</label>
                  <input
                    type="text"
                    required
                    value={player2}
                    onChange={(e) => setPlayer2(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F6FAF9] border border-[#D8DFDE] text-[#191C1C] focus:outline-none focus:border-[#006A6A]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#191C1C] font-medium block mb-1">Nomor WhatsApp Tim (Drawing & TM):</label>
                <input
                  type="tel"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F6FAF9] border border-[#D8DFDE] text-[#191C1C] focus:outline-none focus:border-[#006A6A]"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#F6FAF9] border border-[#D8DFDE] flex items-center justify-between text-xs">
                <span className="text-[#6F7978]">Biaya Masuk:</span>
                <span className="font-bold text-[#006A6A] font-mono">
                  {formatRupiah(selectedTournament.registrationFee)} / tim
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#006A6A] hover:bg-[#007A7C] text-white font-semibold transition-colors mt-2 shadow-md shadow-[#006A6A]/20"
              >
                Kirim Pendaftaran Tim
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

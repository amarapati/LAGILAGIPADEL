import React, { useState } from 'react';
import { Users, Plus, MapPin, Clock, Calendar, Check, Star, Filter, Sparkles } from 'lucide-react';
import { OPEN_MATCHES, LOCATIONS } from '../data/mockData';
import { OpenMatch } from '../types';
import { formatRupiah } from '../utils/formatters';

interface OpenMatchesProps {
  onNotify: (msg: string) => void;
}

export const OpenMatches: React.FC<OpenMatchesProps> = ({ onNotify }) => {
  const [matches, setMatches] = useState<OpenMatch[]>(OPEN_MATCHES);
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [joinModalMatch, setJoinModalMatch] = useState<OpenMatch | null>(null);

  // Join form state
  const [playerName, setPlayerName] = useState('Rangga');
  const [playerLevel, setPlayerLevel] = useState('2.5');

  // Create match form state
  const [newTitle, setNewTitle] = useState('Social Doubles Fun Rally');
  const [newLocation, setNewLocation] = useState('LagiLagiPadel Kemang');
  const [newCourt, setNewCourt] = useState('Court 1 — Iconic Pink Court');
  const [newDate, setNewDate] = useState('Besok Sore');
  const [newTime, setNewTime] = useState('18:00 - 20:00');
  const [newLevel, setNewLevel] = useState('Level 2.0 - 3.0 (Intermediate)');
  const [newCost, setNewCost] = useState('125000');
  const [newNotes, setNewNotes] = useState('Cari 3 teman main santai tapi rally aktif!');

  const filteredMatches = matches.filter((m) => {
    if (selectedLevelFilter === 'beginner') return m.levelNumeric < 2.5;
    if (selectedLevelFilter === 'intermediate') return m.levelNumeric >= 2.5 && m.levelNumeric < 3.8;
    if (selectedLevelFilter === 'advanced') return m.levelNumeric >= 3.8;
    return true;
  });

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinModalMatch) return;

    setMatches((prev) =>
      prev.map((m) => {
        if (m.id === joinModalMatch.id) {
          if (m.bookedSlots >= m.totalSlots) return m;
          const updatedPlayers = [...m.players, { name: playerName, level: parseFloat(playerLevel) }];
          return {
            ...m,
            bookedSlots: m.bookedSlots + 1,
            players: updatedPlayers
          };
        }
        return m;
      })
    );

    onNotify(`Berhasil bergabung ke match "${joinModalMatch.title}"! Sampai jumpa di lapangan.`);
    setJoinModalMatch(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMatch: OpenMatch = {
      id: `match-${Date.now()}`,
      title: newTitle,
      locationName: newLocation,
      courtName: newCourt,
      date: newDate,
      time: newTime,
      duration: '2 Jam',
      matchType: 'Friendly Doubles',
      targetLevel: newLevel,
      levelNumeric: 2.5,
      hostName: playerName || 'Anda (Host)',
      hostAvatar: '',
      costPerPlayer: parseInt(newCost) || 125000,
      totalSlots: 4,
      bookedSlots: 1,
      players: [{ name: playerName || 'Anda (Host)', level: 2.5 }],
      notes: newNotes
    };

    setMatches([newMatch, ...matches]);
    setCreateModalOpen(false);
    onNotify('Open Match berhasil dibuat! Pemain lain dapat melihat dan bergabung.');
  };

  return (
    <section id="open-matches" className="py-12 lg:py-20 border-b border-[#D8DFDE] bg-[#F6FAF9] text-[#191C1C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-semibold text-[#006A6A] tracking-wider uppercase mb-1">
              Komunitas & Matchmaking
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#191C1C] tracking-tight font-display">
              Open Matches
            </h2>
            <p className="text-sm text-[#3D5A57] mt-1 max-w-xl">
              Cari kawan bermain atau lengkapi tim 4 orang Anda. Biaya sewa lapangan otomatis dibagi rata antar pemain.
            </p>
          </div>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#006A6A] hover:bg-[#007A7C] text-white text-xs sm:text-sm font-semibold shadow-md shadow-[#006A6A]/20 transition-all cursor-pointer flex items-center gap-2 self-start md:self-auto"
          >
            <Plus className="w-4 h-4 text-[#A4F2F2]" />
            <span>Buat Open Match Baru</span>
          </button>
        </div>

        {/* Level Filters (Interactive Segmented Control) */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-[#D8DFDE] rounded-xl max-w-md mb-6 shadow-xs">
          <button
            onClick={() => setSelectedLevelFilter('all')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
              selectedLevelFilter === 'all'
                ? 'bg-[#006A6A] text-white shadow-xs'
                : 'text-[#3D5A57] hover:text-[#191C1C]'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setSelectedLevelFilter('beginner')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
              selectedLevelFilter === 'beginner'
                ? 'bg-[#006A6A] text-white shadow-xs'
                : 'text-[#3D5A57] hover:text-[#191C1C]'
            }`}
          >
            Pemula (1.0-2.0)
          </button>
          <button
            onClick={() => setSelectedLevelFilter('intermediate')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
              selectedLevelFilter === 'intermediate'
                ? 'bg-[#006A6A] text-white shadow-xs'
                : 'text-[#3D5A57] hover:text-[#191C1C]'
            }`}
          >
            Menengah (2.5-3.5)
          </button>
          <button
            onClick={() => setSelectedLevelFilter('advanced')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
              selectedLevelFilter === 'advanced'
                ? 'bg-[#006A6A] text-white shadow-xs'
                : 'text-[#3D5A57] hover:text-[#191C1C]'
            }`}
          >
            Mahir (4.0+)
          </button>
        </div>

        {/* Matches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMatches.map((match) => {
            const availableSlots = match.totalSlots - match.bookedSlots;
            const isFull = availableSlots <= 0;

            return (
              <div
                key={match.id}
                className="p-5 rounded-2xl bg-white border border-[#D8DFDE] hover:border-[#006A6A]/60 transition-all flex flex-col justify-between shadow-xs"
              >
                <div>
                  {/* Top Bar: Target Level & Match Type */}
                  <div className="flex items-center justify-between gap-2 mb-2 text-xs">
                    <span className="text-[#006A6A] font-bold">{match.targetLevel}</span>
                    <span className="text-[#6F7978] font-mono text-[11px]">{match.matchType}</span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-[#191C1C] mb-1 font-display">
                    {match.title}
                  </h3>

                  {/* Location & Time metadata */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#3D5A57] mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#006A6A]" />
                      {match.locationName} ({match.courtName})
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#6F7978]" />
                      {match.date}, {match.time}
                    </span>
                  </div>

                  {match.notes && (
                    <p className="text-xs text-[#3D5A57] bg-[#F6FAF9] p-2.5 rounded-xl border border-[#D8DFDE] mb-4">
                      "{match.notes}"
                    </p>
                  )}

                  {/* Players list avatars / names */}
                  <div className="space-y-1.5 mb-4">
                    <div className="text-[11px] text-[#6F7978] uppercase font-mono font-semibold">
                      Pemain Terdaftar ({match.bookedSlots}/{match.totalSlots}):
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {match.players.map((p, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-[#F6FAF9] text-[#191C1C] text-xs border border-[#D8DFDE] flex items-center gap-1"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#006A6A]" />
                          <span className="font-medium">{p.name}</span>
                          <span className="text-[10px] text-[#6F7978] font-mono">
                            (Lv {p.level})
                          </span>
                        </span>
                      ))}
                      {Array.from({ length: availableSlots }).map((_, idx) => (
                        <span
                          key={`empty-${idx}`}
                          className="px-2.5 py-1 rounded-lg border border-dashed border-[#D8DFDE] text-[#6F7978] text-xs flex items-center gap-1 bg-white"
                        >
                          <span>Slot Kosong #{idx + 1}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Bar: Price per player & Join Button */}
                <div className="pt-3 border-t border-[#D8DFDE] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#6F7978] uppercase block font-mono">
                      Patungan / Orang
                    </span>
                    <span className="text-base font-extrabold text-[#006A6A] font-mono">
                      {formatRupiah(match.costPerPlayer)}
                    </span>
                  </div>

                  <button
                    disabled={isFull}
                    onClick={() => setJoinModalMatch(match)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isFull
                        ? 'bg-[#EEF4F3] border border-[#D8DFDE] text-[#6F7978] cursor-not-allowed'
                        : 'bg-[#006A6A] hover:bg-[#007A7C] text-white shadow-md shadow-[#006A6A]/20'
                    }`}
                  >
                    {isFull ? 'Slot Penuh' : `Gabung (${availableSlots} Spot Tersisa)`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Join Match Modal */}
      {joinModalMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-[#D8DFDE] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#D8DFDE] pb-3">
              <h3 className="text-base font-bold text-[#191C1C] font-display">Gabung Open Match</h3>
              <button
                onClick={() => setJoinModalMatch(null)}
                className="text-[#6F7978] hover:text-[#191C1C]"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#F6FAF9] border border-[#D8DFDE] text-xs space-y-1">
              <div className="font-semibold text-[#191C1C]">{joinModalMatch.title}</div>
              <div className="text-[#3D5A57]">{joinModalMatch.courtName} · {joinModalMatch.date} ({joinModalMatch.time})</div>
              <div className="text-[#006A6A] font-mono font-bold">
                Tarif patungan: {formatRupiah(joinModalMatch.costPerPlayer)}
              </div>
            </div>

            <form onSubmit={handleJoinSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[#191C1C] block mb-1">Nama Anda:</label>
                <input
                  type="text"
                  required
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F6FAF9] border border-[#D8DFDE] text-sm text-[#191C1C] focus:outline-none focus:border-[#006A6A]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#191C1C] block mb-1">Estimasi Level Anda (1.0 - 5.0):</label>
                <select
                  value={playerLevel}
                  onChange={(e) => setPlayerLevel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F6FAF9] border border-[#D8DFDE] text-sm text-[#191C1C] focus:outline-none focus:border-[#006A6A]"
                >
                  <option value="1.5">Level 1.5 (Pemula / Baru belajar)</option>
                  <option value="2.5">Level 2.5 (Bisa rally konsisten)</option>
                  <option value="3.0">Level 3.0 (Intermediate / Paham pantulan kaca)</option>
                  <option value="3.5">Level 3.5 (Vibora / Bandeja aktif)</option>
                  <option value="4.0">Level 4.0+ (Advance / Kompetisi)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#006A6A] hover:bg-[#007A7C] text-white font-semibold text-xs transition-colors shadow-md shadow-[#006A6A]/20"
              >
                Konfirmasi Bergabung & Simpan Spot
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create New Match Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white border border-[#D8DFDE] rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#D8DFDE] pb-3">
              <h3 className="text-base font-bold text-[#191C1C] font-display">Buat Open Match Baru</h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-[#6F7978] hover:text-[#191C1C]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[#191C1C] font-medium block mb-1">Judul Match:</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F6FAF9] border border-[#D8DFDE] text-[#191C1C] focus:outline-none focus:border-[#006A6A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[#191C1C] font-medium block mb-1">Lokasi Klub:</label>
                  <select
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F6FAF9] border border-[#D8DFDE] text-[#191C1C] focus:outline-none focus:border-[#006A6A]"
                  >
                    <option value="LagiLagiPadel Kemang">LagiLagiPadel Kemang</option>
                    <option value="LagiLagiPadel Satrio Club">LagiLagiPadel Satrio Club</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#191C1C] font-medium block mb-1">Pilihan Lapangan:</label>
                  <select
                    value={newCourt}
                    onChange={(e) => setNewCourt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F6FAF9] border border-[#D8DFDE] text-[#191C1C] focus:outline-none focus:border-[#006A6A]"
                  >
                    <option value="Court 1 — Iconic Pink Court">Court 1 — Iconic Pink Court</option>
                    <option value="Court 2 — Center Court">Court 2 — Center Court</option>
                    <option value="Satrio Court 1 (Indoor Arena)">Satrio Court 1 (Indoor Arena)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[#191C1C] font-medium block mb-1">Tanggal Main:</label>
                  <input
                    type="text"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    placeholder="Contoh: Besok Malam"
                    className="w-full px-3 py-2 rounded-xl bg-[#F6FAF9] border border-[#D8DFDE] text-[#191C1C] focus:outline-none focus:border-[#006A6A]"
                  />
                </div>
                <div>
                  <label className="text-[#191C1C] font-medium block mb-1">Jam Main:</label>
                  <input
                    type="text"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="Contoh: 19:00 - 21:00"
                    className="w-full px-3 py-2 rounded-xl bg-[#F6FAF9] border border-[#D8DFDE] text-[#191C1C] focus:outline-none focus:border-[#006A6A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[#191C1C] font-medium block mb-1">Target Kemahiran (Level):</label>
                  <input
                    type="text"
                    required
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F6FAF9] border border-[#D8DFDE] text-[#191C1C] focus:outline-none focus:border-[#006A6A]"
                  />
                </div>
                <div>
                  <label className="text-[#191C1C] font-medium block mb-1">Tarif Patungan / Orang (Rp):</label>
                  <input
                    type="number"
                    required
                    value={newCost}
                    onChange={(e) => setNewCost(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F6FAF9] border border-[#D8DFDE] text-[#191C1C] focus:outline-none focus:border-[#006A6A]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#191C1C] font-medium block mb-1">Catatan Tambahan untuk Pemain:</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F6FAF9] border border-[#D8DFDE] text-[#191C1C] focus:outline-none focus:border-[#006A6A]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#006A6A] hover:bg-[#007A7C] text-white font-semibold transition-colors mt-2 shadow-md shadow-[#006A6A]/20"
              >
                Terbitkan Open Match ke Komunitas
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

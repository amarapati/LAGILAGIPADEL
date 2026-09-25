import React, { useState } from 'react';
import { Award, Star, Clock, Calendar, CheckCircle2, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';
import { COACHES } from '../data/mockData';
import { Coach } from '../types';
import { formatRupiah } from '../utils/formatters';

interface AcademySectionProps {
  onNotify: (msg: string) => void;
}

export const AcademySection: React.FC<AcademySectionProps> = ({ onNotify }) => {
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [sessionType, setSessionType] = useState<'private' | 'semi' | 'clinic'>('private');
  const [sessionDate, setSessionDate] = useState('Sabtu Depan');
  const [sessionTime, setSessionTime] = useState('08:00 - 09:30');
  const [studentName, setStudentName] = useState('Rangga Panitis');

  const programs = [
    {
      title: 'Private 1-on-1 Coaching',
      duration: '60 – 90 Menit',
      desc: 'Kurikulum personal fokus pada biomekanika pukulan, pantulan kaca (rebote de cristal), bandeja, vibora, dan konsistensi servis.',
      idealFor: 'Pemain pemula yang ingin cepat mahir atau kompetitor turnamen.'
    },
    {
      title: 'Semi-Private (2 Pemain)',
      duration: '90 Menit',
      desc: 'Latihan intensif berdua bersama partner doubles Anda. Memperdalam koordinasi komunikasi, rotasi posisi, dan taktik menyerang jaring.',
      idealFor: 'Pasangan doubles atau dua teman dengan level setara.'
    },
    {
      title: 'Group Clinics (4 Pemain)',
      duration: '90 Menit',
      desc: 'Sesi latihan grup berenergi tinggi dengan rangkaian drill rally dinamis, match play mini, dan bimbingan langsung dari coach.',
      idealFor: 'Belajar padel seru sekaligus bersosialisasi dengan komunitas.'
    },
    {
      title: 'Junior Padel Academy (Usia 8-16)',
      duration: 'Program Semesteran',
      desc: 'Pengembangan atlet muda Indonesia dengan kurikulum resmi Federasi Padel Internasional (FIP), penguatan koordinasi mata-tangan dan sportivitas.',
      idealFor: 'Anak-anak dan remaja calon atlet masa depan.'
    }
  ];

  const handleBookCoachSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoach) return;
    onNotify(
      `Permintaan coaching bersama ${selectedCoach.name} untuk tanggal ${sessionDate} jam ${sessionTime} telah dicatat! Admin akademi akan menghubungi via WhatsApp.`
    );
    setSelectedCoach(null);
  };

  return (
    <section id="academy" className="py-12 lg:py-20 border-b border-[#D8DFDE] bg-[#F6FAF9] text-[#191C1C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top Header */}
        <div className="max-w-3xl mb-12">
          <div className="text-xs font-semibold text-[#006A6A] tracking-wider uppercase mb-1">
            LagiLagiPadel Academy Indonesia
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#191C1C] tracking-tight font-display">
            Tingkatkan Permainan Anda Bersama Pelatih Berlisensi FIP
          </h2>
          <p className="text-sm sm:text-base text-[#3D5A57] mt-2">
            Dari pukulan pertama hingga strategi turnamen tingkat tinggi. Pelatih kami tersertifikasi dari federasi Spanyol & internasional siap membantu Anda menguasai teknik padel seutuhnya.
          </p>
        </div>

        {/* Marquee Visual & Programs Bento */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16">
          <div className="lg:col-span-5 relative rounded-2xl overflow-hidden border border-[#D8DFDE] bg-white shadow-md">
            <img
              src="/src/assets/images/padel_academy_coach_1790169870001.jpg"
              alt="LagiLagiPadel Academy Coaching"
              className="w-full h-80 sm:h-96 object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-white/95 backdrop-blur-md border border-[#D8DFDE] shadow-sm">
              <span className="text-xs font-bold text-[#191C1C] block font-display">Official Development Pathway</span>
              <span className="text-[11px] text-[#3D5A57]">
                LagiLagiPadel melatih lebih dari 650+ pemain setiap bulannya di Jakarta.
              </span>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {programs.map((prog, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-white border border-[#D8DFDE] hover:border-[#006A6A]/50 transition-all flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="text-[11px] font-mono text-[#006A6A] mb-1 font-semibold">
                    0{idx + 1}. {prog.duration}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-[#191C1C] mb-1.5 font-display">
                    {prog.title}
                  </h3>
                  <p className="text-xs text-[#3D5A57] leading-relaxed mb-3">
                    {prog.desc}
                  </p>
                </div>
                <div className="pt-2 border-t border-[#D8DFDE] text-[11px] text-[#6F7978]">
                  <span className="text-[#191C1C] font-semibold">Cocok untuk:</span> {prog.idealFor}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coaches Roster */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#191C1C] font-display">
                Profil Pelatih Resmi
              </h3>
              <p className="text-xs text-[#3D5A57] mt-0.5">
                Pilih coach dan jadwalkan sesi private maupun semi-private Anda.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {COACHES.map((coach) => (
              <div
                key={coach.id}
                className="rounded-2xl border border-[#D8DFDE] bg-white p-5 flex flex-col justify-between hover:border-[#006A6A]/50 transition-all group shadow-xs"
              >
                <div>
                  {/* Coach Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={coach.imageUrl}
                      alt={coach.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-[#006A6A]"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="text-base font-bold text-[#191C1C] group-hover:text-[#006A6A] transition-colors font-display">
                        {coach.name}
                      </h4>
                      <p className="text-xs text-[#3D5A57]">{coach.role}</p>
                      <div className="flex items-center gap-1 text-[11px] text-[#6E4D8B] mt-0.5">
                        <Star className="w-3 h-3 fill-[#6E4D8B]" />
                        <span className="font-bold">{coach.rating}</span>
                        <span className="text-[#6F7978]">({coach.reviewsCount} ulasan)</span>
                      </div>
                    </div>
                  </div>

                  {/* Cert & Bio */}
                  <div className="space-y-2 mb-4 text-xs text-[#191C1C]">
                    <div className="p-2 rounded-lg bg-[#F6FAF9] border border-[#D8DFDE] text-[11px] text-[#3D5A57]">
                      <span className="text-[#006A6A] font-semibold">Sertifikasi:</span> {coach.certification}
                    </div>
                    <p className="text-[#3D5A57] leading-relaxed line-clamp-3">
                      {coach.bio}
                    </p>
                  </div>

                  {/* Specialties */}
                  <div className="space-y-1 mb-4">
                    <span className="text-[10px] text-[#6F7978] uppercase font-mono font-semibold">Spesialisasi:</span>
                    <div className="flex flex-wrap gap-1">
                      {coach.specialty.map((sp, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-[#F6FAF9] text-[#191C1C] text-[11px] border border-[#D8DFDE]"
                        >
                          {sp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Pricing & Booking */}
                <div className="pt-4 border-t border-[#D8DFDE] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#6F7978] uppercase font-mono block">Tarif Coaching</span>
                    <span className="text-sm font-bold text-[#006A6A] font-mono">
                      {formatRupiah(coach.hourlyRate)}/jam
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedCoach(coach)}
                    className="px-3.5 py-2 rounded-xl bg-[#006A6A] hover:bg-[#007A7C] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-[#A4F2F2]" />
                    <span>Booking Sesi</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Book Coach Modal */}
      {selectedCoach && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-[#D8DFDE] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#D8DFDE] pb-3">
              <div>
                <span className="text-xs uppercase text-[#006A6A] font-bold">Booking Coaching</span>
                <h3 className="text-base font-bold text-[#191C1C] font-display">{selectedCoach.name}</h3>
              </div>
              <button
                onClick={() => setSelectedCoach(null)}
                className="text-[#6F7978] hover:text-[#191C1C]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBookCoachSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-[#191C1C] font-medium block mb-1">Nama Pemain / Siswa:</label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F6FAF9] border border-[#D8DFDE] text-[#191C1C] focus:outline-none focus:border-[#006A6A]"
                />
              </div>

              <div>
                <label className="text-[#191C1C] font-medium block mb-1">Pilihan Format Sesi:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSessionType('private')}
                    className={`py-2 px-1 text-center rounded-xl border text-xs font-semibold ${
                      sessionType === 'private'
                        ? 'bg-[#006A6A] border-[#006A6A] text-white shadow-xs'
                        : 'bg-[#F6FAF9] border-[#D8DFDE] text-[#3D5A57]'
                    }`}
                  >
                    Private (1-on-1)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSessionType('semi')}
                    className={`py-2 px-1 text-center rounded-xl border text-xs font-semibold ${
                      sessionType === 'semi'
                        ? 'bg-[#006A6A] border-[#006A6A] text-white shadow-xs'
                        : 'bg-[#F6FAF9] border-[#D8DFDE] text-[#3D5A57]'
                    }`}
                  >
                    Semi (2 Orang)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSessionType('clinic')}
                    className={`py-2 px-1 text-center rounded-xl border text-xs font-semibold ${
                      sessionType === 'clinic'
                        ? 'bg-[#006A6A] border-[#006A6A] text-white shadow-xs'
                        : 'bg-[#F6FAF9] border-[#D8DFDE] text-[#3D5A57]'
                    }`}
                  >
                    Clinic (Grup)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[#191C1C] font-medium block mb-1">Estimasi Tanggal:</label>
                  <input
                    type="text"
                    required
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    placeholder="Contoh: Sabtu Depan"
                    className="w-full px-3 py-2 rounded-xl bg-[#F6FAF9] border border-[#D8DFDE] text-[#191C1C] focus:outline-none focus:border-[#006A6A]"
                  />
                </div>
                <div>
                  <label className="text-[#191C1C] font-medium block mb-1">Jam yang Diinginkan:</label>
                  <input
                    type="text"
                    required
                    value={sessionTime}
                    onChange={(e) => setSessionTime(e.target.value)}
                    placeholder="Contoh: 08:00 - 09:30"
                    className="w-full px-3 py-2 rounded-xl bg-[#F6FAF9] border border-[#D8DFDE] text-[#191C1C] focus:outline-none focus:border-[#006A6A]"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F6FAF9] border border-[#D8DFDE] flex items-center justify-between text-xs">
                <span className="text-[#6F7978]">Estimasi Biaya Coaching:</span>
                <span className="font-bold text-[#006A6A] font-mono">
                  {formatRupiah(selectedCoach.hourlyRate)} / jam
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#006A6A] hover:bg-[#007A7C] text-white font-semibold transition-colors mt-2 shadow-md shadow-[#006A6A]/20"
              >
                Ajukan Jadwal Coaching
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

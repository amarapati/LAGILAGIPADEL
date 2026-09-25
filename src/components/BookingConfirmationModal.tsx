import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  QrCode,
  CreditCard,
  Building,
  Share2,
  Copy,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { BookingReservation, Court, AddOnOption } from '../types';
import { formatRupiah } from '../utils/formatters';
import { LOCATIONS } from '../data/mockData';

interface BookingConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingDraft: {
    locationId: string;
    court: Court;
    date: string;
    startTime: string;
    durationMinutes: number;
    hourlyRate: number;
    courtPrice: number;
    addOns: { item: AddOnOption; count: number }[];
    totalPrice: number;
  } | null;
  onSaveConfirmedBooking: (reservation: BookingReservation) => void;
}

export const BookingConfirmationModal: React.FC<BookingConfirmationModalProps> = ({
  isOpen,
  onClose,
  bookingDraft,
  onSaveConfirmedBooking
}) => {
  const [step, setStep] = useState<'checkout' | 'confirmed'>('checkout');
  const [playerName, setPlayerName] = useState('Rangga Panitis');
  const [playerEmail, setPlayerEmail] = useState('ranggapanitis94@gmail.com');
  const [playerPhone, setPlayerPhone] = useState('081299887766');
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'va' | 'card'>('qris');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedReservation, setConfirmedReservation] = useState<BookingReservation | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !bookingDraft) return null;

  const locationObj = LOCATIONS.find((l) => l.id === bookingDraft.locationId) || LOCATIONS[0];

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate instant payment gateway handshake
    setTimeout(() => {
      const generatedId = `LLP-${Math.floor(100000 + Math.random() * 900000)}`;
      const newReservation: BookingReservation = {
        id: generatedId,
        location: locationObj,
        court: bookingDraft.court,
        date: bookingDraft.date,
        startTime: bookingDraft.startTime,
        durationMinutes: bookingDraft.durationMinutes,
        totalPrice: bookingDraft.totalPrice,
        playerName,
        playerEmail,
        playerPhone,
        addOns: bookingDraft.addOns,
        status: 'confirmed',
        paymentMethod,
        createdAt: new Date().toISOString()
      };

      setConfirmedReservation(newReservation);
      onSaveConfirmedBooking(newReservation);
      setIsProcessing(false);
      setStep('confirmed');
    }, 1000);
  };

  const copyBookingRef = () => {
    if (confirmedReservation) {
      navigator.clipboard.writeText(confirmedReservation.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getWhatsAppShareLink = () => {
    if (!confirmedReservation) return '#';
    const text = encodeURIComponent(
      `Halo LagiLagiPadel! Saya telah memesan lapangan di ${confirmedReservation.location.name}.\n` +
      `Booking ID: ${confirmedReservation.id}\n` +
      `Lapangan: ${confirmedReservation.court.name}\n` +
      `Tanggal: ${confirmedReservation.date} jam ${confirmedReservation.startTime}\n` +
      `Durasi: ${confirmedReservation.durationMinutes} menit\n` +
      `Total: ${formatRupiah(confirmedReservation.totalPrice)}\n` +
      `Atas Nama: ${confirmedReservation.playerName}`
    );
    return `https://wa.me/6281188997233?text=${text}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white border border-[#D8DFDE] text-[#191C1C] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D8DFDE] bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#006A6A] flex items-center justify-center font-black text-white text-xs shadow-xs">
              LLP
            </div>
            <div>
              <h3 className="text-base font-bold text-[#191C1C] font-display">
                {step === 'checkout' ? 'Konfirmasi Pembayaran Lapangan' : 'E-Ticket Digital Resmi'}
              </h3>
              <p className="text-[11px] text-[#6F7978]">
                {step === 'checkout' ? 'Instan settlement via QRIS / VA' : 'Simpan & tunjukkan barcode di gate masuk'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#6F7978] hover:text-[#191C1C] hover:bg-[#EEF4F3] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {step === 'checkout' ? (
            <form onSubmit={handlePay} className="space-y-5">
              {/* Order quick overview */}
              <div className="p-4 rounded-xl bg-[#F6FAF9] border border-[#D8DFDE] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#006A6A]">{locationObj.name}</span>
                  <span className="text-xs font-mono font-bold text-[#191C1C]">
                    {formatRupiah(bookingDraft.totalPrice)}
                  </span>
                </div>
                <div className="text-sm font-bold text-[#191C1C] font-display">
                  {bookingDraft.court.name}
                </div>
                <div className="flex items-center gap-4 text-xs text-[#3D5A57]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#006A6A]" />
                    {bookingDraft.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#006A6A]" />
                    {bookingDraft.startTime} ({bookingDraft.durationMinutes} Menit)
                  </span>
                </div>
              </div>

              {/* Player Details */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-[#191C1C]">
                  Data Penanggung Jawab Lapangan:
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    placeholder="Nama Lengkap Pemain"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D8DFDE] text-sm text-[#191C1C] placeholder-[#6F7978] focus:outline-none focus:border-[#006A6A]"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="tel"
                      required
                      placeholder="Nomor WhatsApp (08xxx)"
                      value={playerPhone}
                      onChange={(e) => setPlayerPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D8DFDE] text-sm text-[#191C1C] placeholder-[#6F7978] focus:outline-none focus:border-[#006A6A]"
                    />
                    <input
                      type="email"
                      required
                      placeholder="Alamat Email"
                      value={playerEmail}
                      onChange={(e) => setPlayerEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D8DFDE] text-sm text-[#191C1C] placeholder-[#6F7978] focus:outline-none focus:border-[#006A6A]"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-[#191C1C]">
                  Pilih Metode Pembayaran Instan:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('qris')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'qris'
                        ? 'bg-[#EEF4F3] border-[#006A6A] text-[#006A6A] ring-2 ring-[#006A6A]/20 shadow-xs'
                        : 'bg-white border-[#D8DFDE] text-[#6F7978] hover:text-[#191C1C]'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-[#006A6A]" />
                    <span className="text-xs font-bold">QRIS Instant</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('va')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'va'
                        ? 'bg-[#F3DAFF]/40 border-[#6E4D8B] text-[#6E4D8B] ring-2 ring-[#6E4D8B]/20 shadow-xs'
                        : 'bg-white border-[#D8DFDE] text-[#6F7978] hover:text-[#191C1C]'
                    }`}
                  >
                    <Building className="w-5 h-5 text-[#6E4D8B]" />
                    <span className="text-xs font-bold">BCA / Mandiri</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'card'
                        ? 'bg-[#EEF4F3] border-[#006A6A] text-[#006A6A] ring-2 ring-[#006A6A]/20 shadow-xs'
                        : 'bg-white border-[#D8DFDE] text-[#6F7978] hover:text-[#191C1C]'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-[#006A6A]" />
                    <span className="text-xs font-bold">Kartu Debit</span>
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 px-4 rounded-xl bg-[#006A6A] hover:bg-[#007A7C] active:bg-[#005252] text-white font-semibold text-sm shadow-md shadow-[#006A6A]/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Memproses Pembayaran...</span>
                  </div>
                ) : (
                  <>
                    <span>Bayar Sekarang ({formatRupiah(bookingDraft.totalPrice)})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center text-[11px] text-[#6F7978]">
                Dengan melanjutkan, Anda menyetujui kebijakan klub LagiLagiPadel.
              </div>
            </form>
          ) : (
            /* E-Ticket Display */
            <div className="space-y-5 animate-in zoom-in-95 duration-200">
              <div className="p-5 rounded-2xl bg-[#F6FAF9] border border-[#D8DFDE] relative overflow-hidden shadow-lg">
                {/* Visual Accent Strip using palette: Primary Teal to Tertiary Violet */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#006A6A] via-[#007A7C] to-[#6E4D8B]" />

                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-wider text-[#006A6A]">
                      LAGILAGIPADEL OFFICIAL PASS
                    </div>
                    <div className="text-xl font-black text-[#191C1C] font-display mt-0.5">
                      {confirmedReservation?.court.name}
                    </div>
                    <div className="text-xs text-[#3D5A57] mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#006A6A]" />
                      <span>{confirmedReservation?.location.name}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-[#6F7978] uppercase font-mono">Status</span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      CONFIRMED
                    </span>
                  </div>
                </div>

                {/* Perforated divider */}
                <div className="my-4 border-t border-dashed border-[#D8DFDE]" />

                {/* Ticket Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-[#6F7978] uppercase block font-mono">Tanggal</span>
                    <span className="font-bold text-[#191C1C]">{confirmedReservation?.date}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#6F7978] uppercase block font-mono">Waktu</span>
                    <span className="font-bold text-[#006A6A] font-mono">
                      {confirmedReservation?.startTime} ({confirmedReservation?.durationMinutes} Menit)
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#6F7978] uppercase block font-mono">Pemain</span>
                    <span className="font-bold text-[#191C1C] truncate block">
                      {confirmedReservation?.playerName}
                    </span>
                  </div>
                </div>

                {/* QR Code & Booking Ref */}
                <div className="mt-4 pt-4 border-t border-[#D8DFDE] flex items-center justify-between gap-4">
                  <div className="p-2 rounded-xl bg-white border border-[#D8DFDE] text-[#191C1C] shrink-0 shadow-xs">
                    <QrCode className="w-14 h-14" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <span className="text-[10px] text-[#6F7978] uppercase font-mono block">
                      Kode Reservasi (Booking ID):
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-[#191C1C] tracking-wider">
                        {confirmedReservation?.id}
                      </span>
                      <button
                        onClick={copyBookingRef}
                        className="text-[#6F7978] hover:text-[#191C1C] p-1 rounded hover:bg-[#EEF4F3]"
                        title="Salin Kode"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {copied && <span className="text-[10px] text-[#006A6A] font-bold">Tersalin!</span>}
                    <div className="text-[10px] text-[#6F7978]">
                      Tunjukkan barcode ini kepada resepsionis klub saat tiba.
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions for Confirmed Booking */}
              <div className="space-y-2">
                <a
                  href={getWhatsAppShareLink()}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-[#006A6A] hover:bg-[#007A7C] text-white font-semibold text-xs shadow-md shadow-[#006A6A]/20 transition-all flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4 text-white" />
                  <span>Kirim Konfirmasi Tiket ke WhatsApp</span>
                </a>

                <button
                  onClick={onClose}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#EEF4F3] hover:bg-[#D8DFDE] text-[#191C1C] font-semibold text-xs transition-colors border border-[#D8DFDE]"
                >
                  Tutup & Lihat Tiket di Menu Utama
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

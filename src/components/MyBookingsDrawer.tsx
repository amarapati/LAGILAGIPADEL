import React, { useState } from 'react';
import { X, Ticket, QrCode, MapPin, Calendar, Clock, Share2, AlertCircle, CheckCircle } from 'lucide-react';
import { BookingReservation } from '../types';
import { formatRupiah } from '../utils/formatters';

interface MyBookingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: BookingReservation[];
  onCancelBooking: (id: string) => void;
}

export const MyBookingsDrawer: React.FC<MyBookingsDrawerProps> = ({
  isOpen,
  onClose,
  bookings,
  onCancelBooking
}) => {
  const [selectedTicket, setSelectedTicket] = useState<BookingReservation | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#F6FAF9] border-l border-[#D8DFDE] h-full flex flex-col justify-between shadow-2xl text-[#191C1C]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D8DFDE] bg-white">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-[#006A6A]" />
            <h3 className="text-base font-bold text-[#191C1C]">Tiket & Booking Saya</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#6F7978] hover:text-[#191C1C] rounded-lg hover:bg-[#EEF4F3]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {bookings.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-12 h-12 rounded-full bg-white border border-[#D8DFDE] flex items-center justify-center mx-auto text-[#6F7978] shadow-xs">
                <Ticket className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-[#191C1C]">Belum Ada Tiket Booking</p>
              <p className="text-xs text-[#6F7978] max-w-xs mx-auto">
                Pilih jadwal dan booking lapangan favorit Anda di Kemang atau Satrio untuk melihat tiket digital di sini.
              </p>
            </div>
          ) : (
            bookings.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-white border border-[#D8DFDE] space-y-3 relative overflow-hidden shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#6F7978] uppercase">
                    ID: {item.id}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                    Aktif
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-[#191C1C]">{item.court.name}</h4>
                  <div className="text-xs text-[#6F7978] flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-[#006A6A]" />
                    <span>{item.location.name}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-[#D8DFDE]">
                  <div className="flex items-center gap-1.5 text-[#3D5A57]">
                    <Calendar className="w-3.5 h-3.5 text-[#006A6A]" />
                    <span>{item.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#3D5A57]">
                    <Clock className="w-3.5 h-3.5 text-[#006A6A]" />
                    <span>{item.startTime} ({item.durationMinutes}m)</span>
                  </div>
                </div>

                {item.addOns.length > 0 && (
                  <div className="text-[11px] text-[#6F7978] space-y-0.5">
                    <span className="font-semibold text-[#191C1C]">Tambahan: </span>
                    {item.addOns.map((add, idx) => (
                      <span key={idx}>
                        {add.item.name} ×{add.count}
                        {idx < item.addOns.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <div className="text-xs font-mono font-bold text-[#006A6A]">
                    {formatRupiah(item.totalPrice)}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedTicket(item)}
                      className="px-2.5 py-1 rounded-lg bg-[#EEF4F3] hover:bg-[#D8DFDE] text-[#006A6A] text-xs font-semibold cursor-pointer border border-[#D8DFDE]"
                    >
                      Buka QR
                    </button>
                    <button
                      onClick={() => onCancelBooking(item.id)}
                      className="text-[#6F7978] hover:text-red-600 text-xs cursor-pointer"
                      title="Batalkan Booking"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-[#D8DFDE] bg-white text-[11px] text-[#6F7978] text-center">
          Penyewaan dapat dibatalkan 24 jam sebelum jam main dengan pengembalian kredit 100%.
        </div>
      </div>

      {/* QR Code Popout Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white border border-[#D8DFDE] rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <h4 className="text-base font-bold text-[#191C1C]">Check-in Barcode</h4>
            <div className="p-4 bg-[#F6FAF9] border border-[#D8DFDE] rounded-xl inline-block mx-auto">
              <QrCode className="w-36 h-36 text-[#191C1C]" />
            </div>
            <div className="font-mono text-xs text-[#3D5A57]">
              Kode: <strong className="text-[#191C1C]">{selectedTicket.id}</strong>
            </div>
            <p className="text-xs text-[#6F7978]">
              {selectedTicket.court.name} · {selectedTicket.date} @ {selectedTicket.startTime}
            </p>
            <button
              onClick={() => setSelectedTicket(null)}
              className="w-full py-2 rounded-xl bg-[#006A6A] hover:bg-[#007A7C] text-white text-xs font-semibold cursor-pointer shadow-xs"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

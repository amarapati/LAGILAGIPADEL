import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  CheckCircle,
  Plus,
  Minus,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { LOCATIONS, COURTS, ADD_ONS } from '../data/mockData';
import { Court, AddOnOption } from '../types';
import { formatRupiah } from '../utils/formatters';

interface BookingSystemProps {
  selectedLocationId: string;
  onSelectLocationId: (locationId: string) => void;
  onProceedToCheckout: (draft: {
    locationId: string;
    court: Court;
    date: string;
    startTime: string;
    durationMinutes: number;
    hourlyRate: number;
    courtPrice: number;
    addOns: { item: AddOnOption; count: number }[];
    totalPrice: number;
  }) => void;
}

export const BookingSystem: React.FC<BookingSystemProps> = ({
  selectedLocationId,
  onSelectLocationId,
  onProceedToCheckout
}) => {
  // Calendar: next 7 dates
  const upcomingDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ];

    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push({
        isoDate: d.toISOString().split('T')[0],
        dayName: i === 0 ? 'Hari Ini' : i === 1 ? 'Besok' : dayNames[d.getDay()],
        dateNum: d.getDate(),
        monthName: monthNames[d.getMonth()]
      });
    }
    return dates;
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(upcomingDates[0].isoDate);
  const [selectedCourtId, setSelectedCourtId] = useState<string>('court-kemang-pink');
  const [durationMinutes, setDurationMinutes] = useState<number>(120);
  const [selectedTime, setSelectedTime] = useState<string>('19:00');
  const [selectedAddOns, setSelectedAddOns] = useState<{ [addonId: string]: number }>({
    'addon-racket-rental': 2,
    'addon-ball-tube': 1
  });

  // Filter courts by location
  const currentCourts = useMemo(() => {
    return COURTS.filter((c) => c.locationId === selectedLocationId);
  }, [selectedLocationId]);

  // When location changes, default to first court
  React.useEffect(() => {
    if (currentCourts.length > 0) {
      setSelectedCourtId(currentCourts[0].id);
    }
  }, [selectedLocationId, currentCourts]);

  const activeCourt = useMemo(() => {
    return currentCourts.find((c) => c.id === selectedCourtId) || currentCourts[0];
  }, [currentCourts, selectedCourtId]);

  // Determine time slots and pricing tier
  const timeSlots = useMemo(() => {
    const slots = [
      { time: '06:00', tier: 'off_peak' },
      { time: '07:00', tier: 'off_peak' },
      { time: '08:00', tier: 'off_peak' },
      { time: '09:00', tier: 'off_peak' },
      { time: '10:00', tier: 'off_peak' },
      { time: '11:00', tier: 'off_peak' },
      { time: '12:00', tier: 'standard' },
      { time: '13:00', tier: 'standard' },
      { time: '14:00', tier: 'standard' },
      { time: '15:00', tier: 'standard' },
      { time: '16:00', tier: 'standard' },
      { time: '17:00', tier: 'peak' },
      { time: '18:00', tier: 'peak' },
      { time: '19:00', tier: 'peak' },
      { time: '20:00', tier: 'peak' },
      { time: '21:00', tier: 'peak' },
      { time: '22:00', tier: 'peak' },
      { time: '23:00', tier: 'peak' }
    ];

    const bookedSet = new Set(['08:00', '18:00', '20:00']);

    return slots.map((s) => {
      let rate = activeCourt?.hourlyRateStandard || 400000;
      if (s.tier === 'off_peak') rate = activeCourt?.hourlyRateOffPeak || 350000;
      if (s.tier === 'peak') rate = activeCourt?.hourlyRatePeak || 480000;

      const isBooked = bookedSet.has(s.time) && selectedCourtId === 'court-kemang-pink';

      return {
        ...s,
        pricePerHour: rate,
        available: !isBooked
      };
    });
  }, [activeCourt, selectedCourtId]);

  // Calculate pricing
  const currentSlot = timeSlots.find((s) => s.time === selectedTime) || timeSlots[13];
  const rateMultiplier = durationMinutes / 60;
  const courtPrice = Math.round(currentSlot.pricePerHour * rateMultiplier);

  const addOnsTotal = useMemo(() => {
    return Object.entries(selectedAddOns).reduce((sum, [id, count]) => {
      const option = ADD_ONS.find((a) => a.id === id);
      return sum + (option ? option.price * count : 0);
    }, 0);
  }, [selectedAddOns]);

  const grandTotal = courtPrice + addOnsTotal;
  const split4Players = Math.round(grandTotal / 4);

  const handleAddOnCountChange = (addonId: string, delta: number) => {
    setSelectedAddOns((prev) => {
      const current = prev[addonId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [addonId]: next };
    });
  };

  const handleCheckoutClick = () => {
    if (!activeCourt) return;

    const chosenAddOns = Object.entries(selectedAddOns)
      .filter(([_, count]) => count > 0)
      .map(([id, count]) => {
        const item = ADD_ONS.find((a) => a.id === id)!;
        return { item, count };
      });

    onProceedToCheckout({
      locationId: selectedLocationId,
      court: activeCourt,
      date: selectedDate,
      startTime: selectedTime,
      durationMinutes,
      hourlyRate: currentSlot.pricePerHour,
      courtPrice,
      addOns: chosenAddOns,
      totalPrice: grandTotal
    });
  };

  return (
    <section id="booking" className="py-14 sm:py-20 bg-[#F6FAF9] text-[#191C1C] border-t border-[#D8DFDE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#006A6A] text-xs font-bold uppercase tracking-wider mb-2">
              <Zap className="w-3.5 h-3.5 text-[#006A6A]" />
              <span>Real-Time Court Availability</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#191C1C] tracking-tight font-display">
              Reservasi Lapangan Padel
            </h2>
            <p className="text-sm text-[#3D5A57] mt-1 max-w-xl">
              Pilih klub, tanggal, nomor lapangan, serta peralatan untuk langsung mendapatkan akses gate digital.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#3D5A57] bg-white py-1.5 px-3 rounded-xl border border-[#D8DFDE] self-start md:self-auto shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#006A6A] animate-pulse" />
            <span className="font-semibold text-[#191C1C]">Sistem Terkoneksi Gate Otomatis</span>
          </div>
        </div>

        {/* 1. Location Tabs Switcher */}
        <div className="flex items-center gap-2 p-1.5 bg-white border border-[#D8DFDE] rounded-2xl mb-6 overflow-x-auto shadow-xs">
          {LOCATIONS.map((loc) => {
            const isActive = loc.id === selectedLocationId;
            return (
              <button
                key={loc.id}
                onClick={() => onSelectLocationId(loc.id)}
                className={`flex-1 min-w-[220px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-between ${
                  isActive
                    ? 'bg-[#006A6A] text-white shadow-md'
                    : 'text-[#3D5A57] hover:text-[#191C1C] hover:bg-[#F6FAF9]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MapPin className={`w-4 h-4 ${isActive ? 'text-[#A4F2F2]' : 'text-[#6F7978]'}`} />
                  <span>{loc.name}</span>
                </div>
                <span className={`text-[11px] font-mono ${isActive ? 'text-[#A4F2F2]' : 'text-[#6F7978]'}`}>
                  {loc.courtsCount} Courts
                </span>
              </button>
            );
          })}
        </div>

        {/* 2. Interactive Date Picker Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3 text-xs text-[#3D5A57] font-medium">
            <span className="flex items-center gap-1.5 text-[#191C1C] font-semibold">
              <CalendarIcon className="w-3.5 h-3.5 text-[#006A6A]" />
              Pilih Tanggal Bermain:
            </span>
            <span className="text-[#6F7978]">Jadwal H-7 Dibuka Setiap Hari</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {upcomingDates.map((item) => {
              const isSelected = item.isoDate === selectedDate;
              return (
                <button
                  key={item.isoDate}
                  onClick={() => setSelectedDate(item.isoDate)}
                  className={`py-3 px-2 rounded-xl text-center transition-all cursor-pointer border shadow-xs ${
                    isSelected
                      ? 'bg-[#006A6A] border-[#006A6A] text-white shadow-md shadow-[#006A6A]/20'
                      : 'bg-white border-[#D8DFDE] text-[#191C1C] hover:border-[#006A6A]/50 hover:bg-[#EEF4F3]'
                  }`}
                >
                  <div className={`text-[11px] font-medium ${isSelected ? 'text-[#A4F2F2]' : 'text-[#6F7978]'}`}>
                    {item.dayName}
                  </div>
                  <div className="text-lg sm:text-xl font-extrabold font-display my-0.5 tabular-nums">
                    {item.dateNum}
                  </div>
                  <div className={`text-[11px] ${isSelected ? 'text-[#A4F2F2]' : 'text-[#6F7978]'}`}>
                    {item.monthName}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Main Split View: Left (Courts & Time Slots), Right (Pricing Summary & Addons) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Area (8 cols): Court selector + Slots Matrix */}
          <div className="lg:col-span-8 space-y-6">
            {/* Court Selection Tabs */}
            <div>
              <label className="block text-xs font-semibold text-[#191C1C] mb-2">
                Pilih Lapangan di {LOCATIONS.find((l) => l.id === selectedLocationId)?.name}:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {currentCourts.map((court) => {
                  const isSelected = court.id === selectedCourtId;
                  const isPink = court.type === 'pink_signature';

                  return (
                    <button
                      key={court.id}
                      onClick={() => setSelectedCourtId(court.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative shadow-xs ${
                        isSelected
                          ? isPink
                            ? 'bg-[#F3DAFF]/30 border-2 border-[#6E4D8B] shadow-md'
                            : 'bg-[#F0F7F6] border-2 border-[#006A6A] shadow-md'
                          : isPink
                          ? 'bg-white border-[#E0D0EA] hover:border-[#6E4D8B]'
                          : 'bg-white border-[#D8DFDE] hover:border-[#006A6A]/50'
                      }`}
                    >
                      {court.badge && (
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${
                            isPink ? 'text-[#6E4D8B]' : 'text-[#006A6A]'
                          }`}
                        >
                          {court.badge}
                        </span>
                      )}
                      <div className="text-xs sm:text-sm font-bold text-[#191C1C] leading-snug">
                        {court.name}
                      </div>
                      <div className="text-[11px] text-[#3D5A57] mt-1 line-clamp-1">
                        {court.surface}
                      </div>
                      <div className="mt-2 text-[11px] text-[#6F7978] font-mono">
                        Mulai {formatRupiah(court.hourlyRateOffPeak)}/jam
                      </div>

                      {isSelected && (
                        <div className="absolute top-2 right-2 text-[#006A6A]">
                          <CheckCircle className={`w-4 h-4 ${isPink ? 'fill-[#6E4D8B] text-white' : 'fill-[#006A6A] text-white'}`} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Duration Switcher */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#D8DFDE] shadow-xs">
              <span className="text-xs font-semibold text-[#191C1C] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#006A6A]" />
                Durasi Main:
              </span>
              <div className="flex items-center gap-1.5 bg-[#F6FAF9] p-1 rounded-lg border border-[#D8DFDE]">
                {[60, 90, 120].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setDurationMinutes(mins)}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      durationMinutes === mins
                        ? 'bg-[#006A6A] text-white shadow-xs'
                        : 'text-[#3D5A57] hover:text-[#191C1C]'
                    }`}
                  >
                    {mins} Menit ({mins / 60} Jam)
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slot Matrix */}
            <div>
              <div className="flex items-center justify-between mb-3 text-xs text-[#3D5A57]">
                <span className="font-semibold text-[#191C1C]">
                  Pilih Jam Mulai:
                </span>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1 text-[#006A6A] font-semibold">
                    <span className="w-2 h-2 rounded-full bg-[#006A6A]" />
                    Off-Peak (Pagi)
                  </span>
                  <span className="flex items-center gap-1 text-[#3D5A57]">
                    <span className="w-2 h-2 rounded-full bg-[#3D5A57]" />
                    Standard
                  </span>
                  <span className="flex items-center gap-1 text-[#6E4D8B] font-semibold">
                    <span className="w-2 h-2 rounded-full bg-[#6E4D8B]" />
                    Peak (Malam)
                  </span>
                </div>
              </div>

              {/* Slot Cards Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {timeSlots.map((slot) => {
                  const isSelected = slot.time === selectedTime;
                  const isAvailable = slot.available;

                  let tierColor = 'text-[#3D5A57]';
                  if (slot.tier === 'off_peak') tierColor = 'text-[#006A6A] font-medium';
                  if (slot.tier === 'peak') tierColor = 'text-[#6E4D8B] font-medium';

                  return (
                    <button
                      key={slot.time}
                      disabled={!isAvailable}
                      onClick={() => setSelectedTime(slot.time)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col justify-between shadow-xs ${
                        !isAvailable
                          ? 'opacity-40 bg-[#EEF4F3] border-[#D8DFDE] cursor-not-allowed line-through text-[#6F7978]'
                          : isSelected
                          ? 'bg-[#006A6A] border-[#006A6A] text-white shadow-md shadow-[#006A6A]/30'
                          : 'bg-white border-[#D8DFDE] hover:border-[#006A6A]/50 text-[#191C1C]'
                      }`}
                    >
                      <div className="text-sm font-bold font-mono">
                        {slot.time}
                      </div>
                      <div
                        className={`text-[10px] mt-1 font-mono tabular-nums ${
                          isSelected ? 'text-[#A4F2F2] font-semibold' : tierColor
                        }`}
                      >
                        {isAvailable ? formatRupiah(slot.pricePerHour) : 'Booked'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Equipment & Addon Rentals */}
            <div>
              <div className="text-xs font-semibold text-[#191C1C] mb-2 flex items-center justify-between">
                <span>Layanan & Sewa Alat Tambahan (Opsional):</span>
                <span className="text-[#6F7978] text-[11px]">Bisa bayar langsung saat booking</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ADD_ONS.map((addon) => {
                  const count = selectedAddOns[addon.id] || 0;
                  return (
                    <div
                      key={addon.id}
                      className="p-3 rounded-xl bg-white border border-[#D8DFDE] flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-semibold text-[#191C1C]">
                          {addon.name}
                        </div>
                        <div className="text-[11px] text-[#3D5A57] line-clamp-1">
                          {addon.description}
                        </div>
                        <div className="text-xs text-[#006A6A] font-mono font-bold">
                          +{formatRupiah(addon.price)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-[#F6FAF9] border border-[#D8DFDE] rounded-lg p-1">
                        <button
                          onClick={() => handleAddOnCountChange(addon.id, -1)}
                          disabled={count === 0}
                          className="w-6 h-6 flex items-center justify-center rounded text-[#3D5A57] hover:text-[#191C1C] disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-[#191C1C] font-mono">
                          {count}
                        </span>
                        <button
                          onClick={() => handleAddOnCountChange(addon.id, 1)}
                          className="w-6 h-6 flex items-center justify-center rounded text-[#3D5A57] hover:text-[#191C1C]"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Area (4 cols): Sticky Booking Order Summary */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 p-5 rounded-2xl bg-white border border-[#D8DFDE] shadow-xl space-y-4">
              <div className="border-b border-[#D8DFDE] pb-3">
                <div className="text-xs font-bold uppercase tracking-wider text-[#006A6A]">
                  Ringkasan Booking
                </div>
                <div className="text-lg font-bold text-[#191C1C] mt-1 font-display">
                  {activeCourt?.name}
                </div>
                <div className="text-xs text-[#3D5A57] mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#006A6A]" />
                  <span>{LOCATIONS.find((l) => l.id === selectedLocationId)?.name}</span>
                </div>
              </div>

              {/* Schedule summary rows */}
              <div className="space-y-2 text-xs text-[#191C1C]">
                <div className="flex justify-between py-1 border-b border-[#D8DFDE]/80">
                  <span className="text-[#6F7978]">Tanggal</span>
                  <span className="font-semibold text-[#191C1C] font-mono">{selectedDate}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#D8DFDE]/80">
                  <span className="text-[#6F7978]">Jam Main</span>
                  <span className="font-semibold text-[#191C1C] font-mono">
                    {selectedTime} ({durationMinutes} Menit)
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#D8DFDE]/80">
                  <span className="text-[#6F7978]">Tarif Sewa Lapangan</span>
                  <span className="font-mono font-semibold text-[#191C1C]">{formatRupiah(courtPrice)}</span>
                </div>

                {/* Add-ons line items */}
                {Object.entries(selectedAddOns).map(([id, count]) => {
                  if (count === 0) return null;
                  const item = ADD_ONS.find((a) => a.id === id);
                  if (!item) return null;
                  return (
                    <div key={id} className="flex justify-between py-1 text-[#191C1C]">
                      <span className="text-[#6F7978] truncate max-w-[180px]">
                        {item.name} ×{count}
                      </span>
                      <span className="font-mono text-[#006A6A] font-medium">
                        {formatRupiah(item.price * count)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Split-bill preview */}
              <div className="p-3.5 rounded-xl bg-[#F6FAF9] border border-[#D8DFDE] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#6F7978]">Total Pembayaran</span>
                  <span className="text-xl font-black text-[#006A6A] font-mono">
                    {formatRupiah(grandTotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#6F7978] pt-1.5 border-t border-[#D8DFDE]">
                  <span>Patungan 4 Pemain:</span>
                  <span className="font-mono font-bold text-[#6E4D8B]">
                    {formatRupiah(split4Players)} / orang
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleCheckoutClick}
                className="w-full py-3.5 px-4 rounded-xl bg-[#006A6A] hover:bg-[#007A7C] active:bg-[#005252] text-white font-semibold text-sm shadow-lg shadow-[#006A6A]/20 transition-all cursor-pointer flex items-center justify-center gap-2 group"
              >
                <span>Lanjut ke Pembayaran & Tiket</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-[#6F7978]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#006A6A]" />
                <span>Instan Konfirmasi & Garansi Reschedule 100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

import React, { useState } from 'react';
import { Calendar, ShoppingBag, Menu, X, Ticket, MapPin, Phone, Trophy, Play } from 'lucide-react';
import { BookingReservation, CartItem } from '../types';

interface NavbarProps {
  onNavigate: (sectionId: string) => void;
  activeSection: string;
  myBookings: BookingReservation[];
  cartItems: CartItem[];
  onOpenMyBookings: () => void;
  onOpenCart: () => void;
  onOpenQuickBooking: () => void;
  appMode: 'tournament' | 'club';
  onSetAppMode: (mode: 'tournament' | 'club') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigate,
  activeSection,
  myBookings,
  cartItems,
  onOpenMyBookings,
  onOpenCart,
  appMode,
  onSetAppMode
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'booking', label: 'Booking Lapangan' },
    { id: 'venues', label: 'Klub & Lokasi' },
    { id: 'open-matches', label: 'Open Match' },
    { id: 'academy', label: 'Akademi & Coach' },
    { id: 'tournaments', label: 'Turnamen' },
    { id: 'pro-shop', label: 'Pro Shop' }
  ];

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#D8DFDE] bg-[#F6FAF9]/95 backdrop-blur-md">
      {/* Top Banner with App Mode Switcher */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-1.5 text-xs text-[#3D5A57] border-b border-[#D8DFDE] bg-[#EEF4F3]">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase text-[#6F7978] hidden sm:inline">
            Aplikasi LagiLagiPadel:
          </span>
          {/* Mode Switcher Segmented Control */}
          <div className="flex items-center p-0.5 rounded-lg bg-[#E0E7E6] border border-[#CBD5D4]">
            <button
              onClick={() => onSetAppMode('tournament')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                appMode === 'tournament'
                  ? 'bg-[#006A6A] text-white shadow-sm'
                  : 'text-[#3D5A57] hover:text-[#191C1C]'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Portal Turnamen & Hasil</span>
            </button>
            <button
              onClick={() => onSetAppMode('club')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                appMode === 'club'
                  ? 'bg-[#6E4D8B] text-white shadow-sm'
                  : 'text-[#3D5A57] hover:text-[#191C1C]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Booking Lapangan & Klub</span>
            </button>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4 text-[#6F7978] text-[11px]">
          <a
            href="https://wa.me/6281188997233"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 hover:text-[#006A6A] transition-colors"
          >
            <Phone className="w-3 h-3 text-[#006A6A]" />
            <span>WA: +62 811-8899-7233</span>
          </a>
          <span>·</span>
          <span>Jakarta, Indonesia</span>
        </div>
      </div>

      {/* Main Top Bar */}
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
        {/* Brand Wordmark */}
        <div
          onClick={() => onSetAppMode(appMode === 'tournament' ? 'club' : 'tournament')}
          className="flex items-center gap-2.5 group cursor-pointer"
        >
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-xs tracking-wider shadow-md transition-all ${
            appMode === 'tournament'
              ? 'bg-[#006A6A]'
              : 'bg-[#6E4D8B]'
          }`}>
            LLP
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-extrabold tracking-tight text-[#191C1C] text-lg sm:text-xl font-display flex items-center">
              LagiLagi<span className={appMode === 'tournament' ? 'text-[#006A6A]' : 'text-[#6E4D8B]'}>Padel</span>
            </span>
            <span className="text-[10px] text-[#6F7978] font-mono mt-0.5">
              {appMode === 'tournament' ? 'Manajemen Turnamen & Skoring' : 'Official Padel Club'}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        {appMode === 'club' ? (
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#3D5A57]">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`hover:text-[#006A6A] transition-colors py-1 cursor-pointer relative ${
                  activeSection === item.id ? 'text-[#006A6A] font-bold' : ''
                }`}
              >
                {item.label}
                {activeSection === item.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#006A6A] rounded-full" />
                )}
              </button>
            ))}
          </nav>
        ) : (
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#3D5A57]">
            <button
              onClick={() => onSetAppMode('tournament')}
              className="text-[#006A6A] font-bold flex items-center gap-1.5 hover:text-[#007A7C] transition-colors"
            >
              <Trophy className="w-4 h-4 text-[#006A6A]" />
              <span>Daftar Turnamen</span>
            </button>
            <button
              onClick={() => onSetAppMode('tournament')}
              className="text-[#3D5A57] hover:text-[#191C1C] flex items-center gap-1.5 transition-colors"
            >
              <Play className="w-4 h-4 text-[#006A6A]" />
              <span>Skoring Wasit Online</span>
            </button>
            <button
              onClick={() => onSetAppMode('club')}
              className="text-[#6E4D8B] hover:text-[#280B44] text-xs bg-[#F3DAFF] px-2.5 py-1 rounded-lg border border-[#8562A4]/40 font-semibold"
            >
              Ke Booking Lapangan →
            </button>
          </nav>
        )}

        {/* Primary Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* My Bookings Button */}
          <button
            onClick={onOpenMyBookings}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#191C1C] hover:text-[#006A6A] bg-white hover:bg-[#EEF4F3] border border-[#D8DFDE] rounded-xl transition-colors cursor-pointer relative shadow-xs"
            title="Tiket & Reservasi Saya"
          >
            <Ticket className="w-4 h-4 text-[#006A6A]" />
            <span className="hidden sm:inline">Tiket Saya</span>
            {myBookings.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#006A6A] text-white text-[10px] font-bold flex items-center justify-center ml-0.5">
                {myBookings.length}
              </span>
            )}
          </button>

          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            className="relative p-2 text-[#191C1C] hover:text-[#006A6A] bg-white hover:bg-[#EEF4F3] border border-[#D8DFDE] rounded-xl transition-colors cursor-pointer shadow-xs"
            title="Keranjang Belanja"
            aria-label="Keranjang Belanja"
          >
            <ShoppingBag className="w-4 h-4" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#BA1A1A] text-white text-[10px] font-bold flex items-center justify-center shadow-md">
                {totalCartCount}
              </span>
            )}
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#191C1C] hover:text-[#006A6A] rounded-xl bg-white border border-[#D8DFDE]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#D8DFDE] bg-[#F6FAF9] px-4 py-4 space-y-3">
          <div className="space-y-1.5">
            <button
              onClick={() => {
                onSetAppMode('tournament');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs font-bold text-[#006A6A] bg-[#A4F2F2]/40 border border-[#006A6A]/30 rounded-xl flex items-center gap-2"
            >
              <Trophy className="w-4 h-4 text-[#006A6A]" />
              <span>Turnamen & Skoring Online</span>
            </button>
            <button
              onClick={() => {
                onSetAppMode('club');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs font-bold text-[#6E4D8B] bg-[#F3DAFF] border border-[#8562A4]/40 rounded-xl flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-[#6E4D8B]" />
              <span>Booking Lapangan & Fasilitas Klub</span>
            </button>
          </div>

          <div className="pt-2 border-t border-[#D8DFDE] space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className="w-full text-left px-3 py-2 text-sm text-[#3D5A57] hover:bg-white rounded-lg"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

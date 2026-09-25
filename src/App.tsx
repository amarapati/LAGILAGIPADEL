import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { BookingSystem } from './components/BookingSystem';
import { BookingConfirmationModal } from './components/BookingConfirmationModal';
import { OpenMatches } from './components/OpenMatches';
import { VenuesSection } from './components/VenuesSection';
import { AcademySection } from './components/AcademySection';
import { TournamentsSection } from './components/TournamentsSection';
import { ProShopSection } from './components/ProShopSection';
import { MembershipSection } from './components/MembershipSection';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { MyBookingsDrawer } from './components/MyBookingsDrawer';
import { CartDrawer } from './components/CartDrawer';
import { PadelProTournamentApp } from './components/PadelProTournamentApp';
import { LOCATIONS, COURTS, ADD_ONS } from './data/mockData';
import { Court, AddOnOption, BookingReservation, CartItem, ProductItem } from './types';
import { CheckCircle2, X, ArrowRight, Trophy, Calendar } from 'lucide-react';

export default function App() {
  const [appMode, setAppMode] = useState<'tournament' | 'club'>('tournament');
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [selectedLocationId, setSelectedLocationId] = useState<string>('kemang');

  // Initial demo reservation
  const initialBookings: BookingReservation[] = [
    {
      id: 'PPRO-892411',
      location: LOCATIONS[0],
      court: COURTS[0], // Iconic Pink Court
      date: 'Jumat, 25 Sep 2026',
      startTime: '19:00',
      durationMinutes: 120,
      totalPrice: 1040000,
      playerName: 'Rangga Panitis',
      playerEmail: 'ranggapanitis94@gmail.com',
      playerPhone: '081299887766',
      addOns: [
        { item: ADD_ONS[0], count: 2 },
        { item: ADD_ONS[2], count: 1 }
      ],
      status: 'confirmed',
      paymentMethod: 'qris',
      createdAt: new Date().toISOString()
    }
  ];

  const [myBookings, setMyBookings] = useState<BookingReservation[]>(() => {
    try {
      const saved = localStorage.getItem('padelpro_bookings');
      return saved ? JSON.parse(saved) : initialBookings;
    } catch {
      return initialBookings;
    }
  });

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('padelpro_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal / Drawer states
  const [bookingDraft, setBookingDraft] = useState<{
    locationId: string;
    court: Court;
    date: string;
    startTime: string;
    durationMinutes: number;
    hourlyRate: number;
    courtPrice: number;
    addOns: { item: AddOnOption; count: number }[];
    totalPrice: number;
  } | null>(null);

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isMyBookingsDrawerOpen, setIsMyBookingsDrawerOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('padelpro_bookings', JSON.stringify(myBookings));
    } catch (e) {
      console.error(e);
    }
  }, [myBookings]);

  useEffect(() => {
    try {
      localStorage.setItem('padelpro_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error(e);
    }
  }, [cartItems]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 4000);
  };

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleStartBooking = (locationId?: string) => {
    setAppMode('club');
    if (locationId) {
      setSelectedLocationId(locationId);
    }
    setTimeout(() => {
      handleNavigate('booking');
    }, 100);
  };

  const handleProceedToCheckout = (draft: {
    locationId: string;
    court: Court;
    date: string;
    startTime: string;
    durationMinutes: number;
    hourlyRate: number;
    courtPrice: number;
    addOns: { item: AddOnOption; count: number }[];
    totalPrice: number;
  }) => {
    setBookingDraft(draft);
    setIsBookingModalOpen(true);
  };

  const handleSaveConfirmedBooking = (reservation: BookingReservation) => {
    setMyBookings((prev) => [reservation, ...prev]);
    showToast(`Reservasi ${reservation.court.name} terkonfirmasi! Cek di menu Tiket Saya.`);
  };

  const handleCancelBooking = (id: string) => {
    setMyBookings((prev) => prev.filter((b) => b.id !== id));
    showToast('Booking berhasil dibatalkan. Saldo kredit otomatis dikembalikan.');
  };

  // Cart operations
  const handleAddToCart = (product: ProductItem) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    showToast(`"${product.name}" ditambahkan ke keranjang belanja.`);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  return (
    <div className="min-h-screen bg-[#F6FAF9] text-[#191C1C] flex flex-col font-sans selection:bg-[#006A6A] selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm p-4 rounded-xl bg-white border border-[#D8DFDE] shadow-2xl flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-5 h-5 text-[#006A6A] shrink-0 mt-0.5" />
          <div className="flex-1 text-xs text-[#191C1C] font-medium leading-relaxed">
            {toastMessage}
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[#6F7978] hover:text-[#191C1C] p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Strict 3-zone Navbar with Mode Switcher */}
      <Navbar
        onNavigate={handleNavigate}
        activeSection={activeSection}
        myBookings={myBookings}
        cartItems={cartItems}
        onOpenMyBookings={() => setIsMyBookingsDrawerOpen(true)}
        onOpenCart={() => setIsCartDrawerOpen(true)}
        onOpenQuickBooking={() => handleStartBooking()}
        appMode={appMode}
        onSetAppMode={setAppMode}
      />

      {/* Main Content: Switchable between Tournament & Online Scoring Mode (padelpro.biz.id) and Club Booking Mode */}
      <main className="flex-1">
        {appMode === 'tournament' ? (
          <div>
            {/* Direct replica of padelpro.biz.id Tournament Management & Online Scoring */}
            <PadelProTournamentApp />

            {/* Quick banner to switch to Club Booking */}
            <div className="border-t border-[#D8DFDE] bg-[#EEF4F3] py-8 px-4 text-center">
              <div className="max-w-xl mx-auto space-y-3">
                <span className="text-xs font-mono uppercase text-[#006A6A] font-bold">
                  Ingin Memesan Lapangan untuk Latihan?
                </span>
                <h3 className="text-xl font-bold text-[#191C1C] font-display">
                  Sewa Lapangan di LagiLagiPadel (Kemang & Satrio)
                </h3>
                <p className="text-xs text-[#3D5A57]">
                  Nikmati lapangan World Padel Tour, kaca tempered panoramik, dan cafe lounge.
                </p>
                <button
                  onClick={() => handleStartBooking()}
                  className="px-5 py-2.5 rounded-xl bg-[#006A6A] hover:bg-[#007A7C] text-white font-semibold text-xs shadow-md shadow-[#006A6A]/20 transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-[#A4F2F2]" />
                  <span>Buka Sistem Booking Lapangan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Hero Section */}
            <HeroSection
              onStartBooking={handleStartBooking}
              onExploreMatches={() => handleNavigate('open-matches')}
            />

            {/* Real-time Interactive Booking System */}
            <BookingSystem
              selectedLocationId={selectedLocationId}
              onSelectLocationId={setSelectedLocationId}
              onProceedToCheckout={handleProceedToCheckout}
            />

            {/* Venues & Clubs Section */}
            <VenuesSection
              onSelectLocationForBooking={(locId) => handleStartBooking(locId)}
            />

            {/* Community Open Matches */}
            <OpenMatches onNotify={showToast} />

            {/* Academy & Certified Coaches */}
            <AcademySection onNotify={showToast} />

            {/* Tournaments & Americano Mixers */}
            <TournamentsSection onNotify={showToast} />

            {/* Official Pro Shop */}
            <ProShopSection
              onAddToCart={handleAddToCart}
              onOpenCart={() => setIsCartDrawerOpen(true)}
            />

            {/* Membership & Session Pass */}
            <MembershipSection onNotify={showToast} />

            {/* FAQ Accordion */}
            <FaqSection />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Booking Checkout & E-Ticket Modal */}
      <BookingConfirmationModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setBookingDraft(null);
        }}
        bookingDraft={bookingDraft}
        onSaveConfirmedBooking={handleSaveConfirmedBooking}
      />

      {/* My Bookings Drawer */}
      <MyBookingsDrawer
        isOpen={isMyBookingsDrawerOpen}
        onClose={() => setIsMyBookingsDrawerOpen(false)}
        bookings={myBookings}
        onCancelBooking={handleCancelBooking}
      />

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onNotify={showToast}
      />
    </div>
  );
}

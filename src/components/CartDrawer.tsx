import React, { useState } from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { CartItem } from '../types';
import { formatRupiah } from '../utils/formatters';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onNotify: (msg: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onNotify
}) => {
  const [checkoutComplete, setCheckoutComplete] = useState(false);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.11);
  const total = subtotal + tax;

  const handleCheckout = () => {
    setCheckoutComplete(true);
    setTimeout(() => {
      onClearCart();
      setCheckoutComplete(false);
      onClose();
      onNotify('Pesanan Pro Shop berhasil dibayar! Pesanan dapat diambil langsung di Pro Shop Kemang / Satrio.');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#F6FAF9] border-l border-[#D8DFDE] h-full flex flex-col justify-between shadow-2xl text-[#191C1C]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D8DFDE] bg-white">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#006A6A]" />
            <h3 className="text-base font-bold text-[#191C1C] font-display">Keranjang Pro Shop</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#6F7978] hover:text-[#191C1C] rounded-xl hover:bg-[#EEF4F3] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {checkoutComplete ? (
            <div className="text-center py-20 space-y-3 animate-in zoom-in-95">
              <CheckCircle2 className="w-12 h-12 text-[#006A6A] mx-auto" />
              <h4 className="text-base font-bold text-[#191C1C] font-display">Pembayaran Sukses!</h4>
              <p className="text-xs text-[#3D5A57]">
                Resi dan nota resmi telah dikirim ke nomor WhatsApp Anda.
              </p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-12 h-12 rounded-full bg-white border border-[#D8DFDE] flex items-center justify-center mx-auto text-[#6F7978] shadow-xs">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-[#191C1C]">Keranjang Belanja Kosong</p>
              <p className="text-xs text-[#6F7978] max-w-xs mx-auto">
                Temukan raket terbaik, bola resmi, dan apparel di katalog Pro Shop kami.
              </p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.product.id}
                className="p-3.5 rounded-2xl bg-white border border-[#D8DFDE] flex gap-3 items-center shadow-xs"
              >
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="w-16 h-16 rounded-xl object-cover bg-[#EEF4F3] shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-mono text-[#6F7978] uppercase font-semibold">
                    {item.product.brand}
                  </span>
                  <h4 className="text-xs font-bold text-[#191C1C] truncate font-display">
                    {item.product.name}
                  </h4>
                  <div className="text-xs font-mono font-bold text-[#006A6A] mt-1">
                    {formatRupiah(item.product.price)}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => onRemoveItem(item.product.id)}
                    className="text-[#6F7978] hover:text-red-600 p-1 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-1.5 bg-[#F6FAF9] border border-[#D8DFDE] rounded-lg p-0.5">
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, -1)}
                      className="w-5 h-5 flex items-center justify-center text-[#6F7978] hover:text-[#191C1C]"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-4 text-center text-xs font-mono font-bold text-[#191C1C]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, 1)}
                      className="w-5 h-5 flex items-center justify-center text-[#6F7978] hover:text-[#191C1C]"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout Summary */}
        {!checkoutComplete && cartItems.length > 0 && (
          <div className="p-6 border-t border-[#D8DFDE] bg-white space-y-3">
            <div className="space-y-1.5 text-xs text-[#6F7978]">
              <div className="flex justify-between">
                <span>Subtotal Produk</span>
                <span className="font-mono text-[#191C1C]">{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>PPN 11%</span>
                <span className="font-mono text-[#191C1C]">{formatRupiah(tax)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#D8DFDE] text-sm font-bold text-[#191C1C]">
                <span>Total Pembayaran</span>
                <span className="font-mono text-[#006A6A]">{formatRupiah(total)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full py-3.5 px-4 rounded-xl bg-[#006A6A] hover:bg-[#007A7C] text-white font-semibold text-xs shadow-md shadow-[#006A6A]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Bayar Sekarang (QRIS / Bank Transfer)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

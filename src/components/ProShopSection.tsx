import React, { useState } from 'react';
import { ShoppingBag, Star, Check, Sparkles, Filter, ArrowRight } from 'lucide-react';
import { PRODUCTS } from '../data/mockData';
import { ProductItem } from '../types';
import { formatRupiah } from '../utils/formatters';

interface ProShopSectionProps {
  onAddToCart: (product: ProductItem) => void;
  onOpenCart: () => void;
}

export const ProShopSection: React.FC<ProShopSectionProps> = ({
  onAddToCart,
  onOpenCart
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'Semua Produk' },
    { id: 'rackets', label: 'Raket Padel' },
    { id: 'balls', label: 'Bola Resmi' },
    { id: 'bags', label: 'Tas & Aksesoris' },
    { id: 'apparel', label: 'Pakaian & Jersey' }
  ];

  const filteredProducts = PRODUCTS.filter((p) => {
    if (selectedCategory === 'all') return true;
    return p.category === selectedCategory;
  });

  const handleAdd = (product: ProductItem) => {
    onAddToCart(product);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 1500);
  };

  return (
    <section id="pro-shop" className="py-12 lg:py-20 border-b border-[#D8DFDE] bg-[#F6FAF9] text-[#191C1C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-semibold text-[#006A6A] tracking-wider uppercase mb-1">
              Official Pro Shop
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#191C1C] tracking-tight font-display">
              Peralatan & Gear Resmi Padel
            </h2>
            <p className="text-sm text-[#3D5A57] mt-1 max-w-xl">
              Koleksi raket orisinal Bullpadel, Nox, Wilson, bola resmi WPT, dan aksesori premium langsung tersedia di toko klub Kemang & Satrio.
            </p>
          </div>

          <button
            onClick={onOpenCart}
            className="px-4 py-2.5 rounded-xl border border-[#D8DFDE] bg-white hover:bg-[#EEF4F3] text-[#191C1C] text-xs font-semibold flex items-center gap-2 self-start md:self-auto cursor-pointer transition-colors shadow-xs"
          >
            <ShoppingBag className="w-4 h-4 text-[#006A6A]" />
            <span>Buka Keranjang Belanja</span>
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-[#006A6A] text-white shadow-xs'
                  : 'bg-white border border-[#D8DFDE] text-[#3D5A57] hover:text-[#191C1C]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((p) => {
            const isAdded = addedProductId === p.id;

            return (
              <div
                key={p.id}
                className="rounded-2xl border border-[#D8DFDE] bg-white overflow-hidden flex flex-col justify-between group hover:border-[#006A6A]/50 transition-all shadow-xs"
              >
                {/* Product Image */}
                <div className="relative h-48 bg-[#EEF4F3] overflow-hidden flex items-center justify-center p-4">
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                  {p.isBestseller && (
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-[#006A6A] text-white font-mono text-[10px] font-bold shadow-xs">
                      BESTSELLER
                    </span>
                  )}
                  {!p.inStock && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-[#6E4D8B] text-white font-mono text-[10px] font-bold shadow-xs">
                      Pre-Order
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-[#6F7978] mb-1">
                      <span className="uppercase font-bold tracking-wider text-[#006A6A]">{p.brand}</span>
                      <div className="flex items-center gap-1 text-[#6E4D8B]">
                        <Star className="w-3 h-3 fill-[#6E4D8B]" />
                        <span className="font-semibold">4.9</span>
                      </div>
                    </div>
                    <h4 className="text-sm font-bold text-[#191C1C] group-hover:text-[#006A6A] transition-colors font-display line-clamp-1">
                      {p.name}
                    </h4>
                    <p className="text-xs text-[#3D5A57] mt-1 line-clamp-2">
                      {p.description}
                    </p>
                  </div>

                  {/* Price & Action */}
                  <div className="pt-3 border-t border-[#D8DFDE] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#6F7978] uppercase font-mono block">Harga</span>
                      <span className="text-sm font-bold text-[#006A6A] font-mono">
                        {formatRupiah(p.price)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAdd(p)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isAdded
                          ? 'bg-[#007A7C] text-white shadow-xs'
                          : 'bg-[#006A6A] hover:bg-[#007A7C] text-white shadow-xs'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Ditambahkan</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>+ Keranjang</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

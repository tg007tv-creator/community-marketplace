import { useState } from 'react';
import { MapPin, Star, BadgeCheck, Trash2, Loader2 } from 'lucide-react';
import type { ProductWithStats } from '@/types';
import { STATUS_LABELS, STATUS_COLORS, categoryEmoji } from '@/types';
import { formatPrice, formatRelativeTime } from '@/lib/format';
import { Link } from '@/router';
import { cn } from '@/lib/utils';
import { Modal } from '@/components/Modal';
import { useAuth } from '@/context/AuthContext';
import { deleteProduct } from '@/hooks/useProducts';

interface ProductCardProps {
  product: ProductWithStats;
  onDeleted?: () => void;
}

export function ProductCard({ product, onDeleted }: ProductCardProps) {
  const { user, profile } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isAdmin = !!profile?.is_admin;
  const isOwner = !!user && user.id === product.seller_id;
  const canDelete = isAdmin || isOwner;

  const hasDiscount =
    product.original_price != null && product.original_price > product.price;
  const discountPct = hasDiscount
    ? Math.round((1 - product.price / (product.original_price as number)) * 100)
    : 0;

  const handleAdminDelete = async () => {
    setDeleting(true);
    await deleteProduct(product.id);
    setDeleting(false);
    setConfirmOpen(false);
    onDeleted?.();
  };

  return (
    <div className="relative animate-fade-in">
      <Link to={`/product/${product.id}`} className="block">
        <div className="card group overflow-hidden transition-all hover:shadow-card-hover">
          <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
            <img
              src={product.images[0]}
              alt={product.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <span
              className={cn(
                'chip absolute left-2 top-2 backdrop-blur',
                STATUS_COLORS[product.status]
              )}
            >
              {STATUS_LABELS[product.status]}
            </span>
            {hasDiscount && (
              <span className="chip absolute right-2 top-2 bg-rose-500 text-white backdrop-blur">
                ลด {discountPct}%
              </span>
            )}
          </div>
        <div className="p-3">
          <div className="mb-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <span>{categoryEmoji(product.category)}</span>
            <span className="truncate">{product.zone}</span>
          </div>
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{product.title}</h3>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-base font-bold text-brand-600 dark:text-brand-400">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              {product.seller?.is_verified && (
                <BadgeCheck size={13} className="text-sky-500" />
              )}
              <span className="truncate max-w-[90px]">{product.seller?.display_name ?? '-'}</span>
            </div>
            {product.avg_rating != null && product.review_count ? (
              <div className="flex items-center gap-0.5">
                <Star size={12} className="fill-amber-400 text-amber-400" />
                <span>{product.avg_rating.toFixed(1)}</span>
                <span className="text-gray-400">({product.review_count})</span>
              </div>
            ) : (
              <span>{formatRelativeTime(product.created_at)}</span>
            )}
          </div>
        </div>
        </div>
      </Link>

      {canDelete && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setConfirmOpen(true);
          }}
          className="absolute bottom-2 right-2 z-10 flex items-center gap-1 rounded-full bg-rose-500 px-2.5 py-1.5 text-xs font-semibold text-white shadow-md hover:bg-rose-600"
          aria-label={isAdmin && !isOwner ? 'ลบสินค้า (ผู้ดูแลระบบ)' : 'ลบสินค้าของฉัน'}
        >
          <Trash2 size={13} /> ลบ
        </button>
      )}

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={isAdmin && !isOwner ? 'ยืนยันการลบสินค้า (แอดมิน)' : 'ยืนยันการลบสินค้าของฉัน'}
      >
        <p className="text-sm text-gray-600 dark:text-gray-300">
          ต้องการลบสินค้า "{product.title}" ออกจากระบบใช่ไหม? การลบไม่สามารถกู้คืนได้
        </p>
        <div className="mt-4 flex gap-2">
          <button onClick={() => setConfirmOpen(false)} className="btn-secondary flex-1">
            ยกเลิก
          </button>
          <button
            onClick={handleAdminDelete}
            disabled={deleting}
            className="btn flex-1 bg-rose-500 text-white hover:bg-rose-600"
          >
            {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            ลบสินค้า
          </button>
        </div>
      </Modal>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-square animate-pulse bg-gray-200 dark:bg-gray-800" />
      <div className="space-y-2 p-3">
        <div className="h-3 w-1/3 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-5 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
      </div>
    </div>
  );
}

export function MapPinIcon() {
  return <MapPin size={13} />;
}

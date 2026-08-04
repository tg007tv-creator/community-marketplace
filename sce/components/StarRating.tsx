import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  size?: number;
  className?: string;
  onChange?: (value: number) => void;
}

export function StarRating({ value, size = 16, className, onChange }: StarRatingProps) {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(star)}
          className={cn(onChange && 'cursor-pointer transition-transform active:scale-110', !onChange && 'cursor-default')}
        >
          <Star
            size={size}
            className={cn(
              star <= Math.round(value)
                ? 'fill-amber-400 text-amber-400'
                : 'fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700'
            )}
          />
        </button>
      ))}
    </div>
  );
}

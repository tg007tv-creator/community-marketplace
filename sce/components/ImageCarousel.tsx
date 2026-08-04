import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
}

export function ImageCarousel({ images, alt, className }: ImageCarouselProps) {
  const [index, setIndex] = useState(0);
  const count = images.length;

  if (count === 0) {
    return (
      <div className={cn('flex items-center justify-center bg-gray-100 dark:bg-gray-800', className)}>
        <span className="text-sm text-gray-400">ไม่มีรูปภาพ</span>
      </div>
    );
  }

  const go = (dir: number) => setIndex((i) => (i + dir + count) % count);

  return (
    <div className={cn('group relative overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800', className)}>
      <img
        src={images[index]}
        alt={`${alt} - รูปที่ ${index + 1}`}
        className="h-full w-full object-cover transition-opacity duration-300"
        loading="lazy"
      />
      {count > 1 && (
        <>
          <button
            onClick={() => go(-1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 text-gray-800 shadow-sm backdrop-blur transition-all hover:bg-white active:scale-90 dark:bg-black/50 dark:text-white"
            aria-label="รูปก่อนหน้า"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => go(1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 text-gray-800 shadow-sm backdrop-blur transition-all hover:bg-white active:scale-90 dark:bg-black/50 dark:text-white"
            aria-label="รูปถัดไป"
          >
            <ChevronRight size={18} />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/60'
                )}
                aria-label={`ไปรูปที่ ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

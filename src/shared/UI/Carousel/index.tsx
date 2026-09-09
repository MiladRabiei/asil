'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type CarouselProps = {
  children: React.ReactNode;
  options?: Parameters<typeof useEmblaCarousel>[0];
  showDots?: boolean;
  showArrows?: boolean;
  autoplay?: boolean;
  autoplayDelay?: number;
  axis?: 'x' | 'y';
  className?: string;
};

export default function Carousel({
  children,
  options = { loop: true },
  showDots = true,
  showArrows = true,
  autoplay = false,
  autoplayDelay = 3000,
  axis = 'x',
  className,
}: CarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    ...options,
    direction: 'rtl',
    axis,
    watchDrag: true,
    watchResize: true,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [snapCount, setSnapCount] = useState(0);
  const isHovering = useRef(false);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    const onInit = () => setSnapCount(emblaApi.scrollSnapList().length);

    emblaApi.on('init', onInit);
    emblaApi.on('reInit', onInit);
    emblaApi.on('select', onSelect);
    onInit();
    onSelect();

    return () => {
      emblaApi.off('init', onInit);
      emblaApi.off('reInit', onInit);
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  // Force reInit after mount to fix Next.js layout timing
  useEffect(() => {
    if (!emblaApi) return;
    const t1 = setTimeout(() => emblaApi.reInit(), 0);
    const t2 = setTimeout(() => emblaApi.reInit(), 300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi || !autoplay) return;
    const interval = setInterval(() => {
      if (!isHovering.current) emblaApi.scrollNext();
    }, autoplayDelay);
    return () => clearInterval(interval);
  }, [emblaApi, autoplay, autoplayDelay]);

  const handleMouseEnter = useCallback(() => {
    isHovering.current = true;
  }, []);
  const handleMouseLeave = useCallback(() => {
    isHovering.current = false;
  }, []);

  return (
    <div className={cn('w-full min-w-0 h-full', className)}>
      <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {/* Viewport */}
        <div ref={emblaRef} className="w-full overflow-hidden rounded-lg h-full">
          <div className="flex touch-pan-y -mx-2" style={{ backfaceVisibility: 'hidden' }}>
            {children}
          </div>
        </div>

        {/* Arrows */}
        {showArrows && (
          <>
            {/* Left arrow — scrollNext in RTL */}
            <button
              onClick={() => emblaApi?.scrollNext()}
              aria-label="Next slide"
              className={cn(
                'absolute left-3 top-1/2 -translate-y-1/2',
                'size-8 rounded-full flex items-center justify-center',
                'bg-background/80 hover:bg-background transition-colors',
                'shadow-md opacity-80 hover:opacity-100'
              )}
            >
              <ChevronLeft className="size-4" />
            </button>

            {/* Right arrow — scrollPrev in RTL */}
            <button
              onClick={() => emblaApi?.scrollPrev()}
              aria-label="Previous slide"
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2',
                'size-8 rounded-full flex items-center justify-center',
                'bg-background/80 hover:bg-background transition-colors',
                'shadow-md opacity-80 hover:opacity-100'
              )}
            >
              <ChevronRight className="size-4" />
            </button>
          </>
        )}

        {/* Dots */}
        {showDots && snapCount > 0 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {Array.from({ length: snapCount }).map((_, index) => (
              <button
                key={index}
                onClick={() => emblaApi?.scrollTo(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  index === selectedIndex ? 'w-8 bg-white' : 'w-6 bg-white/50'
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

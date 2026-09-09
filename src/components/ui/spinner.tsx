import { cn } from '@/lib/utils';
import { Loader2Icon } from 'lucide-react';

type Size = 'xs' | 'sm' | 'md' | 'lg';

const sizeMap: Record<Size, string> = {
  xs: 'size-3',
  sm: 'size-4',
  md: 'size-6',
  lg: 'size-8',
};

function Spinner({
  className,
  size = 'sm',
  ...props
}: React.ComponentProps<typeof Loader2Icon> & { size?: Size }) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn('animate-spin', sizeMap[size], className)}
      {...props}
    />
  );
}

export { Spinner };

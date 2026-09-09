import { Spinner } from '@/components/ui/spinner';

function Loading({ size = 'lg' }: { size?: 'xs' | 'sm' | 'md' | 'lg' }) {
  return (
    <div className="flex items-center justify-center">
      <Spinner size={size} />
    </div>
  );
}

export default Loading;

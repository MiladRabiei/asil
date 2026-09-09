import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Search, X } from 'lucide-react';
import React from 'react';

export interface SearchInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'className' | 'type' | 'value' | 'onChange' | 'id' | 'name'
> {
  id: string;
  name: string;
  label?: string;
  value?: string;
  placeholder?: string;
  error?: string;
  onChange?: (value: string) => void;
  onClear?: () => void;
}

const SearchInput: React.FC<SearchInputProps> = ({
  id,
  name,
  value = '',
  placeholder = 'Search...',
  error,
  onChange,
  onClear,
  ...rest
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  const handleClear = () => {
    onChange?.('');
    onClear?.();
  };

  return (
    <div className="relative w-full">
      {/* search icon — start */}
      <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />

      <Input
        {...rest}
        id={id}
        name={name}
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          'ps-9 h-12 rounded-3xl', // icon lives on the right under RTL — always reserve space for it
          value && 'pe-9', // clear button lives on the left — only reserve space once it's visible
          error && 'border-destructive focus-visible:ring-destructive'
        )}
      />

      {/* clear button — end */}
      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="size-4" />
        </button>
      )}

      {error && (
        <p id={`${id}-error`} role="alert" className="custom-error-message mt-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default SearchInput;

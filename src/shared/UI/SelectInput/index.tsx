import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import React from 'react';

export interface SelectInputProps {
  label: string;
  placeholder: string;
  options: Array<{ key: string; value: string }>;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  id: string;
  name: string;
  disabled?: boolean;
  containerClassName?: string;
  /** Extends/overrides the default field look. */
  className?: string;
}
export const FIELD_CLASSNAME =
  'h-10! p-3! rounded-xl border-0 bg-surface-neutral text-xs text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring';
const SelectInput: React.FC<SelectInputProps> = ({
  label,
  options,
  placeholder,
  value,
  onChange,
  error,
  id,
  name,
  disabled,
  containerClassName,
  className,
}) => {
  return (
    <div className={containerClassName ?? 'flex w-full flex-col gap-1'}>
      <Label
        htmlFor={id}
        className={cn('text-sm font-semibold', error ? 'text-destructive' : 'text-foreground')}
      >
        {label}
      </Label>
      <Select value={value} onValueChange={onChange} name={name} disabled={disabled}>
        <SelectTrigger
          id={id}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            FIELD_CLASSNAME,
            'w-full',
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.key} value={opt.key}>
              {opt.value}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
};

export default SelectInput;

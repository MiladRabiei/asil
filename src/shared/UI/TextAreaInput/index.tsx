'use client';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import React, { ChangeEvent } from 'react';

export interface TextAreaInputProps {
  value: string;
  label?: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  error?: string;
  id: string;
  name: string;
  containerClassName?: string;
  labelClassName?: string;
  /** Extends/overrides the default field look — was previously being applied to the wrong element (the textarea got `labelClassName`, the label got nothing). */
  className?: string;
  disabled?: boolean;
  rows?: number;
  cols?: number;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
}
export const FIELD_CLASSNAME =
  'h-19.5! p-3 rounded-xl! border-0 bg-surface-neutral text-xs text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring';
const TextAreaInput: React.FC<TextAreaInputProps> = ({
  label,
  onChange,
  value,
  placeholder,
  error,
  id,
  name,
  containerClassName,
  labelClassName,
  className,
  disabled,
  rows = 4,
  cols,
  resize = 'none',
}) => {
  return (
    <div className={containerClassName ?? 'flex w-full flex-col gap-1'}>
      {label && (
        <Label
          htmlFor={id}
          className={cn(
            'text-sm font-semibold',
            error ? 'text-destructive' : 'text-foreground',
            labelClassName
          )}
        >
          {label}
        </Label>
      )}
      <Textarea
        id={id}
        name={name}
        rows={rows}
        cols={cols}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        style={{ resize }}
        onFocus={(e) => e.currentTarget.scrollIntoView({ block: 'center', behavior: 'smooth' })}
        className={cn(
          FIELD_CLASSNAME,
          'min-h-25 h-auto w-full py-3 font-normal',
          error && 'border-destructive focus-visible:ring-destructive',
          className
        )}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
};

export default TextAreaInput;

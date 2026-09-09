import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import React from 'react';

export interface TextInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'id' | 'name'
> {
  value?: string | number;
  label: string;
  type: React.HTMLInputTypeAttribute;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  id: string;
  name: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
  className?: string;
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  onChange,
  type,
  value,
  placeholder,
  error,
  id,
  name,
  leftIcon,
  rightIcon,
  containerClassName,
  className,
  ...rest
}) => {
  return (
    <div className={containerClassName ?? 'flex w-full flex-col gap-1'}>
      <Label
        htmlFor={id}
        className={cn('text-sm font-semibold', error ? 'text-destructive' : 'text-foreground')}
      >
        {label}
      </Label>
      <div className="relative w-full">
        {leftIcon && (
          <span className=" absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {leftIcon}
          </span>
        )}
        <Input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            'w-full',
            leftIcon && 'pl-9',
            rightIcon && 'pr-9',
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          {...rest}
        />
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {rightIcon}
          </span>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
};

export default TextInput;

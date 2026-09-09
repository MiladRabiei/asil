import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface RadioInputProps {
  label: string;
  value: string;
  isChecked: boolean;
  onChange: (value: string) => void; // ← changed from ChangeEvent to string
  error?: string;
  id: string;
  name: string;
  disabled?: boolean;
  containerClassName?: string;
  labelClassName?: string;
}

const RadioInput: React.FC<RadioInputProps> = ({
  label,
  value,
  isChecked,
  onChange,
  error,
  id,
  name,
  disabled,
  containerClassName,
  labelClassName,
}) => {
  return (
    <div className={containerClassName}>
      <RadioGroup
        value={isChecked ? value : ''}
        onValueChange={onChange}
        name={name}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      >
        <Label
          htmlFor={id}
          className={cn('custom-label-text flex items-center gap-md', labelClassName)}
        >
          <RadioGroupItem
            id={id}
            value={value}
            onFocus={(e) => e.currentTarget.scrollIntoView({ block: 'center', behavior: 'smooth' })}
          />
          <span className={cn('label-text', { 'custom-error-label': error })}>{label}</span>
        </Label>
      </RadioGroup>
      {error && (
        <p id={`${id}-error`} role="alert" className="custom-error-message">
          {error}
        </p>
      )}
    </div>
  );
};

export default RadioInput;

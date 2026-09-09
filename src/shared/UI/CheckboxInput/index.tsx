import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export interface CheckboxInputProps extends Omit<
  React.ComponentProps<typeof Checkbox>,
  'id' | 'name'
> {
  label: string;
  error?: string;
  id: string;
  name: string;
}

const CheckboxInput: React.FC<CheckboxInputProps> = ({ label, error, id, name, ...rest }) => {
  return (
    <div className="flex flex-col">
      <Label
        htmlFor={id}
        className={`w-fit gap-sm ${error ? 'custom-error-label' : 'custom-label-text'}`}
      >
        <Checkbox
          id={id}
          name={name}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...rest}
        />
        {label}
      </Label>
      {error && (
        <p id={`${id}-error`} role="alert" className="custom-error-message">
          {error}
        </p>
      )}
    </div>
  );
};

export default CheckboxInput;

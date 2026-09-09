import { Button as ShadcnButton, buttonVariants } from '@/components/ui/button';
import type { VariantProps } from 'class-variance-authority';
import React from 'react';
import Loading from '../Loading';

export interface ButtonProps
  extends React.ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'default',
  isLoading = false,
  disabled,
  children,
  type = 'button',
  ...rest
}) => {
  return (
    <ShadcnButton
      variant={variant}
      size={size}
      disabled={disabled || isLoading}
      type={type}
      {...rest}
    >
      {isLoading ? <Loading size="sm" /> : children}
    </ShadcnButton>
  );
};

export default Button;

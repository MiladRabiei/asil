'use client';

import Button from '@/shared/UI/Button';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

interface NavBackButtonProps {
  pageTitle: string;
  onClick?: () => void;
  className?: string;
}

const NavBackButton: React.FC<NavBackButtonProps> = ({ onClick, className, pageTitle }) => {
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="plain"
      onClick={onClick ?? (() => router.back())}
      className={`gap-2 text-base font-medium text-foreground hover:bg-transparent ${className ?? ''}`}
    >
      <ArrowRight className="size-6" />
      {pageTitle}
    </Button>
  );
};

export default NavBackButton;

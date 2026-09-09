import clsx from 'clsx';
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  fractionWidth?: '1/2' | '1/3' | '1/4';
}

const Card: React.FC<CardProps> = ({ children, fractionWidth = '1/2' }) => {
  const cardClassName = clsx('p-md bg-base-100 shadow-md rounded-lg ', {
    'md:w-1/2 w-full': fractionWidth === '1/2',
    'md:w-1/3 w-full': fractionWidth === '1/3',
    'md:w-1/4 w-full': fractionWidth === '1/4',
  });
  return <article className={cardClassName}>{children}</article>;
};

export default Card;

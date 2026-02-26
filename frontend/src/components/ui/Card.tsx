import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'alt';
}

export function Card({ children, variant = 'default', className = '', ...props }: CardProps) {
  const cls = variant === 'alt' ? 'card card--alt' : 'card';
  return (
    <div className={`${cls} ${className}`} {...props}>
      {children}
    </div>
  );
}

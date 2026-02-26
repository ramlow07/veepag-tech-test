import { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: ReactNode;
}

const styles: Record<string, string> = {
  base: [
    'inline-flex items-center justify-center gap-2',
    'font-medium rounded cursor-pointer border',
    'transition-all select-none',
    'disabled:opacity-40 disabled:cursor-not-allowed',
  ].join(' '),
};

const variantClass: Record<Variant, string> = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  ghost:     'btn-ghost',
  danger:    'btn-danger',
};

const sizeClass: Record<Size, string> = {
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  style,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      style={style}
      className={[styles.base, variantClass[variant], sizeClass[size], props.className ?? ''].join(' ')}
    >
      {loading && (
        <span className="btn-spinner" aria-hidden="true" />
      )}
      {children}
    </button>
  );
}

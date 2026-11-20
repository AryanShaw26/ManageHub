import React from 'react';

export const Badge = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}) => {
  const variantStyles = {
    neutral: 'bg-canvas text-ink-700 border border-border',
    brand: 'bg-brand-100 text-ink-900 border border-brand-300 font-semibold',
    success: 'bg-green-50 text-success border border-green-200 font-semibold',
    warning: 'bg-amber-50 text-warning border border-amber-200 font-semibold',
    danger: 'bg-red-50 text-danger border border-red-200 font-semibold',
    info: 'bg-blue-50 text-info border border-blue-200 font-semibold',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span className={`inline-flex items-center justify-center font-medium rounded-full ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};

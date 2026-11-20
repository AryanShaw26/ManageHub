import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  className = '',
  disabled = false,
  loading = false,
  icon: Icon,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3 gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-brand-500 hover:bg-brand-600 active:bg-brand-600 text-ink-900 focus:ring-brand-400 font-semibold shadow-warm-sm',
    secondary: 'bg-brand-50 hover:bg-brand-100 text-ink-900 border border-brand-200 focus:ring-brand-300',
    outline: 'border border-border hover:border-ink-500 text-ink-900 bg-surface hover:bg-canvas focus:ring-brand-400',
    ghost: 'text-ink-700 hover:text-ink-900 hover:bg-brand-50 focus:ring-brand-400',
    danger: 'bg-danger hover:bg-red-700 text-white focus:ring-danger shadow-warm-sm',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : Icon ? (
        <Icon className={`w-4 h-4 shrink-0 ${size === 'lg' ? 'w-5 h-5' : ''}`} />
      ) : null}
      {children}
    </button>
  );
};

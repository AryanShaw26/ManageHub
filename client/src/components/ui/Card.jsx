import React from 'react';

export const Card = ({
  children,
  className = '',
  padding = 'p-6',
  variant = 'surface',
  ...props
}) => {
  const variantStyles = {
    surface: 'bg-surface border-border',
    canvas: 'bg-canvas border-border',
    accent: 'bg-brand-50/70 border-brand-200',
    highlight: 'bg-brand-100 border-brand-300',
  };

  return (
    <div
      className={`rounded-card border shadow-warm transition-all duration-200 ${variantStyles[variant]} ${padding} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const MetricCard = ({
  icon: Icon,
  label,
  value,
  helper,
  accent = false,
  className = '',
}) => {
  return (
    <div
      className={`rounded-card border p-5 shadow-warm transition-all duration-200 ${
        accent ? 'bg-brand-50 border-brand-200' : 'bg-surface border-border'
      } ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">{label}</span>
        {Icon && (
          <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center text-ink-900 shadow-sm">
            <Icon className="w-5 h-5 text-ink-900" />
          </div>
        )}
      </div>
      <div className="text-3xl font-bold tracking-tight text-ink-900">{value}</div>
      {helper && <p className="mt-1.5 text-xs text-ink-500">{helper}</p>}
    </div>
  );
};

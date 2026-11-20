import React from 'react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-card bg-surface border border-border ${className}`}>
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-brand-100/80 border border-brand-200 flex items-center justify-center text-ink-900 mb-4 shadow-sm">
          <Icon className="w-7 h-7 text-ink-900" />
        </div>
      )}
      <h3 className="text-base font-bold text-ink-900 mb-1.5">{title}</h3>
      <p className="text-sm text-ink-500 max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} icon={actionIcon}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export const LoadingSkeleton = ({ count = 3, className = '' }) => {
  return (
    <div className={`space-y-3 animate-pulse ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-12 bg-border/60 rounded-xl w-full" />
      ))}
    </div>
  );
};

import React, { forwardRef } from 'react';

export const Select = forwardRef(({
  label,
  error,
  hint,
  id,
  children,
  className = '',
  required = false,
  ...props
}, ref) => {
  const selectId = id || props.name || Math.random().toString(36).substring(2, 9);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold uppercase tracking-wider text-ink-700 mb-1.5">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <select
        id={selectId}
        ref={ref}
        required={required}
        className={`w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm text-ink-900 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-500 disabled:opacity-60 disabled:bg-canvas ${
          error ? 'border-danger focus:ring-danger/30' : 'border-border'
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {hint && !error && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-danger font-medium">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';

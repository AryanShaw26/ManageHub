import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const Input = forwardRef(({
  label,
  type = 'text',
  error,
  hint,
  id,
  className = '',
  required = false,
  showPasswordToggle = false,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || props.name || Math.random().toString(36).substring(2, 9);
  const actualType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-ink-700 mb-1.5">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          ref={ref}
          type={actualType}
          required={required}
          className={`w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-500/60 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-500 disabled:opacity-60 disabled:bg-canvas ${
            error ? 'border-danger focus:ring-danger/30' : 'border-border'
          } ${showPasswordToggle ? 'pr-10' : ''} ${className}`}
          {...props}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-900 p-1 focus:outline-none"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {hint && !error && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-danger font-medium">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

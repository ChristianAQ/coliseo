import type { InputHTMLAttributes, ReactNode } from 'react';

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
  trailing?: ReactNode;
}

export function Field({ label, hint, error, trailing, id, className = '', ...props }: FieldProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full">
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-stone-700">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          className={`w-full rounded-xl border bg-white px-4 py-3 text-[16px] text-stone-900 placeholder:text-stone-400 transition-colors focus:outline-none focus:ring-2 focus:ring-imperial-300 ${
            error ? 'border-defeat-400 focus:ring-defeat-400/40' : 'border-stone-300 focus:border-imperial-400'
          } ${trailing ? 'pr-11' : ''} ${className}`}
          {...props}
        />
        {trailing && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">{trailing}</div>
        )}
      </div>
      {hint && !error && <p className="mt-1.5 text-xs text-stone-500">{hint}</p>}
      {error && <p className="mt-1.5 text-xs font-medium text-defeat-600">{error}</p>}
    </div>
  );
}

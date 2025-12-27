'use client';

import { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function FormInput({
  label,
  error,
  helperText,
  className = '',
  ...props
}: FormInputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-white mb-2">
          {label}
          {props.required && <span className="text-[#ef4444] ml-1">*</span>}
        </label>
      )}
      <input
        className={`w-full px-4 py-2 bg-[#0a0a0a] border ${
          error ? 'border-[#ef4444]' : 'border-[#2a2a2a]'
        } rounded-lg text-white placeholder-[#555555] focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-colors ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-[#ef4444]">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-[#999999]">{helperText}</p>
      )}
    </div>
  );
}

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function FormTextarea({
  label,
  error,
  helperText,
  className = '',
  ...props
}: FormTextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-white mb-2">
          {label}
          {props.required && <span className="text-[#ef4444] ml-1">*</span>}
        </label>
      )}
      <textarea
        className={`w-full px-4 py-2 bg-[#0a0a0a] border ${
          error ? 'border-[#ef4444]' : 'border-[#2a2a2a]'
        } rounded-lg text-white placeholder-[#555555] focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-colors resize-y min-h-[100px] ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-[#ef4444]">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-[#999999]">{helperText}</p>
      )}
    </div>
  );
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string; label: string }>;
}

export function FormSelect({
  label,
  error,
  helperText,
  options,
  className = '',
  ...props
}: FormSelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-white mb-2">
          {label}
          {props.required && <span className="text-[#ef4444] ml-1">*</span>}
        </label>
      )}
      <select
        className={`w-full px-4 py-2 bg-[#0a0a0a] border ${
          error ? 'border-[#ef4444]' : 'border-[#2a2a2a]'
        } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-colors ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-[#ef4444]">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-[#999999]">{helperText}</p>
      )}
    </div>
  );
}


import React from 'react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label?: string;
  error?: string;
  helperText?: string;
  className?: string;
}

export const Input: React.FC<InputProps> = (props) => {
  const {
    label,
    error,
    helperText,
    className = '',
    id,
    type = 'text',
    ...inputProps
  } = props;
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="flex flex-col space-y-2">
      {label && (
        <label 
          htmlFor={inputId}
          className="text-sm font-medium text-slate-700"
        >
          {label}
        </label>
      )}
      <input
        {...inputProps}
        id={inputId}
        type={type}
        className={`
          w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg
          text-slate-900 placeholder-slate-400
          focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-500
          hover:border-slate-400
          transition-colors duration-200
          disabled:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50
          ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-300' : ''}
          ${className}
        `}
      />
      {error && (
        <span className="text-sm text-red-700 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </span>
      )}
      {helperText && !error && (
        <span className="text-sm text-slate-500">{helperText}</span>
      )}
    </div>
  );
};

interface SelectProps {
  label?: string;
  error?: string;
  helperText?: string;
  className?: string;
  id?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = (props) => {
  const {
    label,
    error,
    helperText,
    className = '',
    id,
    children,
    value,
    onChange
  } = props;
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="flex flex-col space-y-2">
      {label && (
        <label 
          htmlFor={selectId}
          className="text-sm font-medium text-slate-700"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        value={value}
        onChange={onChange}
        className={`
          w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg
          text-slate-900
          focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-500
          hover:border-slate-400
          transition-colors duration-200
          disabled:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50
          ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-300' : ''}
          ${className}
        `}
      >
        {children}
      </select>
      {error && (
        <span className="text-sm text-red-700">{error}</span>
      )}
      {helperText && !error && (
        <span className="text-sm text-slate-500">{helperText}</span>
      )}
    </div>
  );
};


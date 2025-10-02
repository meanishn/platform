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
          className="text-sm font-semibold text-white/90"
        >
          {label}
        </label>
      )}
      <input
        {...inputProps}
        id={inputId}
        type={type}
        className={`
          block w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl shadow-lg backdrop-blur-sm
          placeholder-white/50 text-white font-medium
          focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 focus:bg-white/20
          transition-all duration-200
          disabled:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50
          ${error ? 'border-red-400/50 focus:ring-red-400/50 focus:border-red-400/50 bg-red-500/10' : ''}
          ${className}
        `}
      />
      {error && (
        <span className="text-sm text-red-300 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </span>
      )}
      {helperText && !error && (
        <span className="text-sm text-purple-200/70">{helperText}</span>
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
          className="text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        value={value}
        onChange={onChange}
        className={`
          block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
          ${className}
        `}
      >
        {children}
      </select>
      {error && (
        <span className="text-sm text-red-600">{error}</span>
      )}
      {helperText && !error && (
        <span className="text-sm text-gray-500">{helperText}</span>
      )}
    </div>
  );
};

interface TextareaProps {
  label?: string;
  error?: string;
  helperText?: string;
  className?: string;
  id?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
}

export const Textarea: React.FC<TextareaProps> = (props) => {
  const {
    label,
    error,
    helperText,
    className = '',
    id,
    value,
    onChange,
    placeholder,
    rows
  } = props;
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="flex flex-col space-y-2">
      {label && (
        <label 
          htmlFor={textareaId}
          className="text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={`
          block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
          ${className}
        `}
      />
      {error && (
        <span className="text-sm text-red-600">{error}</span>
      )}
      {helperText && !error && (
        <span className="text-sm text-gray-500">{helperText}</span>
      )}
    </div>
  );
};

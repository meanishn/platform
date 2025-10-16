import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  theme?: 'light' | 'dark'; // New theme prop
  noPadding?: boolean; // Option to remove automatic padding if child handles it
}

export const Modal: React.FC<ModalProps> = (props) => {
  const {
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showCloseButton = true,
    theme = 'dark', // Default to light theme
    noPadding = false, // Default to having padding
  } = props;

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  // Theme-based styling
  const themeClasses = {
    light: {
      bg: 'bg-white',
      headerBorder: 'border-slate-200',
      titleText: 'text-slate-900',
      closeButton: 'text-slate-400 hover:text-slate-600',
    },
    dark: {
      bg: 'bg-slate-900 border border-slate-700',
      headerBorder: 'border-slate-700',
      titleText: 'text-white',
      closeButton: 'text-slate-400 hover:text-white',
    },
  };

  const currentTheme = themeClasses[theme];

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 transition-opacity bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal wrapper - has max-height and overflow */}
      <div className={`
        w-full ${sizeClasses[size]}
        relative z-10
        transition-all transform 
        ${currentTheme.bg}
        shadow-2xl
        rounded-2xl
        max-h-[90vh] 
        overflow-hidden
        flex flex-col
      `}>
        {/* Header - fixed, not scrollable */}
        {(title || showCloseButton) && (
          <div className={`flex items-center justify-between px-6 pt-6 pb-4 border-b ${currentTheme.headerBorder} flex-shrink-0`}>
            {title && (
              <h3 className={`text-xl font-semibold ${currentTheme.titleText}`}>{title}</h3>
            )}
            {showCloseButton && (
              <button
                type="button"
                className={`${currentTheme.closeButton} focus:outline-none transition-colors -mr-2`}
                onClick={onClose}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}
        
        {/* Content - scrollable with padding */}
        <div className="overflow-y-auto flex-1">
          <div className={noPadding ? '' : 'p-6'}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );

  // Render modal in a portal at document body level
  return createPortal(modalContent, document.body);
};

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div className={`bg-white border border-slate-200 rounded-lg shadow-sm ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'blue' | 'green' | 'purple' | 'gray' | 'yellow';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const variantClasses = {
    default: 'bg-slate-100 text-slate-700 border border-slate-200',
    success: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    warning: 'bg-amber-100 text-amber-800 border border-amber-200',
    danger: 'bg-red-100 text-red-800 border border-red-200',
    info: 'bg-blue-100 text-blue-800 border border-blue-200',
    primary: 'bg-blue-100 text-blue-800 border border-blue-200',
    blue: 'bg-blue-100 text-blue-800 border border-blue-200',
    green: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    purple: 'bg-purple-100 text-purple-800 border border-purple-200',
    gray: 'bg-slate-100 text-slate-700 border border-slate-200',
    yellow: 'bg-amber-100 text-amber-800 border border-amber-200',
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span className={`
      inline-flex items-center font-medium rounded-full
      ${variantClasses[variant]} ${sizeClasses[size]} ${className}
    `}>
      {children}
    </span>
  );
};

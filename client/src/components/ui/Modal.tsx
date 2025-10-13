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
      headerBorder: 'border-gray-200',
      titleText: 'text-gray-900',
      closeButton: 'text-gray-400 hover:text-gray-600',
    },
    dark: {
      bg: 'bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-white/20',
      headerBorder: 'border-white/10',
      titleText: 'text-white',
      closeButton: 'text-white/60 hover:text-white',
    },
  };

  const currentTheme = themeClasses[theme];

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 transition-opacity bg-black/70 backdrop-blur-sm"
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
    <div className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-lg ${paddingClasses[padding]} ${className}`}>
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
    default: 'bg-gray-500/30 text-gray-200 border border-gray-400/30',
    success: 'bg-green-500/70 text-white border border-green-400/30',
    warning: 'bg-yellow-500/30 text-yellow-200 border border-yellow-400/30',
    danger: 'bg-red-500/30 text-white border border-red-400/30',
    info: 'bg-blue-500/30 text-blue-200 border border-blue-400/30',
    primary: 'bg-purple-600/80 text-white border border-purple-500/50',
    blue: 'bg-blue-500/30 text-blue-200 border border-blue-400/30',
    green: 'bg-green-500/30 text-green-200 border border-green-400/30',
    purple: 'bg-purple-500/30 text-purple-200 border border-purple-400/30',
    gray: 'bg-gray-500/30 text-gray-200 border border-gray-400/30',
    yellow: 'bg-yellow-500/30 text-yellow-200 border border-yellow-400/30',
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span className={`
      inline-flex items-center font-medium rounded-full backdrop-blur-sm
      ${variantClasses[variant]} ${sizeClasses[size]} ${className}
    `}>
      {children}
    </span>
  );
};

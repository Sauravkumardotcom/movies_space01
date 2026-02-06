import React from 'react';
import { useTheme } from '../theme/ThemeProvider';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      className = '',
      children,
      ...props
    },
    ref,
  ) => {
    const { tokens } = useTheme();

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    const variantStyles = {
      primary: {
        background: tokens.colors.primary,
        color: 'white',
        hover: tokens.colors.primaryHover,
      },
      secondary: {
        background: tokens.colors.secondary,
        color: 'white',
        hover: tokens.colors.secondaryHover,
      },
      ghost: {
        background: 'transparent',
        color: tokens.colors.primary,
        hover: tokens.colors.surface,
      },
      danger: {
        background: tokens.colors.error,
        color: 'white',
        hover: '#dc2626',
      },
    };

    const style = variantStyles[variant];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        style={{
          backgroundColor: style.background,
          color: style.color,
        }}
        className={`
          rounded-lg font-semibold transition-all duration-200
          hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed
          ${sizeClasses[size]}
          ${className}
        `}
        onMouseEnter={(e) => {
          if (!disabled && !isLoading) {
            e.currentTarget.style.backgroundColor = style.hover;
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = style.background;
        }}
        {...props}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <span className="animate-spin">⏳</span>
            {children}
          </span>
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    const { tokens } = useTheme();

    return (
      <div className="w-full">
        {label && (
          <label
            style={{ color: tokens.colors.text }}
            className="block text-sm font-medium mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && <div className="absolute left-3 top-2.5 text-lg">{icon}</div>}
          <input
            ref={ref}
            style={{
              backgroundColor: tokens.colors.surface,
              borderColor: error ? tokens.colors.error : tokens.colors.border,
              color: tokens.colors.text,
            }}
            className={`
              w-full px-4 py-2 border rounded-lg transition-colors
              focus:outline-none focus:ring-2 focus:ring-blue-500
              ${icon ? 'pl-10' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p style={{ color: tokens.colors.error }} className="text-sm mt-1">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

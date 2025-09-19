import * as React from 'react';
import { cn } from '@/lib/utils';

// Official Sweden Brand Motion Components
// Following sweden.se motion design principles

interface MotionProps {
  children: React.ReactNode;
  className?: string;
}

// Sweden brand fade-in animation
export function SwedenFadeIn({ children, className }: MotionProps) {
  return (
    <div className={cn(
      'animate-in fade-in duration-sweden-base ease-sweden-ease',
      className
    )}>
      {children}
    </div>
  );
}

// Sweden brand slide-up animation
export function SwedenSlideUp({ children, className }: MotionProps) {
  return (
    <div className={cn(
      'animate-in slide-in-from-bottom-4 duration-sweden-slow ease-sweden-ease-out',
      className
    )}>
      {children}
    </div>
  );
}

// Sweden brand scale animation for cards
export function SwedenScaleHover({ children, className }: MotionProps) {
  return (
    <div className={cn(
      'transition-transform duration-sweden-base ease-sweden-ease',
      'hover:scale-105 focus-within:scale-105',
      className
    )}>
      {children}
    </div>
  );
}

// Sweden brand stagger container for lists
export function SwedenStagger({ children, className }: MotionProps) {
  return (
    <div className={cn(
      'space-y-4',
      '[&>*]:animate-in [&>*]:slide-in-from-left-4 [&>*]:fade-in',
      '[&>*]:duration-sweden-slow [&>*]:ease-sweden-ease-out',
      '[&>*:nth-child(1)]:animation-delay-0',
      '[&>*:nth-child(2)]:animation-delay-75',
      '[&>*:nth-child(3)]:animation-delay-150',
      '[&>*:nth-child(4)]:animation-delay-300',
      className
    )}>
      {children}
    </div>
  );
}

// Sweden brand button with proper motion
interface SwedenButtonProps extends MotionProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  locale?: string;
  asChild?: boolean;
}

export function SwedenButton({
  children,
  className,
  variant = 'primary',
  size = 'md',
  onClick,
  type = 'button',
  disabled,
  locale,
  asChild = false
}: SwedenButtonProps) {
  // Get font class based on locale
  const getFontClass = () => {
    switch (locale) {
      case 'km':
        return 'font-khmer';
      case 'sv':
      case 'en':
        return 'font-sweden';
      default:
        return 'font-sweden';
    }
  };

  const baseClasses = cn(
    'inline-flex items-center justify-center font-medium',
    'transition-all duration-sweden-base ease-sweden-ease',
    'focus:outline-none focus:ring-2 focus:ring-swedenBrand-yellow-primary focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'rounded-sweden border-sweden'
  );

  const variants = {
    primary: cn(
      'bg-swedenBrand-blue-primary text-white',
      'hover:bg-sweden-blue-600 hover:-translate-y-0.5 hover:shadow-sweden-md',
      'active:translate-y-0 active:shadow-sweden-sm'
    ),
    secondary: cn(
      'bg-transparent text-swedenBrand-blue-primary border border-swedenBrand-blue-primary',
      'hover:bg-swedenBrand-blue-primary hover:text-white hover:-translate-y-0.5',
      'active:translate-y-0'
    ),
    ghost: cn(
      'bg-transparent text-swedenBrand-blue-primary',
      'hover:bg-swedenBrand-blue-soft hover:-translate-y-0.5',
      'active:translate-y-0'
    )
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  const finalClasses = cn(
    baseClasses,
    variants[variant],
    sizes[size],
    getFontClass(), // Apply font class after other classes for higher precedence
    className
  );

  if (asChild) {
    return React.cloneElement(children as React.ReactElement, {
      className: cn(
        finalClasses,
        getFontClass(), // Ensure font class is applied to the child element
        (children as React.ReactElement).props.className
      )
    });
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={finalClasses}
    >
      {children}
    </button>
  );
}

// Sweden brand loading spinner
export function SwedenSpinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'inline-block h-5 w-5 animate-spin rounded-full border-2',
        'border-swedenBrand-blue-primary border-r-transparent',
        className
      )}
      role="status"
      aria-label="Laddar..."
    >
      <span className="sr-only">Laddar...</span>
    </div>
  );
}

// Sweden brand progressive enhancement wrapper
export function SwedenProgressiveMotion({
  children,
  className,
  fallback
}: MotionProps & { fallback?: React.ReactNode }) {
  return (
    <div className={cn(
      'motion-safe:animate-in motion-safe:slide-in-from-bottom-4',
      'motion-safe:duration-sweden-slow motion-safe:ease-sweden-ease-out',
      'motion-reduce:animate-none',
      className
    )}>
      {children}
      {fallback && (
        <noscript>
          {fallback}
        </noscript>
      )}
    </div>
  );
}
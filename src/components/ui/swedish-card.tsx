import { cn } from '@/lib/utils';
import Link from 'next/link';
import { forwardRef } from 'react';

/**
 * Official Sweden Brand Card Components
 * Implements Sweden.se card patterns and design system
 */

interface SwedenCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  href?: string;
  variant?: 'default' | 'featured' | 'compact' | 'outline' | 'borderless';
  shadow?: 'sm' | 'md' | 'lg' | 'none';
}

export const SwedenCard = forwardRef<HTMLDivElement | HTMLAnchorElement, SwedenCardProps>(
  ({ children, className, hover = true, href, variant = 'default', shadow = 'sm' }, ref) => {
    const variants = {
      default: 'bg-white border border-sweden-neutral-200',
      featured: 'bg-white border-2 border-sweden-blue-500',
      compact: 'bg-white border border-sweden-neutral-200',
      outline: 'bg-transparent border-2 border-sweden-neutral-300',
      borderless: 'bg-white border-none'
    };

    const shadows = {
      none: '',
      sm: 'shadow-sweden-sm',
      md: 'shadow-sweden-md',
      lg: 'shadow-sweden-lg'
    };

    const cardClasses = cn(
      'overflow-hidden',
      'transition-all duration-sweden-base ease-sweden-standard',
      variants[variant],
      shadows[shadow],
      hover && [
        'hover:shadow-sweden-md hover:-translate-y-0.5',
        variant !== 'borderless' && 'hover:border-sweden-blue-500/30',
        variant === 'featured' && 'hover:border-sweden-blue-600',
        variant === 'outline' && 'hover:border-sweden-blue-500'
      ],
      // Focus states for accessibility - but not for borderless cards
      href && variant !== 'borderless' && 'focus-sweden',
      className
    );

    if (href) {
      return (
        <Link
          href={href}
          className={cardClasses}
          ref={ref as React.Ref<HTMLAnchorElement>}
        >
          {children}
        </Link>
      );
    }

    return (
      <div className={cardClasses} ref={ref as React.Ref<HTMLDivElement>}>
        {children}
      </div>
    );
  }
);
SwedenCard.displayName = 'SwedenCard';

interface SwedenCardHeaderProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'compact';
}

export function SwedenCardHeader({ children, className, variant = 'default' }: SwedenCardHeaderProps) {
  const variants = {
    default: 'p-6 pb-4',
    compact: 'p-4 pb-3'
  };

  return (
    <div className={cn(variants[variant], className)}>
      {children}
    </div>
  );
}

interface SwedenCardContentProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'compact';
}

export function SwedenCardContent({ children, className, variant = 'default' }: SwedenCardContentProps) {
  const variants = {
    default: 'px-6 pb-6',
    compact: 'px-4 pb-4'
  };

  return (
    <div className={cn(variants[variant], className)}>
      {children}
    </div>
  );
}

interface SwedenCardTitleProps {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  size?: 'sm' | 'md' | 'lg';
  locale?: 'sv' | 'en' | 'km';
}

export function SwedenCardTitle({ children, className, as: Component = 'h3', size = 'md', locale }: SwedenCardTitleProps) {
  const sizes = {
    sm: 'text-sweden-xl font-medium',     // 19px
    md: 'text-sweden-2xl font-semibold', // 24px
    lg: 'text-sweden-3xl font-semibold'  // 32px
  };

  const fontClass = locale === 'km' ? 'font-khmer text-khmer-heading' : 'font-sweden text-sweden-heading';

  return (
    <Component className={cn(
      fontClass,
      'mb-3 text-sweden-blue-500',
      'leading-sweden-tight tracking-sweden-tight',
      sizes[size],
      className
    )}>
      {children}
    </Component>
  );
}

interface SwedenCardDescriptionProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'muted';
}

export function SwedenCardDescription({ children, className, variant = 'default' }: SwedenCardDescriptionProps) {
  const variants = {
    default: 'text-sweden-neutral-700',
    muted: 'text-sweden-neutral-600'
  };

  return (
    <p className={cn(
      'text-sweden-body mb-4',
      'leading-sweden-relaxed',
      variants[variant],
      className
    )}>
      {children}
    </p>
  );
}

interface SwedenCardFooterProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'compact';
}

export function SwedenCardFooter({ children, className, variant = 'default' }: SwedenCardFooterProps) {
  const variants = {
    default: 'px-6 py-4 bg-sweden-neutral-50',
    compact: 'px-4 py-3 bg-sweden-neutral-50'
  };

  return (
    <div className={cn(
      'border-t border-sweden-neutral-200 mt-auto',
      variants[variant],
      className
    )}>
      {children}
    </div>
  );
}

interface SwedenCardImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'wide' | 'auto';
}

export function SwedenCardImage({ src, alt, className, aspectRatio = 'video' }: SwedenCardImageProps) {
  const ratios = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[21/9]',
    auto: 'aspect-auto'
  };

  return (
    <div className={cn(
      'relative overflow-hidden',
      ratios[aspectRatio],
      className
    )}>
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-sweden-slow ease-sweden-standard hover:scale-105"
        loading="lazy"
      />
    </div>
  );
}

interface SwedenCardMetaProps {
  children: React.ReactNode;
  className?: string;
}

export function SwedenCardMeta({ children, className }: SwedenCardMetaProps) {
  return (
    <div className={cn(
      'flex items-center gap-4 text-sweden-small text-sweden-neutral-600 mb-3',
      className
    )}>
      {children}
    </div>
  );
}

interface SwedenCardBadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning';
}

export function SwedenCardBadge({ children, className, variant = 'default' }: SwedenCardBadgeProps) {
  const variants = {
    default: 'bg-sweden-neutral-100 text-sweden-neutral-700',
    primary: 'bg-sweden-blue-500 text-white',
    secondary: 'bg-sweden-neutral-200 text-sweden-neutral-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-sweden-yellow-400 text-sweden-neutral-900'
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2 py-1 rounded-sweden text-sweden-xs font-medium',
      'uppercase tracking-sweden-wide',
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}

// Legacy components for backward compatibility
export function SwedishCard(props: SwedenCardProps) {
  return <SwedenCard {...props} />;
}

export function SwedishCardHeader(props: SwedenCardHeaderProps) {
  return <SwedenCardHeader {...props} />;
}

export function SwedishCardContent(props: SwedenCardContentProps) {
  return <SwedenCardContent {...props} />;
}

export function SwedishCardTitle(props: SwedenCardTitleProps) {
  return <SwedenCardTitle {...props} />;
}
import { cn } from '@/lib/utils';

// Official Sweden Brand Accessibility Components
// Following WCAG 2.1 AA standards as required by sweden.se

interface AccessibilityProps {
  children: React.ReactNode;
  className?: string;
}

// Sweden brand skip navigation (required by swedish accessibility law)
interface SwedenSkipNavProps {
  locale?: 'sv' | 'en' | 'km';
}

export function SwedenSkipNav({ locale = 'sv' }: SwedenSkipNavProps) {
  const skipText = {
    sv: 'Hoppa till huvudinnehåll',
    en: 'Skip to main content',
    km: 'រលងទៅខ្លឹមសារមេ'
  };

  const fontClass = locale === 'km' ? 'font-khmer' : 'font-sweden';

  return (
    <a
      href="#main-content"
      className={cn(
        'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4',
        'bg-swedenBrand-blue-primary text-white px-4 py-2 rounded-sweden',
        'focus:z-50 focus:outline-none focus:ring-2 focus:ring-swedenBrand-yellow-primary',
        'transition-all duration-sweden-fast ease-sweden-ease',
        fontClass
      )}
    >
      {skipText[locale]}
    </a>
  );
}

// Sweden brand focus indicator
export function SwedenFocusRing({ children, className }: AccessibilityProps) {
  return (
    <div className={cn(
      'focus-within:ring-2 focus-within:ring-swedenBrand-yellow-primary',
      'focus-within:ring-offset-2 focus-within:outline-none',
      'transition-all duration-sweden-fast ease-sweden-ease',
      className
    )}>
      {children}
    </div>
  );
}

// Screen reader only content (following Swedish accessibility guidelines)
export function SwedenScreenReaderOnly({ children, className }: AccessibilityProps) {
  return (
    <span className={cn('sr-only', className)}>
      {children}
    </span>
  );
}

// High contrast support wrapper
export function SwedenHighContrast({ children, className }: AccessibilityProps) {
  return (
    <div className={cn(
      'contrast-more:bg-white contrast-more:text-black',
      'contrast-more:border-2 contrast-more:border-black',
      className
    )}>
      {children}
    </div>
  );
}

// Sweden brand landmark wrapper with proper ARIA
interface SwedenLandmarkProps extends AccessibilityProps {
  role?: 'main' | 'navigation' | 'banner' | 'contentinfo' | 'complementary' | 'region';
  ariaLabel?: string;
  ariaLabelledBy?: string;
}

export function SwedenLandmark({
  children,
  className,
  role = 'region',
  ariaLabel,
  ariaLabelledBy
}: SwedenLandmarkProps) {
  return (
    <section
      role={role}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={cn(
        'focus:outline-none',
        className
      )}
    >
      {children}
    </section>
  );
}

// Sweden brand heading with proper hierarchy
interface SwedenHeadingProps extends AccessibilityProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  visualLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  id?: string;
}

export function SwedenHeading({
  children,
  className,
  level,
  visualLevel,
  id
}: SwedenHeadingProps) {
  const Component = `h${level}` as const;
  const displayLevel = visualLevel || level;

  const styles = {
    1: 'text-4xl lg:text-6xl font-bold text-sweden-heading tracking-sweden-tight',
    2: 'text-3xl lg:text-4xl font-bold text-sweden-heading tracking-sweden-tight',
    3: 'text-xl lg:text-2xl font-semibold text-sweden-heading tracking-sweden-normal',
    4: 'text-lg lg:text-xl font-semibold text-sweden-heading tracking-sweden-normal',
    5: 'text-base lg:text-lg font-semibold text-sweden-heading tracking-sweden-normal',
    6: 'text-sm lg:text-base font-semibold text-sweden-heading tracking-sweden-normal'
  };

  return (
    <Component
      id={id}
      className={cn(
        styles[displayLevel],
        'text-swedenBrand-blue-primary leading-sweden-tight',
        'focus:outline-none focus:ring-2 focus:ring-swedenBrand-yellow-primary',
        className
      )}
    >
      {children}
    </Component>
  );
}

// Sweden brand button with enhanced accessibility
interface SwedenAccessibleButtonProps extends AccessibilityProps {
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  ariaPressed?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export function SwedenAccessibleButton({
  children,
  className,
  onClick,
  type = 'button',
  disabled,
  ariaLabel,
  ariaDescribedBy,
  ariaPressed,
  variant = 'primary'
}: SwedenAccessibleButtonProps) {
  const variants = {
    primary: cn(
      'bg-swedenBrand-blue-primary text-white',
      'hover:bg-sweden-blue-600 focus:bg-sweden-blue-600',
      'disabled:bg-swedenBrand-neutral-400'
    ),
    secondary: cn(
      'bg-transparent text-swedenBrand-blue-primary border border-swedenBrand-blue-primary',
      'hover:bg-swedenBrand-blue-primary hover:text-white',
      'focus:bg-swedenBrand-blue-primary focus:text-white'
    ),
    ghost: cn(
      'bg-transparent text-swedenBrand-blue-primary',
      'hover:bg-swedenBrand-blue-soft focus:bg-swedenBrand-blue-soft'
    )
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-pressed={ariaPressed}
      className={cn(
        'inline-flex items-center justify-center px-6 py-3',
        'font-medium text-base rounded-sweden',
        'focus:outline-none focus:ring-2 focus:ring-swedenBrand-yellow-primary focus:ring-offset-2',
        'transition-all duration-sweden-base ease-sweden-ease',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'min-h-[44px] min-w-[44px]', // Minimum touch target size
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
}

// Sweden brand link with enhanced accessibility
interface SwedenAccessibleLinkProps extends AccessibilityProps {
  href: string;
  external?: boolean;
  ariaLabel?: string;
  target?: string;
}

export function SwedenAccessibleLink({
  children,
  className,
  href,
  external,
  ariaLabel,
  target
}: SwedenAccessibleLinkProps) {
  return (
    <a
      href={href}
      target={target || (external ? '_blank' : undefined)}
      rel={external ? 'noopener noreferrer' : undefined}
      aria-label={ariaLabel}
      className={cn(
        'text-swedenBrand-blue-primary underline underline-offset-2',
        'hover:text-swedenBrand-blue-light focus:text-swedenBrand-blue-light',
        'focus:outline-none focus:ring-2 focus:ring-swedenBrand-yellow-primary focus:ring-offset-1',
        'transition-colors duration-sweden-base ease-sweden-ease',
        'rounded-sm px-1 py-0.5 -mx-1 -my-0.5', // Slightly larger focus area
        className
      )}
    >
      {children}
      {external && (
        <span className="sr-only">
          (öppnas i nytt fönster)
        </span>
      )}
    </a>
  );
}

// Sweden brand status announcer for dynamic content
interface SwedenStatusProps {
  message: string;
  type?: 'polite' | 'assertive';
  className?: string;
}

export function SwedenStatus({ message, type = 'polite', className }: SwedenStatusProps) {
  return (
    <div
      role="status"
      aria-live={type}
      aria-atomic="true"
      className={cn('sr-only', className)}
    >
      {message}
    </div>
  );
}
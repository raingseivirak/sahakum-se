import { cn } from '@/lib/utils';

// Official Sweden Brand Typography Components
// Following sweden.se design system specifications

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
  locale?: 'sv' | 'en' | 'km';
}

// Official Sweden heading components with exact sweden.se specifications
export function SwedenH1({ children, className, locale }: TypographyProps) {
  const fontClass = locale === 'km' ? 'font-khmer text-khmer-heading' : 'font-sweden text-sweden-heading';

  return (
    <h1 className={cn(
      // Sweden.se styling with locale-aware fonts - matching header sizes (42px mobile, 66px desktop)
      fontClass,
      'text-4xl lg:text-6xl font-semibold',
      'leading-[1.07] tracking-[-0.84px]', // exact sweden.se header specs
      'text-swedenBrand-blue-primary mb-6',
      className
    )}>
      {children}
    </h1>
  );
}

export function SwedenH2({ children, className, locale }: TypographyProps) {
  const fontClass = locale === 'km' ? 'font-khmer text-khmer-heading' : 'font-sweden text-sweden-heading';

  return (
    <h2 className={cn(
      // Sweden.se styling with locale-aware fonts - matching header sizes
      fontClass,
      'text-3xl lg:text-4xl font-semibold',
      'leading-[1.07] tracking-[-0.84px]', // exact sweden.se header specs
      'text-swedenBrand-blue-primary mb-4',
      className
    )}>
      {children}
    </h2>
  );
}

export function SwedenH3({ children, className, locale }: TypographyProps) {
  const fontClass = locale === 'km' ? 'font-khmer text-khmer-heading' : 'font-sweden text-sweden-heading';

  return (
    <h3 className={cn(
      // Sweden.se styling with locale-aware fonts - moderate size for H3
      fontClass,
      'text-xl lg:text-2xl font-semibold',
      'leading-[1.29] tracking-[-0.36px]', // exact sweden.se specs
      'text-swedenBrand-blue-primary mb-3',
      className
    )}>
      {children}
    </h3>
  );
}

// Official Sweden body text (19px as per sweden.se)
export function SwedenBody({ children, className, locale }: TypographyProps) {
  const fontClass = locale === 'km' ? 'font-khmer text-khmer-body' : 'font-sweden text-sweden-body';

  return (
    <p className={cn(
      // Sweden.se body styling with locale-aware fonts
      fontClass,
      'text-[19px] font-normal',
      'leading-[1.42] tracking-[-0.36px]', // exact sweden.se specs
      'text-swedenBrand-neutral-600 mb-4',
      className
    )}>
      {children}
    </p>
  );
}

// Sweden brand subtitle/lead text
export function SwedenLead({ children, className, locale }: TypographyProps) {
  const fontClass = locale === 'km' ? 'font-khmer text-khmer-body' : 'font-sweden text-sweden-body';

  return (
    <p className={cn(
      // Sweden.se lead styling with locale-aware fonts - larger for prominence
      fontClass,
      'text-xl lg:text-2xl font-medium',
      'leading-[1.42] tracking-[-0.36px]', // exact sweden.se specs
      'text-swedenBrand-yellow-primary mb-6',
      className
    )}>
      {children}
    </p>
  );
}

// Sweden brand small text
export function SwedenSmall({ children, className }: TypographyProps) {
  return (
    <small className={cn(
      // Exact sweden.se small text styling - Inter font
      'font-sweden text-sm font-normal',
      'leading-[1.42] tracking-[-0.28px]', // sweden.se small text specs
      'text-swedenBrand-neutral-500',
      className
    )}>
      {children}
    </small>
  );
}

// Sweden brand link component
interface SwedenLinkProps extends TypographyProps {
  href: string;
  external?: boolean;
}

export function SwedenLink({ children, className, href, external }: SwedenLinkProps) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={cn(
        // Exact sweden.se link styling - Inter font
        'font-sweden text-[19px] font-normal',
        'leading-[1.42] tracking-[-0.36px]', // exact sweden.se specs
        'text-swedenBrand-blue-primary underline underline-offset-2',
        'hover:text-swedenBrand-blue-light transition-colors duration-sweden-base',
        'focus:outline-none focus:ring-2 focus:ring-swedenBrand-yellow-primary focus:ring-offset-2',
        className
      )}
    >
      {children}
    </a>
  );
}

// Sweden brand quote component
export function SwedenQuote({ children, className, cite }: TypographyProps & { cite?: string }) {
  return (
    <blockquote
      cite={cite}
      className={cn(
        // Exact sweden.se quote styling - Inter font
        'font-sweden text-xl font-normal italic',
        'leading-[1.42] tracking-[-0.36px]', // exact sweden.se specs
        'border-l-4 border-swedenBrand-yellow-primary pl-6 py-4',
        'text-swedenBrand-neutral-700 bg-swedenBrand-blue-soft/50',
        className
      )}
    >
      {children}
    </blockquote>
  );
}
import { cn } from '@/lib/utils';

/**
 * Sweden Brand Container Component
 * Follows official Sweden.se container patterns and grid system
 */
interface SwedenContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'content' | 'wide' | 'reading';
}

export function SwedenContainer({ children, className, size = 'lg' }: SwedenContainerProps) {
  const sizes = {
    sm: 'container-sweden-sm',      // 640px
    md: 'container-sweden-md',      // 768px
    lg: 'container-sweden-lg',      // 1024px
    xl: 'container-sweden-xl',      // 1280px
    xxl: 'container-sweden-xxl',    // 1440px - Wider Sweden.se page width
    content: 'container-sweden-content',  // 896px - Sweden.se content width
    wide: 'container-sweden-wide',  // 1200px - Sweden.se article page width
    reading: 'container-sweden-reading'   // 672px - Optimal reading width
  };

  return (
    <div className={cn(
      'container-sweden',
      sizes[size],
      className
    )}>
      {children}
    </div>
  );
}

/**
 * Sweden Brand Grid System Component
 * Implements official Sweden.se 12-column grid system
 */
interface SwedenGridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 6 | 12 | 'responsive';
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function SwedenGrid({ children, cols = 'responsive', gap = 'md', className }: SwedenGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sweden-md:grid-cols-2',
    3: 'grid-cols-1 sweden-md:grid-cols-2 sweden-lg:grid-cols-3',
    4: 'grid-cols-1 sweden-md:grid-cols-2 sweden-lg:grid-cols-4',
    6: 'grid-cols-1 sweden-md:grid-cols-3 sweden-lg:grid-cols-6',
    12: 'grid-cols-12',
    responsive: 'grid-sweden-responsive'
  };

  const gaps = {
    sm: 'gap-4',      // 16px
    md: 'gap-6',      // 24px - Sweden brand standard
    lg: 'gap-8',      // 32px
    xl: 'gap-12'      // 48px
  };

  return (
    <div className={cn(
      'grid',
      gridCols[cols],
      gaps[gap],
      className
    )}>
      {children}
    </div>
  );
}

/**
 * Sweden Brand Grid Item Component
 * For precise control over grid positioning
 */
interface SwedenGridItemProps {
  children: React.ReactNode;
  span?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  start?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  className?: string;
}

export function SwedenGridItem({ children, span, start, className }: SwedenGridItemProps) {
  const spanClasses = {
    1: 'col-span-1',
    2: 'col-span-2',
    3: 'col-span-3',
    4: 'col-span-4',
    5: 'col-span-5',
    6: 'col-span-6',
    7: 'col-span-7',
    8: 'col-span-8',
    9: 'col-span-9',
    10: 'col-span-10',
    11: 'col-span-11',
    12: 'col-span-12'
  };

  const startClasses = {
    1: 'col-start-1',
    2: 'col-start-2',
    3: 'col-start-3',
    4: 'col-start-4',
    5: 'col-start-5',
    6: 'col-start-6',
    7: 'col-start-7',
    8: 'col-start-8',
    9: 'col-start-9',
    10: 'col-start-10',
    11: 'col-start-11',
    12: 'col-start-12'
  };

  return (
    <div className={cn(
      span && spanClasses[span],
      start && startClasses[start],
      className
    )}>
      {children}
    </div>
  );
}

/**
 * Legacy Container Component for backward compatibility
 */
interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'wide';
}

export function Container({ children, className, size = 'lg' }: ContainerProps) {
  // Map legacy sizes to Sweden container sizes
  const sizeMapping = {
    sm: 'sm' as const,
    md: 'md' as const,
    lg: 'lg' as const,
    xl: 'xl' as const,
    xxl: 'xxl' as const,
    wide: 'wide' as const
  };

  return (
    <SwedenContainer size={sizeMapping[size]} className={className}>
      {children}
    </SwedenContainer>
  );
}

/**
 * Legacy Grid Component for backward compatibility
 */
interface GridProps {
  children: React.ReactNode;
  cols?: number;
  gap?: number;
  className?: string;
}

export function Grid({ children, cols = 12, gap = 6, className }: GridProps) {
  // Map legacy props to Sweden grid props
  const colsMapping = {
    1: 1 as const,
    2: 2 as const,
    3: 3 as const,
    4: 4 as const,
    6: 6 as const,
    12: 12 as const
  };

  const gapMapping = {
    4: 'sm' as const,
    6: 'md' as const,
    8: 'lg' as const,
    12: 'xl' as const
  };

  return (
    <SwedenGrid
      cols={colsMapping[cols as keyof typeof colsMapping] || 'responsive'}
      gap={gapMapping[gap as keyof typeof gapMapping] || 'md'}
      className={className}
    >
      {children}
    </SwedenGrid>
  );
}
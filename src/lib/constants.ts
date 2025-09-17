// Sahakum Khmer CMS - Constants

// Supported languages
export const LANGUAGES = {
  sv: { name: 'Svenska', flag: '🇸🇪' },
  en: { name: 'English', flag: '🇬🇧' },
  km: { name: 'ខ្មែរ', flag: '🇰🇭' }
} as const;

export type Language = keyof typeof LANGUAGES;

// Content types
export const CONTENT_TYPES = {
  PAGE: 'PAGE',
  POST: 'POST',
  EVENT: 'EVENT',
  RECIPE: 'RECIPE',
  NEWS: 'NEWS'
} as const;

// User roles
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  EDITOR: 'EDITOR',
  AUTHOR: 'AUTHOR'
} as const;

// Content status
export const CONTENT_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED'
} as const;

// Official Sweden Brand Colors
export const SWEDEN_BRAND_COLORS = {
  // Primary Colors
  blue: {
    primary: '#006AA7',     // Official Sweden Blue
    light: '#0093BD',       // Sweden Blue Light
    navy: '#003366',        // Sweden Blue Navy
    soft: '#E6F4FB',        // Sweden Blue Soft
    50: '#f0f7fc',
    100: '#c7e4f5',
    200: '#9ed1ee',
    300: '#75bde7',
    400: '#4ca9e0',
    500: '#006AA7',
    600: '#005a91',
    700: '#004b7a',
    800: '#003c63',
    900: '#142638'
  },
  yellow: {
    primary: '#FECC02',     // Official Sweden Yellow
    soft: '#FFF5CC',        // Sweden Yellow Soft
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#FECC02',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f'
  },
  // Official Sweden Neutral Palette
  neutral: {
    white: '#FAFAFA',
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#142638'
  },
  // Semantic Colors
  semantic: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6'
  }
} as const;

// Sahakum Khmer Brand Colors (secondary palette)
export const SAHAKUM_BRAND_COLORS = {
  gold: {
    50: '#fef7ed',
    100: '#fdedd3',
    200: '#fbd6a5',
    300: '#f8b96d',
    400: '#f59e42',
    500: '#D4932F',    // Primary Sahakum Gold
    600: '#c27f26',
    700: '#a16621',
    800: '#835420',
    900: '#6c451d'
  },
  navy: {
    50: '#f1f3f7',
    100: '#e1e7ee',
    200: '#c7d2e0',
    300: '#a1b4ca',
    400: '#7591b0',
    500: '#557298',
    600: '#445c7f',
    700: '#394a67',
    800: '#323f56',
    900: '#0D1931'     // Primary Sahakum Navy
  }
} as const;

// Legacy support - deprecated, use SWEDEN_BRAND_COLORS instead
export const BRAND_COLORS = {
  swedenBlue: SWEDEN_BRAND_COLORS.blue.primary,
  swedenBlueLight: SWEDEN_BRAND_COLORS.blue.light,
  swedenYellow: SWEDEN_BRAND_COLORS.yellow.primary,
  cambodianGold: SAHAKUM_BRAND_COLORS.gold[500],
  cambodianNavy: SAHAKUM_BRAND_COLORS.navy[900]
} as const;

// Official Sweden Typography Scale
export const SWEDEN_TYPOGRAPHY = {
  fontSize: {
    xs: '0.8125rem',      // 13px
    sm: '0.875rem',       // 14px
    base: '1rem',         // 16px - Base unit
    lg: '1.125rem',       // 18px
    xl: '1.1875rem',      // 19px - Sweden.se body standard
    '2xl': '1.5rem',      // 24px
    '3xl': '2rem',        // 32px
    '4xl': '2.5rem',      // 40px
    '5xl': '3rem',        // 48px
    '6xl': '4rem'         // 64px
  },
  lineHeight: {
    tight: 1.29,          // For headings
    base: 1.42,           // For body text
    relaxed: 1.5          // For long-form content
  },
  letterSpacing: {
    tight: '-0.36px',     // For large headings
    normal: '-0.28px',    // For body text
    wide: '0.05em'        // For small caps
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  }
} as const;

// Sweden Brand Grid System
export const SWEDEN_GRID = {
  columns: 12,
  gutter: '1.5rem',       // 24px
  margin: {
    mobile: '1rem',       // 16px
    desktop: '2rem'       // 32px
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },
  containers: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    content: '896px',     // Sweden.se content width
    reading: '672px'      // Optimal reading width
  }
} as const;

// Sweden Brand Motion Design
export const SWEDEN_MOTION = {
  duration: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms'
  },
  easing: {
    standard: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    enter: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    exit: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)'
  }
} as const;

// Sweden Brand Spacing Scale (8px grid)
export const SWEDEN_SPACING = {
  xs: '0.25rem',          // 4px
  sm: '0.5rem',           // 8px
  md: '1rem',             // 16px
  lg: '1.5rem',           // 24px
  xl: '2rem',             // 32px
  '2xl': '3rem',          // 48px
  '3xl': '4rem',          // 64px
  '4xl': '6rem'           // 96px
} as const;

// Sweden Brand Shadow System
export const SWEDEN_SHADOWS = {
  sm: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
  base: '0 2px 6px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.24)',
  md: '0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)',
  lg: '0 8px 24px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.12)',
  xl: '0 16px 48px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.12)'
} as const;

// Sweden Brand Border Radius
export const SWEDEN_RADIUS = {
  sm: '2px',
  base: '4px',            // Default Sweden brand radius
  md: '6px',
  lg: '8px',
  xl: '12px'
} as const;
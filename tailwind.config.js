/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Official Sweden Brand Colors
      colors: {
        // Primary Sweden Brand Colors
        sweden: {
          blue: {
            50: '#f0f7fc',
            100: '#c7e4f5',
            200: '#9ed1ee',
            300: '#75bde7',
            400: '#4ca9e0',
            500: '#006AA7', // Primary Sweden Blue
            600: '#005a91',
            700: '#004b7a',
            800: '#003c63',
            900: '#142638', // Dark neutral
          },
          yellow: {
            50: '#fffbeb',
            100: '#fef3c7',
            200: '#fde68a',
            300: '#fcd34d',
            400: '#FECC02', // Primary Sweden Yellow
            500: '#f59e0b',
            600: '#d97706',
            700: '#b45309',
            800: '#92400e',
            900: '#78350f',
          },
        },

        // Official Sweden Brand Extended Palette
        swedenBrand: {
          // Primary colors
          'blue-primary': '#006AA7',
          'yellow-primary': '#FECC02',

          // Secondary blues
          'blue-light': '#0093BD',
          'blue-navy': '#003366',
          'blue-soft': '#E6F4FB',

          // Neutrals following Sweden.se pattern
          'neutral-white': '#FAFAFA',
          'neutral-light': '#F9FAFB',
          'neutral-100': '#F3F4F6',
          'neutral-200': '#E5E7EB',
          'neutral-300': '#D1D5DB',
          'neutral-400': '#9CA3AF',
          'neutral-500': '#6B7280',
          'neutral-600': '#4B5563',
          'neutral-700': '#374151',
          'neutral-800': '#1F2937',
          'neutral-900': '#142638',

          // Semantic colors
          'success': '#10B981',
          'warning': '#F59E0B',
          'error': '#EF4444',
          'info': '#3B82F6',
        },

        // Sahakum Khmer Brand Colors
        sahakum: {
          gold: {
            50: '#fef7ed',
            100: '#fdedd3',
            200: '#fbd6a5',
            300: '#f8b96d',
            400: '#f59e42',
            500: '#D4932F', // Primary Sahakum Gold
            600: '#c27f26',
            700: '#a16621',
            800: '#835420',
            900: '#6c451d',
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
            900: '#0D1931', // Primary Sahakum Navy
          },
        },
      },

      // Sweden Brand Typography Scale
      fontSize: {
        // Following Sweden.se typography scale
        'xs': ['13px', { lineHeight: '18px', letterSpacing: '-0.01em' }],
        'sm': ['14px', { lineHeight: '20px', letterSpacing: '-0.01em' }],
        'base': ['16px', { lineHeight: '24px', letterSpacing: '-0.01em' }],
        'lg': ['18px', { lineHeight: '26px', letterSpacing: '-0.02em' }],
        'xl': ['19px', { lineHeight: '28px', letterSpacing: '-0.02em' }],
        '2xl': ['24px', { lineHeight: '32px', letterSpacing: '-0.02em' }],
        '3xl': ['32px', { lineHeight: '40px', letterSpacing: '-0.02em' }],
        '4xl': ['40px', { lineHeight: '48px', letterSpacing: '-0.02em' }],
        '5xl': ['48px', { lineHeight: '56px', letterSpacing: '-0.02em' }],
        '6xl': ['64px', { lineHeight: '72px', letterSpacing: '-0.02em' }],
      },

      // Line heights matching Sweden.se patterns
      lineHeight: {
        'sweden-tight': '1.29',
        'sweden-base': '1.42',
        'sweden-relaxed': '1.5',
      },

      // Letter spacing
      letterSpacing: {
        'sweden-tight': '-0.36px',
        'sweden-normal': '-0.28px',
        'sweden-wide': '0.05em',
      },

      // Font families for trilingual support (official Sweden Brand fonts with fallbacks)
      fontFamily: {
        // Official Sweden Brand fonts (Swedish/English) - Sweden Sans with Next.js optimized Inter fallback
        'sweden': ['Sweden Sans', 'var(--font-inter)', 'system-ui', 'sans-serif'],
        'sweden-bold': ['Sweden Sans', 'var(--font-inter)', 'system-ui', 'sans-serif'],
        'sans': ['Sweden Sans', 'var(--font-inter)', 'system-ui', 'sans-serif'],

        // Khmer language font
        'khmer': ['Noto Sans Khmer', 'Noto Sans', 'sans-serif'],

        // Multilingual fallback (supports all languages)
        'multilingual': ['Sweden Sans', 'var(--font-inter)', 'Noto Sans Khmer', 'system-ui', 'sans-serif'],
      },

      // Grid system following Sweden.se 12-column layout
      maxWidth: {
        'sweden-sm': '640px',    // Small container
        'sweden-md': '768px',    // Medium container
        'sweden-lg': '1024px',   // Large container
        'sweden-xl': '1280px',   // Extra large container
        'sweden-2xl': '1536px',  // 2X large container
        'sweden-content': '896px', // Content width (typical for Sweden.se)
        'sweden-reading': '672px', // Optimal reading width
      },

      // Spacing scale following 8px grid
      spacing: {
        '15': '3.75rem',   // 60px
        '18': '4.5rem',    // 72px
        '22': '5.5rem',    // 88px
        '26': '6.5rem',    // 104px
        '30': '7.5rem',    // 120px
        '34': '8.5rem',    // 136px
        '38': '9.5rem',    // 152px
        '42': '10.5rem',   // 168px
        '46': '11.5rem',   // 184px
        '50': '12.5rem',   // 200px
      },

      // Border radius following Sweden design system
      borderRadius: {
        'sweden-sm': '2px',
        'sweden': '4px',
        'sweden-md': '6px',
        'sweden-lg': '8px',
        'sweden-xl': '12px',
      },

      // Shadows following Sweden.se elevation system
      boxShadow: {
        'sweden-sm': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
        'sweden': '0 2px 6px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.24)',
        'sweden-md': '0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)',
        'sweden-lg': '0 8px 24px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.12)',
        'sweden-xl': '0 16px 48px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.12)',
      },

      // Animation timing following Sweden motion design
      transitionTimingFunction: {
        'sweden-ease': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'sweden-ease-in': 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
        'sweden-ease-out': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'sweden-ease-in-out': 'cubic-bezier(0.645, 0.045, 0.355, 1)',
      },

      // Animation durations
      transitionDuration: {
        'sweden-fast': '150ms',
        'sweden-base': '200ms',
        'sweden-slow': '300ms',
        'sweden-slower': '500ms',
      },

      // Grid columns for Sweden 12-column system
      gridTemplateColumns: {
        'sweden-1': 'repeat(1, minmax(0, 1fr))',
        'sweden-2': 'repeat(2, minmax(0, 1fr))',
        'sweden-3': 'repeat(3, minmax(0, 1fr))',
        'sweden-4': 'repeat(4, minmax(0, 1fr))',
        'sweden-6': 'repeat(6, minmax(0, 1fr))',
        'sweden-12': 'repeat(12, minmax(0, 1fr))',
      },

      // Container queries
      screens: {
        'sweden-sm': '640px',
        'sweden-md': '768px',
        'sweden-lg': '1024px',
        'sweden-xl': '1280px',
        'sweden-2xl': '1536px',
      },
    },
  },
  plugins: [
    // Custom plugin for Sweden brand utilities
    function({ addUtilities, addComponents, theme }) {
      const swedishUtilities = {
        // Typography utilities
        '.text-sweden-hierarchy': {
          fontFamily: theme('fontFamily.sweden'),
          lineHeight: theme('lineHeight.sweden-base'),
          letterSpacing: theme('letterSpacing.sweden-normal'),
        },
        '.text-sweden-heading': {
          fontWeight: '600',
          lineHeight: theme('lineHeight.sweden-tight'),
          letterSpacing: theme('letterSpacing.sweden-tight'),
        },
        '.text-sweden-body': {
          fontWeight: '400',
          lineHeight: theme('lineHeight.sweden-relaxed'),
          letterSpacing: theme('letterSpacing.sweden-normal'),
        },

        // Focus states following Sweden accessibility guidelines
        '.focus-sweden': {
          outline: `2px solid ${theme('colors.sweden.yellow.400')}`,
          outlineOffset: '2px',
        },

        // Container utilities
        '.container-sweden': {
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: theme('spacing.4'),
          paddingRight: theme('spacing.4'),
          '@screen sweden-sm': {
            paddingLeft: theme('spacing.6'),
            paddingRight: theme('spacing.6'),
          },
          '@screen sweden-lg': {
            paddingLeft: theme('spacing.8'),
            paddingRight: theme('spacing.8'),
          },
        },
        '.container-sweden-sm': {
          maxWidth: theme('maxWidth.sweden-sm'),
        },
        '.container-sweden-md': {
          maxWidth: theme('maxWidth.sweden-md'),
        },
        '.container-sweden-lg': {
          maxWidth: theme('maxWidth.sweden-lg'),
        },
        '.container-sweden-xl': {
          maxWidth: theme('maxWidth.sweden-xl'),
        },
        '.container-sweden-content': {
          maxWidth: theme('maxWidth.sweden-content'),
        },
      };

      const swedishComponents = {
        // Card components following Sweden.se patterns
        '.card-sweden': {
          backgroundColor: theme('colors.white'),
          border: `1px solid ${theme('colors.swedenBrand.neutral-200')}`,
          borderRadius: theme('borderRadius.sweden'),
          boxShadow: theme('boxShadow.sweden-sm'),
          overflow: 'hidden',
          transition: `all ${theme('transitionDuration.sweden-base')} ${theme('transitionTimingFunction.sweden-ease')}`,
          '&:hover': {
            boxShadow: theme('boxShadow.sweden-md'),
            transform: 'translateY(-2px)',
            borderColor: `color-mix(in srgb, ${theme('colors.sweden.blue.500')} 20%, transparent)`,
          },
        },

        // Button components following Sweden design system
        '.btn-sweden-primary': {
          backgroundColor: theme('colors.sweden.blue.500'),
          color: theme('colors.white'),
          padding: `${theme('spacing.3')} ${theme('spacing.6')}`,
          borderRadius: theme('borderRadius.sweden'),
          fontWeight: '500',
          fontSize: theme('fontSize.sm'),
          lineHeight: theme('lineHeight.sweden-base'),
          letterSpacing: theme('letterSpacing.sweden-normal'),
          border: 'none',
          cursor: 'pointer',
          transition: `all ${theme('transitionDuration.sweden-base')} ${theme('transitionTimingFunction.sweden-ease')}`,
          '&:hover': {
            backgroundColor: theme('colors.sweden.blue.600'),
            transform: 'translateY(-1px)',
          },
          '&:focus': {
            outline: `2px solid ${theme('colors.sweden.yellow.400')}`,
            outlineOffset: '2px',
          },
        },

        '.btn-sweden-secondary': {
          backgroundColor: 'transparent',
          color: theme('colors.sweden.blue.500'),
          padding: `${theme('spacing.3')} ${theme('spacing.6')}`,
          borderRadius: theme('borderRadius.sweden'),
          fontWeight: '500',
          fontSize: theme('fontSize.sm'),
          lineHeight: theme('lineHeight.sweden-base'),
          letterSpacing: theme('letterSpacing.sweden-normal'),
          border: `1px solid ${theme('colors.sweden.blue.500')}`,
          cursor: 'pointer',
          transition: `all ${theme('transitionDuration.sweden-base')} ${theme('transitionTimingFunction.sweden-ease')}`,
          '&:hover': {
            backgroundColor: theme('colors.sweden.blue.500'),
            color: theme('colors.white'),
          },
          '&:focus': {
            outline: `2px solid ${theme('colors.sweden.yellow.400')}`,
            outlineOffset: '2px',
          },
        },
      };

      addUtilities(swedishUtilities);
      addComponents(swedishComponents);
    },
  ],
};
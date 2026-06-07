/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primary - Chinese Crimson
        primary: {
          DEFAULT: '#B91C1C',
          dark: '#7F1D1D',
          light: '#DC2626',
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
        },
        // Secondary - Charcoal Navy
        secondary: {
          DEFAULT: '#1E293B',
          light: '#334155',
          dark: '#0F172A',
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        // Accent - Antique Gold
        accent: {
          DEFAULT: '#D97706',
          light: '#F59E0B',
          dark: '#B45309',
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        // Neutral - Warm Stone
        neutral: {
          50: '#FAFAF9',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
        },
        // Semantic Colors
        success: {
          DEFAULT: '#059669',
          light: '#10B981',
          dark: '#047857',
        },
        warning: {
          DEFAULT: '#D97706',
          light: '#F59E0B',
          dark: '#B45309',
        },
        error: {
          DEFAULT: '#DC2626',
          light: '#EF4444',
          dark: '#B91C1C',
        },
        info: {
          DEFAULT: '#0284C7',
          light: '#0EA5E9',
          dark: '#0369A1',
        },
      },
      fontFamily: {
        sans: ['Be Vietnam Pro', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Noto Serif SC', 'Songti SC', 'serif'],
      },
      boxShadow: {
        'primary': '0 4px 14px 0 rgba(185, 28, 28, 0.25)',
        'primary-lg': '0 6px 20px 0 rgba(185, 28, 28, 0.35)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 12px 24px -10px rgba(0, 0, 0, 0.15)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
    },
  },
  plugins: [],
};

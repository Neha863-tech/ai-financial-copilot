/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070B14',
          900: '#0B1120',
          850: '#0E172B',
          800: '#131F38',
          700: '#1E2D4A',
          600: '#33476E',
        },
        lavender: {
          50: '#FAF8FF',
          100: '#F3EFFF',
          200: '#E9E2FE',
          300: '#D8CCFD',
          400: '#BAA3FB',
          500: '#9B74F8',
          600: '#7C3AED',
          700: '#6422D6',
          800: '#4C1D95',
          900: '#2E1065',
        },
        electric: {
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          950: '#081736',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(11, 17, 32, 0.05), 0 1px 2px -1px rgba(11, 17, 32, 0.05)',
        card: '0 4px 20px -2px rgba(124, 58, 237, 0.06), 0 2px 6px -1px rgba(11, 17, 32, 0.04)',
        'card-hover': '0 10px 25px -3px rgba(124, 58, 237, 0.12), 0 4px 10px -2px rgba(37, 99, 235, 0.08)',
        glow: '0 0 20px -3px rgba(124, 58, 237, 0.35)',
        'glow-blue': '0 0 20px -3px rgba(37, 99, 235, 0.35)',
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand theme keyed off CONFIG.brand_name = "Voya"
        brand: {
          50: '#eef5ff',
          100: '#d9e8ff',
          200: '#bcd7ff',
          300: '#8ebdff',
          400: '#5996ff',
          500: '#326dff',
          600: '#1b4df5',
          700: '#1539e1',
          800: '#1830b6',
          900: '#1a2f8f',
          950: '#151d57',
        },
        ink: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d4d9e3',
          300: '#aeb7cb',
          400: '#8290ad',
          500: '#5f6e8f',
          600: '#4a5675',
          700: '#3d4660',
          800: '#353c52',
          900: '#0f1729',
          950: '#080d1a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,41,0.06), 0 8px 24px -12px rgba(15,23,41,0.18)',
        lift: '0 12px 40px -12px rgba(27,77,245,0.35)',
      },
      keyframes: {
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s infinite',
        'fade-up': 'fade-up 0.4s ease-out',
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        blue: {
          50: '#F0F6F4', 100: '#E2EEEA', 200: '#C8DED7', 300: '#A5C7BB',
          400: '#7EAA9A', 500: '#5D8D7E', 600: '#3C796B', 700: '#216459',
          800: '#17483F', 900: '#123C37', 950: '#0C2B27',
        },
        green: {
          50: '#EFF7F1', 100: '#DEEEE2', 200: '#C2E0CC', 300: '#9FCBAE',
          400: '#78B08F', 500: '#559974', 600: '#357968', 700: '#28634F',
          800: '#1E4F40', 900: '#173F34', 950: '#102C25',
        },
        brand: {
          DEFAULT: '#216459',
          light: '#6E9F92',
          dark: '#17483F',
          50: '#F0F6F4',
          100: '#E8F1EE',
          200: '#D0E4DE',
          800: '#17483F',
          900: '#123C37',
        },
        accent: {
          DEFAULT: '#357968',
          dark: '#245E52',
          light: '#E9F3ED',
          border: '#CFE5D6',
        },
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite',
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

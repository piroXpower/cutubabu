/** @type {import('tailwindcss').Config} */
tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        heading: ['Cinzel', 'serif'],
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        brand: {
          gold: '#F59E0B',
          goldDark: '#D97706',
          darkBg: '#08090B',
          surface: '#111317',
          surfaceLight: '#1A1D24',
          border: '#262933',
          accentRed: '#EF4444'
        }
      }
    }
  }
};

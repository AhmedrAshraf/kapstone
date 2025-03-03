/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'kapstone': {
          sage: '#8BA888',
          'sage-light': '#A8C1A5',
          'sage-dark': '#6E8F6B',
          purple: '#4A3B7C',
          gold: '#FFD700',
          'dark': '#1F2937'  // Dark gray color
        }
      },
      backgroundColor: {
        'hero-overlay': 'rgba(31, 41, 55, 0.8)' // Dark gray with 80% opacity
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
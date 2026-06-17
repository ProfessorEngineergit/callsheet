/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#08090A',
        panel: '#0E0F11',
        hover: '#16171A',
        border: '#202225',
        text: {
          DEFAULT: '#E6E7EA',
          secondary: '#9598A1',
          tertiary: '#6A6D75',
        },
        accent: { DEFAULT: '#FFFFFF', hover: '#D4D4D4' },
        status: {
          todo: '#6A6D75',
          progress: '#E2B340',
          blocked: '#E5484D',
          done: '#E6E7EA',
        },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      fontSize: { base: ['13px', '1.5'] },
      borderRadius: { DEFAULT: '6px', md: '6px', lg: '8px' },
      transitionDuration: { DEFAULT: '140ms' },
    },
  },
  plugins: [],
};

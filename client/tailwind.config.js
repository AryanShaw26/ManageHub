/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FFFCDF',
          100: '#FFF6B8',
          200: '#FFEC80',
          300: '#FFDF4D',
          400: '#FFD426',
          500: '#F5C400',
          600: '#D9A900',
        },
        ink: {
          900: '#202018',
          700: '#4A493F',
          500: '#777568',
        },
        surface: '#FFFFFF',
        canvas: '#FAFAF5',
        border: '#EEEDE4',
        success: '#218653',
        warning: '#B7791F',
        danger: '#C2413B',
        info: '#3478A8',
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'card': '18px',
        'bento': '24px',
        'hero': '28px',
      },
      boxShadow: {
        'warm-sm': '0 1px 3px 0 rgba(32, 32, 24, 0.04), 0 1px 2px -1px rgba(32, 32, 24, 0.04)',
        'warm': '0 4px 6px -1px rgba(32, 32, 24, 0.05), 0 2px 4px -2px rgba(32, 32, 24, 0.05)',
        'warm-lg': '0 10px 15px -3px rgba(32, 32, 24, 0.06), 0 4px 6px -4px rgba(32, 32, 24, 0.06)',
        'glow-yellow': '0 0 24px -4px rgba(245, 196, 0, 0.25)',
      }
    },
  },
  plugins: [],
}

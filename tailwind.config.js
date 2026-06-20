/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Nunito"', 'system-ui', 'sans-serif'],
        sans:    ['"Nunito Sans"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#F3F2FE',
          100: '#EEEDFE',
          200: '#D5D3FB',
          300: '#B3AFF5',
          400: '#9B95E5',
          500: '#8B85DC',
          600: '#7F77DD',
          700: '#3C3489',
          800: '#2a2460',
          900: '#1a1640',
        },
      },
      animation: {
        'fade-up':  'fadeUp 0.55s ease forwards',
        'fade-in':  'fadeIn 0.3s ease forwards',
        'slide-in': 'slideIn 0.35s ease forwards',
      },
      keyframes: {
        fadeUp:  { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideIn: { from: { opacity: '0', transform: 'translateX(-12px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
      },
    },
  },
  plugins: [],
}

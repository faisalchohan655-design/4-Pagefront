/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0ebff',
          500: '#6C3CE1',
          600: '#5a2fc9',
        },
        secondary: {
          500: '#E83E8C',
          600: '#d02e7a',
        },
        success: '#00E676',
        warning: '#FFB300',
        danger: '#FF1744',
        dark: '#1A1A2E',
        bg: '#F8F9FE',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #6C3CE1 0%, #E83E8C 100%)',
      },
      boxShadow: {
        'card': '0 4px 20px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 8px 40px rgba(108, 60, 225, 0.12)',
        'glow': '0 0 40px rgba(108, 60, 225, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

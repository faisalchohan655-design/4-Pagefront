// frontend/tailwind.config.js
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
          100: '#d4c4ff',
          200: '#b89eff',
          300: '#9c77ff',
          400: '#8051ff',
          500: '#6C3CE1',
          600: '#5a2fc9',
          700: '#4823b1',
          800: '#361799',
          900: '#240b81',
        },
        secondary: {
          50: '#fdf0f5',
          100: '#f9d4e3',
          200: '#f5b8d1',
          300: '#f19cbf',
          400: '#ed80ad',
          500: '#E83E8C',
          600: '#d02e7a',
          700: '#b81e68',
          800: '#a00e56',
          900: '#880044',
        },
        accent: {
          100: '#00D4FF',
          200: '#00B8D4',
          300: '#0091EA',
        },
        success: '#00E676',
        warning: '#FFB300',
        danger: '#FF1744',
        dark: '#1A1A2E',
        bg: '#F8F9FE',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #6C3CE1 0%, #E83E8C 100%)',
        'gradient-accent': 'linear-gradient(135deg, #00D4FF 0%, #6C3CE1 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      },
      boxShadow: {
        'glow': '0 0 40px rgba(108, 60, 225, 0.15)',
        'glow-lg': '0 0 60px rgba(108, 60, 225, 0.25)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 8px 40px rgba(108, 60, 225, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-glow': 'pulseGlow 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(108, 60, 225, 0.1)' },
          '50%': { boxShadow: '0 0 40px rgba(108, 60, 225, 0.3)' },
        },
      },
    },
  },
  plugins: [],
}

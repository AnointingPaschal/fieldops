/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0A0C10',
        surface: '#13161E',
        card: '#1C2030',
        border: '#252A3A',
        elevated: '#242838',
        primary: {
          DEFAULT: '#FF6B35',
          light: '#FF8C5A',
          dark: '#E55520',
          glow: 'rgba(255,107,53,0.15)',
        },
        amber: {
          DEFAULT: '#FFB800',
          glow: 'rgba(255,184,0,0.15)',
        },
        success: {
          DEFAULT: '#22D46E',
          bg: 'rgba(34,212,110,0.12)',
        },
        danger: {
          DEFAULT: '#FF3B5C',
          bg: 'rgba(255,59,92,0.12)',
        },
        info: {
          DEFAULT: '#3B9EFF',
          bg: 'rgba(59,158,255,0.12)',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#8892A4',
          muted: '#4A5568',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #FF6B35, #FF9A00)',
        'gradient-dark': 'linear-gradient(135deg, #0A0C10, #13161E)',
      },
      boxShadow: {
        glow: '0 0 20px rgba(255,107,53,0.3)',
        'glow-sm': '0 0 10px rgba(255,107,53,0.2)',
        card: '0 4px 24px rgba(0,0,0,0.4)',
      },
      animation: {
        'pulse-dot': 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};

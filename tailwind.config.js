/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg:       '#F0F4F8',
        surface:  '#FFFFFF',
        card:     '#FFFFFF',
        border:   '#E2E8F0',
        elevated: '#F8FAFC',
        navy: {
          DEFAULT: '#0F1A2E',
          light:   '#162032',
          card:    '#1A2744',
          border:  'rgba(255,255,255,0.08)',
        },
        primary: {
          DEFAULT: '#FF6B35',
          light:   '#FF8C5A',
          dark:    '#E55520',
        },
        amber:   { DEFAULT: '#F59E0B' },
        success: { DEFAULT: '#16A34A', bg: 'rgba(22,163,74,0.10)' },
        danger:  { DEFAULT: '#DC2626', bg: 'rgba(220,38,38,0.10)'  },
        info:    { DEFAULT: '#2563EB', bg: 'rgba(37,99,235,0.10)'  },
        text: {
          primary:   '#0F172A',
          secondary: '#475569',
          muted:     '#94A3B8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #FF6B35, #FF9A00)',
        'gradient-navy':    'linear-gradient(160deg, #1A2744 0%, #0F1A2E 100%)',
      },
      boxShadow: {
        glow:       '0 4px 20px rgba(255,107,53,0.35)',
        'glow-sm':  '0 2px 10px rgba(255,107,53,0.2)',
        card:       '0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.04)',
        'card-md':  '0 4px 16px rgba(0,0,0,0.08)',
        navy:       '0 8px 40px rgba(0,0,0,0.4)',
      },
      animation: {
        'fade-in':  'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};

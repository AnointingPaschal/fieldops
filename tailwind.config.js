/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg:       '#F0F2F7',
        surface:  '#FFFFFF',
        card:     '#FFFFFF',
        border:   '#E2E8F0',
        elevated: '#F8FAFC',
        primary: {
          DEFAULT: '#FF6B35',
          light:   '#FF8C5A',
          dark:    '#E55520',
          glow:    'rgba(255,107,53,0.12)',
        },
        amber: {
          DEFAULT: '#F59E0B',
          glow:    'rgba(245,158,11,0.12)',
        },
        success: {
          DEFAULT: '#16A34A',
          bg:      'rgba(22,163,74,0.08)',
        },
        danger: {
          DEFAULT: '#DC2626',
          bg:      'rgba(220,38,38,0.08)',
        },
        info: {
          DEFAULT: '#2563EB',
          bg:      'rgba(37,99,235,0.08)',
        },
        text: {
          primary:   '#0F172A',
          secondary: '#475569',
          muted:     '#94A3B8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #FF6B35, #FF9A00)',
      },
      boxShadow: {
        glow:    '0 0 20px rgba(255,107,53,0.25)',
        'glow-sm':'0 0 10px rgba(255,107,53,0.15)',
        card:    '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        'card-md':'0 2px 8px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06)',
      },
      animation: {
        'fade-in':  'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};

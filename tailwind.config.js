/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg:      '#F2F2F7',
        card:    '#FFFFFF',
        navy: {
          DEFAULT: '#0F1A2E',
          mid:     '#162236',
          light:   '#1E2F47',
          glass:   'rgba(255,255,255,0.07)',
        },
        btn:     '#131F30',
        primary: { DEFAULT: '#FF6B35', light: '#FF8C5A' },
        success: '#16A34A',
        danger:  '#DC2626',
        warning: '#F59E0B',
        info:    '#2563EB',
        text: {
          primary:   '#0F172A',
          secondary: '#6B7280',
          muted:     '#9CA3AF',
        },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      backgroundImage: {
        'navy-grad': 'linear-gradient(160deg, #1E2F47 0%, #0F1A2E 100%)',
        'primary-grad': 'linear-gradient(135deg, #FF6B35 0%, #FF9A00 100%)',
      },
      boxShadow: {
        card:   '0 2px 12px rgba(0,0,0,0.06)',
        navy:   '0 8px 32px rgba(0,0,0,0.35)',
        glow:   '0 4px 20px rgba(255,107,53,0.4)',
        'nav':  '0 -1px 0 rgba(0,0,0,0.06), 0 -4px 16px rgba(0,0,0,0.04)',
      },
      maxWidth: { app: '430px' },
      animation: {
        'fade-in':  'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};

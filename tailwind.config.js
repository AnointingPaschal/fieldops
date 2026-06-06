/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        navy:    { DEFAULT: '#0B1D35', light: '#142845', border: '#1E3A5F', muted: '#64748B' },
        sky:     { DEFAULT: '#1D4ED8', light: '#3B82F6', soft: '#EFF6FF' },
        bg:      '#F4F7FA',
        surface: '#FFFFFF',
        line:    '#E2E8F0',
        text:    { primary: '#0F172A', secondary: '#475569', muted: '#94A3B8' },
        pass:    { DEFAULT: '#16A34A', soft: '#F0FDF4', border: '#BBF7D0' },
        warn:    { DEFAULT: '#D97706', soft: '#FFFBEB', border: '#FDE68A' },
        fail:    { DEFAULT: '#DC2626', soft: '#FEF2F2', border: '#FECACA' },
        low:     { DEFAULT: '#DC2626', soft: '#FEF2F2' },
        mid:     { DEFAULT: '#D97706', soft: '#FFFBEB' },
        ok:      { DEFAULT: '#16A34A', soft: '#F0FDF4' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      boxShadow: {
        card:   '0 1px 3px rgba(0,0,0,0.07), 0 4px 12px rgba(0,0,0,0.05)',
        nav:    '0 -1px 0 #E2E8F0',
        panel:  '4px 0 24px rgba(0,0,0,0.08)',
      },
      maxWidth: { app: '480px' },
      animation: {
        'in': 'fadeSlide 0.2s ease-out',
      },
      keyframes: {
        fadeSlide: { from: { opacity: '0', transform: 'translateY(6px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};

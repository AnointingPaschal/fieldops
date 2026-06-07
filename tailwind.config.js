/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        navy:    { DEFAULT: '#0B1D35', light: '#132845', border: '#1E3A5F' },
        sky:     { DEFAULT: '#1D4ED8', light: '#2563EB' },
        bg:      '#F0F4F8',
        line:    '#E2E8F0',
        pass:    '#16A34A',
        warn:    '#D97706',
        fail:    '#DC2626',
        text: {
          primary:   '#0F172A',
          secondary: '#475569',
          muted:     '#94A3B8',
        },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)',
        nav:  '0 -1px 0 #E2E8F0',
      },
      animation: {
        'in': 'fadeUp 0.25s ease-out both',
        'in-fast': 'fadeUp 0.15s ease-out both',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

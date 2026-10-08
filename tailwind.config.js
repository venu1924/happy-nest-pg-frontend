/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        nest: {
          navy: '#0A192F',
          ink: '#112240',
          muted: '#64748B',
          soft: '#F1F5F9',
          line: '#E2E8F0',
          amber: '#D97706',
          amberSoft: '#FEF3C7',
          green: '#059669',
          greenSoft: '#D1FAE5',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'Segoe UI', 'system-ui', 'sans-serif'],
        display: ['"Outfit"', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(10, 25, 47, 0.06), 0 4px 12px rgba(10, 25, 47, 0.04)',
      },
      transitionDuration: {
        floor: '320ms',
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        portal: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
          muted: '#64748B',
          primary: '#0284C7',
          'primary-hover': '#0369A1',
          'primary-light': '#E0F2FE',
          teal: '#0D9488',
          'teal-light': '#CCFBF1',
        },
      },
      boxShadow: {
        soft: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        card: '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 2px 6px -1px rgba(15, 23, 42, 0.03)',
        float: '0 10px 25px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)',
      },
      borderRadius: {
        card: '14px',
        input: '10px',
        btn: '10px',
      },
    },
  },
  plugins: [],
};

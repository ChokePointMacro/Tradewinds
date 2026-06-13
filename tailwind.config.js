/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sourced: '#0f766e',
        modeled: '#b45309',
      },
    },
  },
  plugins: [],
};

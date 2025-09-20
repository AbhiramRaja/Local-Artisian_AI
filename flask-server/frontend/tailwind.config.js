/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'pulse-slow': 'pulse 3s infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      colors: {
        primary: {
          50: '#fef7ee',
          100: '#fdedd6',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        }
      }
    },
  },
  plugins: [],
}
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#DC2626',
        'primary-hover': '#B91C1C',
      },
    },
  },
  plugins: [],
}
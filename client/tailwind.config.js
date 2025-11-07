/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // 👈 this enables dark mode via .dark class
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

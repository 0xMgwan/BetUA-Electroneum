/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          600: '#2C3E50',
          700: '#1F2937',
          800: '#1A202C',
          900: '#0F172A',
        },
      },
    },
  },
  plugins: [],
}

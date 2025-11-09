/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Poppins', 'system-ui', 'sans-serif'],
        amsterdam: ['Lavishly Yours', 'Georgia', 'serif'],
        avallon: ['Knewave', 'Impact', 'Arial Black', 'sans-serif'],
      },
      colors: {
        't-mobile-magenta': '#E20074',
      },
    },
  },
  plugins: [],
}


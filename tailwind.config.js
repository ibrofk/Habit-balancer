/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        typing: {
          '0%': { width: '0' },
          '100%': { width: '100%' }
        }
      },
      animation: {
        typing: 'typing 1s steps(20, end)'
      }
    },
  },
  plugins: [],
}

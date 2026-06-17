/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tp: {
          bg: '#0F1115',
          surface: '#171A21',
          red: '#FF4D4D',
          blue: '#4DA6FF',
          primary: '#FFFFFF',
          secondary: '#B8BEC9',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

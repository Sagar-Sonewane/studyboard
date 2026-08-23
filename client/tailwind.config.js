/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7ff',
          100: '#ebf0fe',
          200: '#d6e0fd',
          500: '#4f46e5',
          600: '#4338ca',
          700: '#3730a3',
        },
        surface: {
          50: '#fcfcfc',
          100: '#f7f7f8',
          200: '#f0f0f2',
          800: '#18181b',
          900: '#09090b',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
        }
      },
      borderWidth: {
        '0.5': '0.5px',
      },
      borderRadius: {
        'card': '10px',
      }
    },
  },
  plugins: [],
}

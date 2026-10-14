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
        },
        // StudySync Landing Page tokens per DESIGN.md
        paper: '#F7F5EF',
        ink: '#15162B',
        blue: {
          DEFAULT: '#3355FF',
          tint: '#DCE3FF',
        },
        yellow: {
          DEFAULT: '#FFDD33',
          tint: '#FFF3C2',
        },
        coral: {
          DEFAULT: '#FF5B4C',
          tint: '#FFDAD5',
        },
        graphite: '#444654',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'hard': '4px 4px 0px #15162B',
        'hard-sm': '2px 2px 0px #15162B',
        'hard-md': '5px 5px 0px #15162B',
        'hard-lg': '6px 6px 0px #15162B',
        'hard-xl': '8px 8px 0px #15162B',
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

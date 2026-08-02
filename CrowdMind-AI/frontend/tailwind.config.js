/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2F80ED',
          light: '#EAF2FD',
          dark: '#1B5E20',
        },
        background: '#F7F9FC',
        card: '#FFFFFF',
        darkWhite: '#F5F7FA',
        veryLightGray: '#E5E7EB',
        danger: '#EB5757',
        success: '#27AE60',
        warning: '#F2C94C',
        textMain: '#333333',
        textMuted: '#828282',
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'sans-serif'],
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
      },
    },
  },
  plugins: [],
}

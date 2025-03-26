/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'IBM': ['IBM Plex Sans Thai Looped', 'sans-serif'], //เพิ่มตรงนี้
      },
      colors: {
        'header': '#42526E',
        'primary': '#0052CC',
        'primaryContrast': '#0042A4',
        'secondary': '#E9F2FF',
        'secondaryContrast': '#E2ECF9',
        'mediumGray': '#686F73',
        'lightGray': '#BFC3C7',
        'error': '#CF283C',
        'line': '#007AFF',
        'bg': '#F7F8F9'
      },
      backgroundImage: {
        Findcar: "url('/src/assets/findCar.svg')",
        Logo: "url('/src/assets/logo.svg')"
      }
    },
  },
  plugins: [],
}
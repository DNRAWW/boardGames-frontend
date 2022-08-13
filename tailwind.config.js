/** @type {import('tailwindcss').Config} */ 
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        'chess': 'repeat(8, minmax(0, 6rem))',
      }
    },
  },
  corePlugins: {
    preflight: false,
  }
}
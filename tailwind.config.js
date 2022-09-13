/** @type {import('tailwindcss').Config} */ 
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        'chess': 'repeat(8, minmax(0, 6rem))',
        'chessMD': 'repeat(8, minmax(0, 5rem))',
        'chessSM': 'repeat(8, minmax(0, 2.25rem))',
        'chessLayout': "minmax(0, 20vw), minmax(48.4rem, 48.4rem), minmax(0, 20vw)",
        'chessLayoutMD': "minmax(0, 20vw), minmax(40rem, 40rem), minmax(0, 20vw)",
        'chessLayoutSM': "minmax(18rem, 18rem), minmax(0, 20vw)",
      }
    },
  },
  corePlugins: {
    preflight: false,
  }
}
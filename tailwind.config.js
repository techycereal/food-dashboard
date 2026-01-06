import textShadow from "tailwindcss-textshadow";
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        cabin: ['"Cabin Sketch"', 'cursive'],
        sora: ["Sora", "sans-serif"],
        hand: ['"Patrick Hand"', 'cursive'],
        italianno: ["Italianno", "cursive"],
        platypi: ["Platypi", "serif"],
      },
      keyframes: {
fadeIn: {
'0%': { opacity: '0' },
'100%': { opacity: '1' },
},
fadeOut: {
'100%': { opacity: '1' },
'0%': { opacity: '0' },
},
},
animation: {
fadeIn: 'fadeIn 1s ease-in-out',
fadeOut: 'fadeOut 1s ease-in-out',
},
    },
  },
  plugins: [textShadow],
}

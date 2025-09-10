/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:"#eef7ff",100:"#d9ecff",200:"#b6d9ff",300:"#89c0ff",
          400:"#5da6ff",500:"#3b8cff",600:"#2770e6",700:"#1f58b3",
          800:"#1c4991",900:"#193d78"
        }
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
};

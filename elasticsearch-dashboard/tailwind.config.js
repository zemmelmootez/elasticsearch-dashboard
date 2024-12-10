/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "elasticsearch-green": "#00BFB3",
        "elasticsearch-dark": "#2B2B2B",
      },
    },
  },
  plugins: [],
};

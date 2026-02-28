/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef9f0",
          100: "#d6f1db",
          200: "#b0e3bc",
          300: "#7dcf91",
          400: "#4cb867",
          500: "#2d9f4e",
          600: "#1f803d",
          700: "#1a6633",
          800: "#18512b",
          900: "#154325",
        },
      },
    },
  },
  plugins: [],
};

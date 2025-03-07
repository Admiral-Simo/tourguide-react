/** @type {import('tailwindcss').Config} */
const { nextui } = require("@nextui-org/react");

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Add ur custom colors here
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        dark: {
          colors: {
            // customize dark mode colors
            background: "#12122f",
            // u can also customize other colors here
            // primary: "#0072f5",
          },
        },
        light: {
          // customize light mode colors
          colors: {
            // background: "#ffffff",
          },
        },
      },
    }),
  ],
}


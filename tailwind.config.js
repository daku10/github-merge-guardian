/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  darkMode: "class",
  content: ["./**/*.tsx"],
  plugins: [],
  theme: {
    extend: {
      colors: {
        gh: "#1F2328",
        primary: "#1F883D",
        primaryHover: "#1a7f37",
        muted: "#D8DEE4",
        ghgray: "#f6f8fa",
        ghgrayHover: "#f3f4f6",
        ghgrayBorder: "rgba(31, 35, 40, 0.15)"
      }
    }
  }
}

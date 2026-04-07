/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#e63946",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#00fff7",
          foreground: "#0a0a0a",
        },
        accent: {
          DEFAULT: "#f1faee",
          foreground: "#1d3557",
        },
      },
    },
  },
  plugins: [],
}

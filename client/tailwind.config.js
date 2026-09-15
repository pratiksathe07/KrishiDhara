/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // KrishiDhara brand palette — agriculture greens
        primary: {
          50:  "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },
        // Warm earth tones
        earth: {
          50:  "#fdf8f0",
          100: "#faecd8",
          200: "#f4d5a8",
          300: "#ecb869",
          400: "#e3963a",
          500: "#d97b1c",
          600: "#c06215",
          700: "#9d4c14",
          800: "#7e3d17",
          900: "#673417",
        },
        // Surface colors for cards/backgrounds
        surface: {
          0:   "#ffffff",
          50:  "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 8px 0 rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
        "card-hover": "0 8px 24px 0 rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
};

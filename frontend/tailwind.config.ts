import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ["'Playfair Display'", "Georgia", "serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
      colors: {
        parchment: "#FAF7F2",
        space: "#050811",
        "space-2": "#080d1a",
      },
      backgroundImage: {
        "hero-pattern": "radial-gradient(ellipse 120% 80% at 50% 0%, #0f172a 0%, #050811 60%)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
      },
      colors: {
        // Primary: deep navy (replaces generic blue)
        brand: {
          50:  "#eef1f6",
          100: "#d8e0ec",
          200: "#b0c0d8",
          500: "#1e2b3c",
          600: "#172230",
          700: "#111a24",
          900: "#080e17",
        },
        // Accent: warm terracotta
        accent: {
          50:  "#fdf5ef",
          100: "#f8e5d3",
          200: "#f0c9a7",
          400: "#d4966d",
          500: "#c4895c",
          600: "#b07848",
        },
      },
      boxShadow: {
        card:       "0 1px 4px 0 rgb(30 43 60 / 0.07), 0 1px 2px -1px rgb(30 43 60 / 0.05)",
        "card-md":  "0 4px 12px -2px rgb(30 43 60 / 0.10), 0 2px 6px -2px rgb(30 43 60 / 0.06)",
        "card-lg":  "0 8px 24px -4px rgb(30 43 60 / 0.13), 0 3px 8px -3px rgb(30 43 60 / 0.07)",
        modal:      "0 32px 64px -12px rgb(30 43 60 / 0.28)",
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
      },
    },
  },
  plugins: [],
};

export default config;

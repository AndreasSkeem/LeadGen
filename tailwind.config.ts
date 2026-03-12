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
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#f0f4ff",
          100: "#e0eaff",
          500: "#3b5bdb",
          600: "#3451c7",
          700: "#2c46b0",
          900: "#1a2d80",
        },
      },
    },
  },
  plugins: [],
};

export default config;

import { type Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        saffron: "#FFA500",
        maroon: {
          DEFAULT: "#800000",
          700: "#800000",
          800: "#660000",
        },
        orange: {
          DEFAULT: "#FFA500",
          100: "#fff7ed",
          500: "#FFA500",
        },
        // Optional: override primary if using shadcn theme system
        primary: {
          DEFAULT: "#FFA500",
          foreground: "#ffffff",
        },
      },
    },
  },
  plugins: [],
};
export default config;

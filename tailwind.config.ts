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
        maroon: "#800000",
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

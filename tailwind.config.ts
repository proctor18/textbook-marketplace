import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#172026",
        paper: "#fbfaf7",
        moss: "#557568",
        coral: "#d9614c",
        gold: "#d9a441"
      },
      boxShadow: {
        soft: "0 16px 40px rgba(23, 32, 38, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // Scans everything in src – critical for class detection
    "./app/**/*.{js,ts,jsx,tsx,mdx}", // App Router pages/components
    "./components/**/*.{js,ts,jsx,tsx,mdx}", // If you have a separate components folder
  ],
  theme: {
    extend: {
      // Add custom colors, fonts, etc. here if needed
      // Example: colors: { primary: "#0ea5e9" },
    },
  },
  plugins: [], // Add plugins like typography if needed: require("@tailwindcss/typography")
};

export default config;

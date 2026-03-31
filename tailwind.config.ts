import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#060e20",
        primary: {
          DEFAULT: "#81ecff",
          container: "#00e3fd",
          dim: "#00d4ec",
        },
        secondary: {
          DEFAULT: "#6e9bff",
          fixed: "#c0d1ff",
        },
        tertiary: {
          DEFAULT: "#a68cff",
          container: "#7c4dff",
        },
        surface: {
          DEFAULT: "#060e20",
          dim: "#060e20",
          bright: "#1f2b49",
          variant: "#192540",
          container: {
            lowest: "#000000",
            low: "#091328",
            DEFAULT: "#0f1930",
            high: "#141f38",
            highest: "#192540",
          }
        },
        "on-surface": {
          DEFAULT: "#dee5ff",
          variant: "#a3aac4",
        },
        outline: {
          DEFAULT: "#6d758c",
          variant: "#40485d",
        }
      },
      fontFamily: {
        headline: ["Plus Jakarta Sans", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      borderRadius: {
        xl: "3rem",
        lg: "2rem",
        md: "1rem",
      },
      backgroundImage: {
        "glass-gradient": "linear-gradient(45deg, rgba(129, 236, 255, 0.05), rgba(110, 155, 255, 0.05))",
      },
    },
  },
  plugins: [],
};
export default config;

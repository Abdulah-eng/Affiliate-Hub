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
        background: "rgb(var(--background) / <alpha-value>)",
        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",
          container: "rgb(var(--primary-container) / <alpha-value>)",
          dim: "rgb(var(--primary-dim) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--secondary) / <alpha-value>)",
          fixed: "rgb(var(--secondary-fixed) / <alpha-value>)",
        },
        tertiary: {
          DEFAULT: "rgb(var(--tertiary) / <alpha-value>)",
          container: "rgb(var(--tertiary-container) / <alpha-value>)",
        },
        surface: {
          DEFAULT: "rgb(var(--surface) / <alpha-value>)",
          dim: "rgb(var(--surface-dim) / <alpha-value>)",
          bright: "rgb(var(--surface-bright) / <alpha-value>)",
          variant: "rgb(var(--surface-variant) / <alpha-value>)",
          container: {
            lowest: "rgb(var(--surface-container-lowest) / <alpha-value>)",
            low: "rgb(var(--surface-container-low) / <alpha-value>)",
            DEFAULT: "rgb(var(--surface-container) / <alpha-value>)",
            high: "rgb(var(--surface-container-high) / <alpha-value>)",
            highest: "rgb(var(--surface-container-highest) / <alpha-value>)",
          }
        },
        "on-surface": {
          DEFAULT: "rgb(var(--on-surface) / <alpha-value>)",
          variant: "rgb(var(--on-surface-variant) / <alpha-value>)",
        },
        outline: {
          DEFAULT: "rgb(var(--outline) / <alpha-value>)",
          variant: "rgb(var(--outline-variant) / <alpha-value>)",
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

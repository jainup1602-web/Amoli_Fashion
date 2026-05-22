import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "#E5E1D5",
        input: "#E5E1D5",
        ring: "#1A1A1A",
        background: "#FDFCF0",
        foreground: "#1a1a1a",
        gold: {
          DEFAULT: "#D4AF37",
          light: "#E8D48B",
          dark: "#B8960C",
        },
        primary: {
          DEFAULT: "#1A1A1A",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#FDFCF0",
          foreground: "#1a1a1a",
        },
        destructive: {
          DEFAULT: "#dc2626",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F5F1E8",
          foreground: "#737373",
        },
        accent: {
          DEFAULT: "#1A1A1A",
          foreground: "#FFFFFF",
        },
        popover: {
          DEFAULT: "#FDFCF0",
          foreground: "#1a1a1a",
        },
        card: {
          DEFAULT: "#FDFCF0",
          foreground: "#1a1a1a",
        },
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Playfair Display", "serif"],
        elegant: ["Cormorant Garamond", "serif"],
        playfair: ["Playfair Display", "serif"],
        lora: ["Lora", "serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-down": "slideDown 0.5s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;

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
        border: "#e5e5e5",
        input: "#e5e5e5",
        ring: "#1a1a1a",
        background: "#FAF9F6",
        foreground: "#1a1a1a",
        primary: {
          DEFAULT: "#1a1a1a",
          foreground: "#FAF9F6",
        },
        secondary: {
          DEFAULT: "#f5f5f5",
          foreground: "#1a1a1a",
        },
        destructive: {
          DEFAULT: "#dc2626",
          foreground: "#FAF9F6",
        },
        muted: {
          DEFAULT: "#f5f5f5",
          foreground: "#737373",
        },
        accent: {
          DEFAULT: "#1a1a1a",
          foreground: "#FAF9F6",
        },
        popover: {
          DEFAULT: "#FAF9F6",
          foreground: "#1a1a1a",
        },
        card: {
          DEFAULT: "#FAF9F6",
          foreground: "#1a1a1a",
        },
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
      fontFamily: {
        sans: ["Fairplay", "Inter", "sans-serif"],
        serif: ["Fairplay", "Playfair Display", "serif"],
        elegant: ["Fairplay", "Cormorant Garamond", "serif"],
        lora: ["Fairplay", "Lora", "serif"],
        fairplay: ["Fairplay", "serif"],
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

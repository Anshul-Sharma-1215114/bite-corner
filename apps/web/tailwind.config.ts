import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Bite Corner brand palette: vivid red + golden yellow, on a
        // bright near-white background — energetic fast-food, not
        // home-style. 500/600 anchor on the brand hexes; other steps are
        // generated tints/shades at the same hue/saturation.
        paper: {
          50: "#FFFFFF",
          100: "#FFF7ED",
        },
        red: {
          50: "hsl(355, 90%, 96%)",
          100: "hsl(355, 88%, 91%)",
          200: "hsl(355, 86%, 82%)",
          300: "hsl(355, 84%, 72%)",
          400: "hsl(355, 82%, 62%)",
          500: "#EF3340",
          600: "hsl(355, 78%, 45%)",
          700: "hsl(355, 80%, 37%)",
          800: "hsl(355, 82%, 29%)",
          900: "hsl(355, 84%, 21%)",
        },
        yellow: {
          50: "hsl(45, 100%, 95%)",
          100: "hsl(45, 100%, 88%)",
          200: "hsl(45, 100%, 78%)",
          300: "hsl(45, 100%, 68%)",
          400: "hsl(45, 100%, 58%)",
          500: "#FFC72C",
          600: "hsl(40, 96%, 48%)",
          700: "hsl(38, 92%, 40%)",
          800: "hsl(36, 88%, 32%)",
          900: "hsl(34, 84%, 24%)",
        },
        ink: "#241A14",
      },
      fontFamily: {
        display: ["var(--font-fredoka)", "system-ui", "sans-serif"],
        body: ["var(--font-poppins)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 8px -2px rgba(36,26,20,0.10)",
        card: "0 6px 20px -4px rgba(36,26,20,0.16)",
        lifted: "0 14px 36px -8px rgba(36,26,20,0.24)",
        pop: "0 4px 0 0 rgba(0,0,0,0.15)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.94)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        bounceIn: {
          "0%": { transform: "scale(1)" },
          "40%": { transform: "scale(1.18)" },
          "70%": { transform: "scale(0.94)" },
          "100%": { transform: "scale(1)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.6s linear infinite",
        fadeIn: "fadeIn 0.25s ease-out",
        scaleIn: "scaleIn 0.2s ease-out",
        bounceIn: "bounceIn 0.45s ease-in-out",
        wiggle: "wiggle 0.4s ease-in-out",
        marquee: "marquee 18s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;

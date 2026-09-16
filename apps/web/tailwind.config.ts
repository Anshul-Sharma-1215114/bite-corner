import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Retuned to a clean, bold QSR palette: red + yellow on neutral
        // white/light-gray (not a warm cream) — a widely-used fast-food
        // color convention (red = appetite/urgency, yellow = optimism),
        // not any one brand's proprietary trade dress. 500/600 anchor the
        // scale; other steps are generated tints/shades at the same
        // hue/saturation.
        paper: {
          50: "#FFFFFF",
          100: "#F5F5F5",
        },
        red: {
          50: "hsl(5, 78%, 96%)",
          100: "hsl(5, 76%, 91%)",
          200: "hsl(5, 74%, 82%)",
          300: "hsl(5, 72%, 68%)",
          400: "hsl(5, 74%, 54%)",
          500: "#DA291C",
          600: "hsl(5, 82%, 38%)",
          700: "hsl(5, 84%, 31%)",
          800: "hsl(5, 86%, 24%)",
          900: "hsl(5, 88%, 18%)",
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
        // One clean bold sans for both — headlines are just heavier
        // weights of the same body face, not a separate "fun" display
        // font. Keeps the whole UI reading as one confident, corporate
        // brand voice rather than a playful/cartoon one.
        display: ["var(--font-poppins)", "system-ui", "sans-serif"],
        body: ["var(--font-poppins)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 8px -2px rgba(36,26,20,0.10)",
        card: "0 6px 20px -4px rgba(36,26,20,0.16)",
        lifted: "0 14px 36px -8px rgba(36,26,20,0.24)",
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
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        // Scroll-reveal: sections/cards fade + rise into place the first
        // time they enter the viewport (toggled via a small IntersectionObserver
        // hook, not on every render).
        riseIn: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        // Hero carousel slide crossfade.
        slideFade: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        // Header brand strip — slow color sweep across the red/yellow gradient.
        gradientShift: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      animation: {
        shimmer: "shimmer 1.6s linear infinite",
        fadeIn: "fadeIn 0.25s ease-out",
        scaleIn: "scaleIn 0.2s ease-out",
        marquee: "marquee 18s linear infinite",
        riseIn: "riseIn 0.6s cubic-bezier(0.16,1,0.3,1) forwards",
        slideFade: "slideFade 0.5s ease-out",
        gradientShift: "gradientShift 3s ease infinite",
      },
    },
  },
  plugins: [],
};

export default config;

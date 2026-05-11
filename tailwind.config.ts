import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        // 疗愈机构主题色：温暖、克制、不刺眼
        brand: {
          50: "#f7f4ef",
          100: "#ece5d8",
          200: "#d8c9b0",
          300: "#bda580",
          400: "#a48459",
          500: "#8b6a43",
          600: "#705336",
          700: "#553f2b",
          800: "#3d2d20",
          900: "#241b13",
        },
        sage: {
          50: "#f4f7f3",
          100: "#e3ebde",
          200: "#c5d6bd",
          300: "#9eb993",
          400: "#789a6c",
          500: "#5c7e51",
          600: "#48653f",
          700: "#3a5034",
          800: "#30412c",
          900: "#293625",
        },
        ink: "#1f1d1a",
        cream: "#fbf8f3",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"PingFang SC"',
          '"Hiragino Sans GB"',
          '"Microsoft YaHei"',
          "sans-serif",
        ],
        serif: ['"Noto Serif SC"', "Georgia", "serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

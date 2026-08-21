/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "sans-serif"],
      },
      colors: {
        // Warm stone base — the "clay slab" everything sits on
        stone: {
          50: "#F6F2EA",
          100: "#EFE8DA",
          200: "#E2D8C4",
        },
        ink: {
          DEFAULT: "#33302B",
          soft: "#6E6A60",
          faint: "#9C978A",
        },
        // Status palette — muted, not saturated, so it reads professional
        moss: {
          50: "#E9F0E6",
          100: "#D7E5D1",
          600: "#3F6B47",
          700: "#33553A",
        },
        amber: {
          50: "#FBF1DC",
          100: "#F4E1B8",
          600: "#93691C",
          700: "#7A5716",
        },
        coral: {
          50: "#FAE9E4",
          100: "#F3D0C6",
          600: "#AE4C36",
          700: "#8F3C2A",
        },
        teal: {
          50: "#E3EEEC",
          100: "#C9DEDA",
          600: "#2B6B63",
          700: "#1F544D",
        },
      },
      borderRadius: {
        "2xl": "20px",
        "3xl": "26px",
        "4xl": "34px",
      },
      boxShadow: {
        // Neutral clay — tinted toward the stone-50 background, not black
        clay: "8px 8px 18px rgba(120, 108, 84, 0.22), -8px -8px 18px rgba(255, 255, 255, 0.75)",
        "clay-sm": "5px 5px 12px rgba(120, 108, 84, 0.18), -5px -5px 12px rgba(255, 255, 255, 0.7)",
        "clay-inset": "inset 4px 4px 9px rgba(120, 108, 84, 0.22), inset -4px -4px 9px rgba(255, 255, 255, 0.7)",
        // Status-tinted clay — used sparingly on the one element that needs to alarm
        "clay-coral": "8px 8px 18px rgba(174, 76, 54, 0.22), -8px -8px 18px rgba(255, 255, 255, 0.75)",
        "clay-moss": "6px 6px 14px rgba(63, 107, 71, 0.18), -6px -6px 14px rgba(255, 255, 255, 0.7)",
        "clay-teal": "6px 6px 14px rgba(43, 107, 99, 0.18), -6px -6px 14px rgba(255, 255, 255, 0.7)",
      },
    },
  },
  plugins: [],
};

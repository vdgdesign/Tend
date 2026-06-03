/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bone:  "#F7F3EC",
        bone2: "#EFE9DE",
        ink:   "#1A1814",
        ink2:  "#3A352D",
        muted: "#7A7164",
        line:  "#E0D8C8",
        ochre:  "#A86F2C",
        ochre2: "#8B5A1F",
        sage:   "#5A6B5A",
        rust:   "#B34A2A",
      },
      fontFamily: {
        display: ['"Fraunces"', "Georgia", "serif"],
        sans:    ['"Inter Tight"', "system-ui", "sans-serif"],
      },
      letterSpacing: {
        tightish:  "-0.015em",
        tighter2:  "-0.025em",
        tightest:  "-0.035em",
      },
      lineHeight: {
        relaxed2: "1.75",
      },
      borderRadius: {
        card: "10px",
      },
    },
  },
  plugins: [],
};

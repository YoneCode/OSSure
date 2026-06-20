/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#fdfbf7", // warm paper background
        ink: "#2d2d2d", // soft pencil black (never pure black)
        muted: "#e5e0d8", // old paper / erased pencil
        accent: "#ff4d4d", // red correction marker
        pen: "#2d5da1", // blue ballpoint
        postit: "#fff9c4", // post-it yellow
      },
      fontFamily: {
        head: ['"Kalam"', "cursive"],
        body: ['"Patrick Hand"', "cursive"],
      },
      // Wobbly, hand-drawn radii — never perfectly round.
      borderRadius: {
        wobbly: "255px 15px 225px 15px / 15px 225px 15px 255px",
        wobbly2: "15px 225px 15px 255px / 255px 15px 225px 15px",
        wobbly3: "125px 25px 155px 35px / 25px 155px 35px 125px",
        wobblysm: "18px 8px 22px 8px / 8px 22px 8px 20px",
        blob: "50% 50% 50% 50% / 62% 40% 60% 38%",
      },
      // Hard offset shadows — no blur, cut-paper collage feel.
      boxShadow: {
        sketch: "4px 4px 0px 0px #2d2d2d",
        "sketch-lg": "8px 8px 0px 0px #2d2d2d",
        "sketch-sm": "2px 2px 0px 0px #2d2d2d",
        "sketch-soft": "3px 3px 0px 0px rgba(45,45,45,0.1)",
        "sketch-pen": "4px 4px 0px 0px #2d5da1",
      },
      keyframes: {
        "soft-bounce": {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        "soft-bounce": "soft-bounce 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        glitch: {
          bg: "#0a0a0f",
          bg2: "#1a0a2e",
          green: "#00ff41",
          red: "#ff003c",
          blue: "#00d4ff",
          yellow: "#ffff00",
          magenta: "#ff00ff",
        },
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "'VT323'", "'Share Tech Mono'", "monospace"],
        display: ["'VT323'", "'Share Tech Mono'", "monospace"],
      },
      animation: {
        "glitch-skew": "glitch-skew 0.3s infinite",
        "glitch-horizontal": "glitch-horizontal 2s infinite",
        "glitch-vertical": "glitch-vertical 2.5s infinite",
        "scanline": "scanline 6s linear infinite",
        "flicker": "flicker 0.15s infinite",
        "blink": "blink 1s step-end infinite",
        "typing-cursor": "typing-cursor 1s step-end infinite",
      },
      keyframes: {
        "glitch-skew": {
          "0%": { transform: "skew(0deg)" },
          "20%": { transform: "skew(-2deg)" },
          "40%": { transform: "skew(1deg)" },
          "60%": { transform: "skew(-1deg)" },
          "80%": { transform: "skew(2deg)" },
          "100%": { transform: "skew(0deg)" },
        },
        "glitch-horizontal": {
          "0%, 100%": { transform: "translate(0)" },
          "20%": { transform: "translate(-3px, 2px)" },
          "40%": { transform: "translate(3px, -2px)" },
          "60%": { transform: "translate(-2px, -1px)" },
          "80%": { transform: "translate(2px, 1px)" },
        },
        "glitch-vertical": {
          "0%, 100%": { transform: "translate(0)" },
          "20%": { transform: "translate(0, -3px)" },
          "40%": { transform: "translate(0, 2px)" },
          "60%": { transform: "translate(0, -1px)" },
          "80%": { transform: "translate(0, 3px)" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        "typing-cursor": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};

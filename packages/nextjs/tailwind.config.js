/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./utils/**/*.{js,ts,jsx,tsx}"],
  plugins: [require("daisyui")],
  darkTheme: "dark",
  darkMode: ["selector", "[data-theme='dark']"],
  daisyui: {
    themes: [
      {
        light: {
          primary: "#1DA1F2", // Twitter Blue
          "primary-content": "#ffffff",
          secondary: "#D9D9D9", // Slightly muted light gray
          "secondary-content": "#0f1419", // Very dark gray
          accent: "#1DA1F2",
          "accent-content": "#ffffff",
          neutral: "#F5F8FA", // Light neutral
          "neutral-content": "#0f1419",
          "base-100": "#F5F8FA", // Lighter background
          "base-200": "#E8E8E8", // Subtle light gray
          "base-300": "#D1D1D1", // Light border gray
          "base-content": "#0f1419", // Dark text
          info: "#1DA1F2",
          success: "#17BF63",
          warning: "#FFAD1F",
          error: "#E0245E",
          "--rounded-btn": "9999rem",
          ".tooltip": { "--tooltip-tail": "6px" },
          ".link": { textUnderlineOffset: "2px" },
          ".link:hover": { opacity: "80%" },
        },
      },
      {
        dark: {
          primary: "#1DA1F2", // Twitter Blue
          "primary-content": "#AAB8C2", // Muted gray text
          secondary: "#10171E", // Darker muted gray
          "secondary-content": "#8899A6", // Muted secondary text
          accent: "#1DA1F2",
          "accent-content": "#AAB8C2",
          neutral: "#0D1117", // Very dark base
          "neutral-content": "#C8D1DC", // Muted light text
          "base-100": "#0D1117", // Main dark background
          "base-200": "#161B22", // Slightly lighter dark
          "base-300": "#1E252D", // Dark border gray
          "base-content": "#AAB8C2", // Muted text for content
          info: "#1DA1F2",
          success: "#17BF63",
          warning: "#FFAD1F",
          error: "#E0245E",
          "--rounded-btn": "9999rem",
          ".tooltip": {
            "--tooltip-tail": "6px",
            "--tooltip-color": "rgba(255, 255, 255, 0.07)",
          },
          ".link": { textUnderlineOffset: "2px" },
          ".link:hover": { opacity: "80%" },
        },
      },
    ],
  },
  theme: {
    extend: {
      boxShadow: {
        center: "0 0 12px -2px rgba(0, 0, 0, 0.2)", // Slightly stronger shadow
        "blur-dark": "0 8px 30px rgba(0, 0, 0, 0.5)", // More dramatic blur for dark theme
      },
      backdropBlur: {
        xs: "3px", // Slightly more pronounced blur
        sm: "5px",
        md: "8px", // Medium blur effect
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "background": "#070814",
        "on-background": "#e9ecff",

        "surface": "#0a0b18",
        "surface-dim": "#070814",
        "surface-bright": "#14183a",

        "surface-container-lowest": "#05060f",
        "surface-container-low": "#0b0f22",
        "surface-container": "#0f1430",
        "surface-container-high": "#141a3a",
        "surface-container-highest": "#1a2146",

        "surface-variant": "#182043",
        "outline-variant": "#2b3153",
         "outline": "#9aa5d4",

        "primary": "#f4f6ff",
        "on-primary": "#070814",
        "primary-container": "#b9c6ff",
        "on-primary-container": "#070814",

        "secondary": "#7df9ff",
        "on-secondary": "#070814",
        "secondary-container": "#132b3a",
        "on-secondary-container": "#d6fbff",

        "tertiary": "#b9a2ff",
        "on-tertiary": "#070814",
        "tertiary-container": "#2a1f4f",
        "on-tertiary-container": "#efe9ff",

        "surface-tint": "#7ea6ff",

        "on-surface": "#e9ecff",
         "on-surface-variant": "#c6cdf2",

        "inverse-surface": "#e9ecff",
        "inverse-on-surface": "#0a0b18",
        "inverse-primary": "#2a55ff",

        "primary-fixed": "#7ea6ff",
        "primary-fixed-dim": "#5e7dff",
        "on-primary-fixed": "#070814",
        "on-primary-fixed-variant": "#0a0b18",

        "secondary-fixed": "#7df9ff",
        "secondary-fixed-dim": "#42d9ff",
        "on-secondary-fixed": "#070814",
        "on-secondary-fixed-variant": "#0a0b18",

        "tertiary-fixed": "#b9a2ff",
        "tertiary-fixed-dim": "#9a7dff",
        "on-tertiary-fixed": "#070814",
        "on-tertiary-fixed-variant": "#0a0b18",

        "error": "#ffb4ab",
        "error-container": "#93000a",
        "on-error": "#690005",
        "on-error-container": "#ffdad6"
      },
      fontFamily: {
        "headline": ["Manrope", "sans-serif"],
        "body": ["Inter", "sans-serif"],
        "label": ["Inter", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "16px",
        "lg": "20px",
        "xl": "28px",
        "full": "9999px"
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}

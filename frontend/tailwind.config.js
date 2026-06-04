/** @type {import('tailwindcss').Config} */
const color = (name, shade) => `rgb(var(--color-${name}-${shade}) / <alpha-value>)`;
const solid = (name) => `rgb(var(--color-${name}) / <alpha-value>)`;

const scale = (name, shades) =>
  Object.fromEntries(shades.map((shade) => [shade, color(name, shade)]));

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        white: solid("white"),
        black: solid("black"),
        red: scale("brand", [50, 100, 150, 200, 400, 500, 600, 650, 700, 750, 755, 800, 900, 950, 955]),
        slate: scale("surface", [50, 100, 150, 200, 205, 250, 300, 350, 400, 450, 500, 600, 650, 700, 750, 755, 800, 805, 850, 855, 900, 950, 955]),
        gray: scale("surface", [50, 100, 150, 200, 300, 400, 500, 600, 700, 800, 900, 950]),
        pink: scale("pink", [50, 200, 700]),
        amber: scale("amber", [50, 100, 200, 400, 500, 600, 700, 800, 950]),
        orange: scale("orange", [50, 200, 500, 700]),
        blue: scale("blue", [50, 100, 200, 400, 500, 600, 700]),
        sky: scale("sky", [400, 500]),
        indigo: scale("indigo", [500, 600]),
        purple: scale("purple", [50, 200, 500, 700]),
        emerald: scale("emerald", [50, 100, 200, 400, 500, 600, 700, 950]),
        green: scale("green", [50, 100, 300, 400, 500, 600, 700, 800, 900, 950]),
        yellow: scale("yellow", [400]),
        cyan: scale("cyan", [400]),
        primary: scale("blue", [50, 100, 400, 500, 600, 700]),
        dark: {
          800: color("surface", 800),
          900: color("surface", 900),
          950: color("surface", 950),
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-dot': 'bounceDot 1.4s infinite ease-in-out both',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceDot: {
          '0%, 80%, 100%': { transform: 'scale(0)' },
          '40%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}

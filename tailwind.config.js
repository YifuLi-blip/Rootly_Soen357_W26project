/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary green palette — represents growth, nature, volunteering
        sage: {
          50:  '#f4faf4',
          100: '#e6f4e6',
          200: '#c8e6c8',
          300: '#a3d4a3',
          400: '#72be72',
          500: '#4ea54e',
          600: '#3d8b3d',
          700: '#336f33',
          800: '#2d5a2d',
          900: '#264a26',
        },
        // Accent purple palette — represents achievement, progress, reward
        lilac: {
          50:  '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Outfit"', '"DM Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'glow-green': '0 0 20px -5px rgba(78, 165, 78, 0.3)',
        'glow-purple': '0 0 20px -5px rgba(168, 85, 247, 0.3)',
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0F1117',
        surface: '#1A1D27',
        'surface-2': '#21253A',
        accent: '#6C63FF',
        'accent-hover': '#7B73FF',
        'text-primary': '#E8E8F0',
        'text-secondary': '#8B8FA8',
        'priority-high': '#FF4D6D',
        'priority-medium': '#FFB347',
        'priority-low': '#4ECDC4',
        border: '#2A2D3E',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

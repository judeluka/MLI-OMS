// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", // Path to your main HTML file (usually at the root)
    "./src/**/*.{js,ts,jsx,tsx}", // Scans all .js, .ts, .jsx, and .tsx files in the src folder and its subfolders
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

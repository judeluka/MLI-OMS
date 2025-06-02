// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", // Path to your main HTML file (usually at the root)
    "./src/**/*.{js,ts,jsx,tsx}", // Scans all .js, .ts, .jsx, and .tsx files in the src folder and its subfolders
  ],
  theme: {
    extend: {
      fontSize: {
        // Increase all font sizes while maintaining hierarchy
        'xs': ['0.875rem', { lineHeight: '1.4' }],     // was 0.75rem, now 14px
        'sm': ['1rem', { lineHeight: '1.5' }],         // was 0.875rem, now 16px  
        'base': ['1.125rem', { lineHeight: '1.6' }],   // was 1rem, now 18px
        'lg': ['1.25rem', { lineHeight: '1.6' }],      // was 1.125rem, now 20px
        'xl': ['1.375rem', { lineHeight: '1.6' }],     // was 1.25rem, now 22px
        '2xl': ['1.625rem', { lineHeight: '1.5' }],    // was 1.5rem, now 26px
        '3xl': ['2rem', { lineHeight: '1.4' }],        // was 1.875rem, now 32px
        '4xl': ['2.5rem', { lineHeight: '1.3' }],      // was 2.25rem, now 40px
        '5xl': ['3.25rem', { lineHeight: '1.2' }],     // was 3rem, now 52px
        '6xl': ['4rem', { lineHeight: '1.1' }],        // was 3.75rem, now 64px
      }
    },
  },
  plugins: [],
}

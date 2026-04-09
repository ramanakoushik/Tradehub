/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: "#FEFBF3",
          dark: "#F5F2E8",
        },
        accent: {
          teal: "#14b8a6",
          cyan: "#06b6d4",
          darkTeal: "#0f766e",
        },
      },
      boxShadow: {
        'neo': '4px 4px 0px 0px rgba(0,0,0,1)',
        'neo-lg': '8px 8px 0px 0px rgba(0,0,0,1)',
        'neo-hover': '2px 2px 0px 0px rgba(0,0,0,1)',
      },
      borderRadius: {
        'neo': '0px', 
        'neo-sm': '4px',
        'neo-md': '8px',
        'neo-lg': '12px',
        'neo-xl': '24px',
      }
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        navy: '#101477',
        teal: '#39BFB7',
        blue: '#3289D1',
        ink: '#20334F',
        muted: '#7183A2',
        line: '#DCE5F0',
        surface: '#F4F7FC',
        danger: '#DC2626',
        success: {
          DEFAULT: '#39BFB7',
          soft: '#E0F7F4',
        },
        info: {
          soft: '#EBF4FF',
          icon: '#DBEAFE',
          ring: '#60A5FA',
          preview: '#EBF5FF',
        },
        placeholder: '#9CA3AF',
        subtle: '#6B7280',
        body: '#374151',
        'ink-dark': '#111827',
        divider: '#F3F4F6',
        'card-line': '#E5E7EB',
      },
    },
  },
  plugins: [],
};

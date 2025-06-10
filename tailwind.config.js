module.exports = {
  mode: 'jit',
  content: ['./app/**/*.{js,ts,jsx,tsx}', './src/**/*.{js,ts,jsx,tsx}'], // remove unused styles in production
  darkMode: 'media', // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-chelsea-market)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-roboto-mono)', 'Menlo', 'Monaco', 'monospace'],
        'chelsea-market': ['var(--font-chelsea-market)', 'system-ui', 'sans-serif'],
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}

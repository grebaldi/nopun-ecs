module.exports = {
  mode: 'jit',
  purge: [
    '../root/**/*.{js,ts,jsx,tsx,md,mdx}',
    '../packages/**/*.{js,ts,jsx,tsx,md,mdx}'
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
}

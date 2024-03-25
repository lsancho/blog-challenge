const standard = require('prettier-config-standard')
// const tailwindcss = require.resolve('prettier-plugin-tailwindcss')

/** @type {import("prettier").Config} */
const config = {
  ...standard,
  plugins: ['prettier-plugin-tailwindcss'],
  printWidth: 130
}

module.exports = config

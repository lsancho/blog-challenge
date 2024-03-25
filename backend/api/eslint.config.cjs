const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');


// @ts-check

module.exports = tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
);

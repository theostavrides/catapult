module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: [
      '@typescript-eslint',
    ],
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/eslint-recommended',
      'plugin:@typescript-eslint/recommended',
    ],
    rules: {
        "no-empty": "off",
        "no-empty-function": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
    }
  };
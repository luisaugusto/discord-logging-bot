module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'plugin:prettier/recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  env: {
    browser: true,
    es6: true
  },
  rules: {
    '@typescript-eslint/no-explicit-any': ['error'],
    '@typescript-eslint/no-unused-vars': ['error']
  }
};

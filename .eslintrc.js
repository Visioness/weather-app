module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "airbnb-base",
    "prettier"
  ],
  plugins: [],
  rules: {
    "no-unused-vars": "warn",
    "no-undef": "warn",
  },
};
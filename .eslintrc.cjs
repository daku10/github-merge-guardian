module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  overrides: [],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: "./tsconfig.json"
  },
  plugins: ["react", "@typescript-eslint"],
  rules: {
    "no-console": ["error", { allow: ["warn", "error"] }],
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }]
  },
  ignorePatterns: [".eslintrc.cjs"],
  settings: {
    react: {
      version: "detect"
    }
  }
}

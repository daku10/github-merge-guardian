import js from "@eslint/js"
import tsEsLintPlugin from "@typescript-eslint/eslint-plugin"
import tsEsLintParser from "@typescript-eslint/parser"
import reactPlugin from "eslint-plugin-react"
import reactHooksPlugin from "eslint-plugin-react-hooks"
import globals from "globals"

export default [
  { ignores: ["build"] },
  js.configs.recommended,
  {
    plugins: {
      "@typescript-eslint": tsEsLintPlugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin
    }
  },
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    languageOptions: {
      parser: tsEsLintParser,
      parserOptions: {
        project: true
      },
      globals: {
        ...globals.browser,
        ...globals.webextensions
      }
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...tsEsLintPlugin.configs["eslint-recommended"].overrides[0].rules,
      ...tsEsLintPlugin.configs["strict-type-checked"].rules,
      ...tsEsLintPlugin.configs["stylistic-type-checked"].rules,
      "no-console": ["error", { allow: ["warn", "error"] }],
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
      ],
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-import-type-side-effects": "error",
      "@typescript-eslint/consistent-type-definitions": ["error", "type"]
    },
    settings: {
      react: {
        version: "detect"
      }
    }
  }
]

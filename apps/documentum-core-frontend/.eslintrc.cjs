module.exports = {
  parser: "@typescript-eslint/parser",
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:prettier/recommended"
  ],
  plugins: [
    "react",
    "react-hooks",
    "@typescript-eslint",
    "jsx-a11y",
    "simple-import-sort"
  ],
  rules: {
    // Imports automatiques
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",

    // React 17+ : pas besoin du "import React from 'react'"
    "react/react-in-jsx-scope": "off",

    // TypeScript : pas besoin d'expliciter les types
    "@typescript-eslint/no-explicit-any": "warn",
  },
  settings: {
    react: {
      version: "detect"
    }
  }
};

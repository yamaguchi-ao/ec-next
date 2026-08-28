import js from "@eslint/js";
import tseslint from "typescript-eslint";
import next from "@next/eslint-plugin-next";

export default [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "build/**",
      "dist/**",
      "public/**"
    ]
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "@next/next": next
    },
    rules: {
      ...next.configs.recommended.rules,
      ...next.configs["core-web-vitals"].rules
    }
  }
];
import globals from "globals";
import tseslint from "typescript-eslint";
import nextPlugin from "@next/eslint-plugin-next";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";

export default tseslint.config(
  {
    ignores: [
      "*.config.js",
      "*.config.mjs",
      ".next/*",
      "node_modules/*",
      "public/*",
      "docs/*",
      "supabase/functions/**", // Denoのコードは別途deno lintで (重要: _sharedも含む)
    ],
  },
  {
    files: ["app/**/*.{ts,tsx,js,jsx}", "components/**/*.{ts,tsx,js,jsx}", "lib/**/*.{ts,tsx,js,jsx}", "hooks/**/*.{ts,tsx,js,jsx}", "stores/**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: true, 
        ecmaVersion: "latest",
        sourceType: "module",
        globals: {
          ...globals.browser,
          ...globals.node, 
        },
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      "react": reactPlugin,
      "react-hooks": reactHooksPlugin,
      "@next/next": nextPlugin,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      // ...tseslint.configs.stylistic.rules, // 好みで追加
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "@typescript-eslint/no-var-requires": "off", 
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  }
);

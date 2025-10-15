import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";
import js from "@eslint/js";
import nodePlugin from "eslint-plugin-n";
import pluginPromise from "eslint-plugin-promise";

export default defineConfig([
  { ignores: ["dist/**"] },
  nodePlugin.configs["flat/recommended-script"],
  pluginPromise.configs["flat/recommended"],
  js.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: { globals: globals.node },
  },
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
]);

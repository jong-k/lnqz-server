// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./types/eslint-plugin-promise.d.ts" />

import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";
import js from "@eslint/js";
import nodePlugin from "eslint-plugin-n";
import pluginPromise from "eslint-plugin-promise";
import { importX } from "eslint-plugin-import-x";
import pluginSecurity from "eslint-plugin-security";
import tsParser from "@typescript-eslint/parser";
import sonarjs from "eslint-plugin-sonarjs";
import eslintPluginUnicorn from "eslint-plugin-unicorn";

export default defineConfig([
  { ignores: ["dist/**"] },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: { globals: globals.node },
  },
  js.configs.recommended,
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      "import-x/no-dynamic-require": "warn",
      "import-x/no-nodejs-modules": "warn",
    },
  },
  nodePlugin.configs["flat/recommended-module"],
  pluginSecurity.configs.recommended,
  sonarjs.configs.recommended,
  {
    languageOptions: {
      globals: globals.builtin,
    },
    plugins: {
      unicorn: eslintPluginUnicorn,
    },
    rules: {
      "unicorn/better-regex": "error",
    },
  },
  pluginPromise.configs["flat/recommended"],
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
]);

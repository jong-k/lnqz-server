// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./@types/eslint-plugin-promise.d.ts" />
import { importX } from "eslint-plugin-import-x";
import nodePlugin from "eslint-plugin-n";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import pluginPromise from "eslint-plugin-promise";
import pluginSecurity from "eslint-plugin-security";
import { configs as sonarConfigs } from "eslint-plugin-sonarjs";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import { defineConfig } from "eslint/config";
import globals from "globals";
import { configs as tsConfigs } from "typescript-eslint";
import js from "@eslint/js";

export default defineConfig([
  { ignores: ["dist/**"] },
  js.configs.recommended,
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    rules: {
      "import-x/no-nodejs-modules": "off",
    },
  },
  nodePlugin.configs["flat/recommended-module"],
  // eslint-disable-next-line import-x/no-named-as-default-member
  pluginSecurity.configs.recommended,
  sonarConfigs.recommended,
  {
    plugins: {
      unicorn: eslintPluginUnicorn,
    },
    rules: {
      "unicorn/better-regex": "error",
    },
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: { globals: globals.node },
  },
  pluginPromise.configs["flat/recommended"],
  ...tsConfigs.recommended,
  eslintPluginPrettierRecommended,
]);

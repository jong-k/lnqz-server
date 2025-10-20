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
  // 글로벌 설정: import-x resolver 활성화(node, typescript)
  {
    settings: {
      "import-x/resolver": {
        node: true,
        typescript: {
          // tsconfig를 자동 탐색(project: true) 및 @types 우선 시도
          project: true,
          alwaysTryTypes: true,
        },
      },
    },
  },
  js.configs.recommended,
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    rules: {
      "import-x/no-nodejs-modules": "off",
      "import-x/no-named-as-default": "off",
    },
  },
  nodePlugin.configs["flat/recommended-module"],
  pluginSecurity.configs.recommended,
  sonarConfigs.recommended,
  {
    plugins: {
      unicorn: eslintPluginUnicorn,
    },
    rules: {
      "unicorn/better-regex": "error",
      "sonarjs/todo-tag": "off",
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

import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tseslintParser from '@typescript-eslint/parser';
import pluginVue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import pluginVueA11y from "eslint-plugin-vuejs-accessibility";

import { defineConfig, globalIgnores } from "eslint/config";



export default defineConfig([
  // Global Config
  eslint.configs.recommended,
  ...pluginVueA11y.configs["flat/recommended"],
  ...pluginVue.configs['flat/recommended'],
  globalIgnores([
    "node_modules/*",
    "dist/*",
    ".yarn/*",
  ]),
  // Vue3
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslintParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
      },
    },
    rules: {
      'vuejs-accessibility/tabindex-no-positive' : 'off',   // this rules makes no sense
      'vuejs-accessibility/label-has-for': 'off',          // currently broken
      'vuejs-accessibility/media-has-caption': 'off',      // this is an audio product thus this isn't a valid
      'vue/multi-word-component-names': 'off',
      'vue/html-self-closing' : 'off',
      'no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
    },
  },

  // TypeScript
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslintParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
    },
  },
  
  // Other rule-sets
  {
    files: ['**/*'],
    languageOptions: {
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        HTMLAudioElement: 'readonly',
        HTMLDivElement: 'readonly',
        HTMLDialogElement: 'readonly',
        HTMLElement: 'readonly',
        HTMLInputElement: 'readonly',
        CustomEvent: 'readonly',
        MouseEvent: 'readonly',
        fetch: 'readonly',
        __dirname: 'readonly',
        Location: 'readonly',
      },
    },
  },
]); 
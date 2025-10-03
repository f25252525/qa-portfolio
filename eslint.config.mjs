// eslint.config.mjs
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import prettier from 'eslint-config-prettier';
import ymlPlugin from 'eslint-plugin-yml';
import yamlParser from 'yaml-eslint-parser';

// @ts-check
/** @type {import('eslint').Linter.Config[]} */
export default [
  // 1) Ignore generated / vendor stuff
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '**/coverage-unit/**',
      'artifacts/**',
      '**/*.min.js',
      'perf-jmeter/**',
      '**/html-report/**',
      '**/sbadmin2-1.0.7/**',
      'ui-selenium-java/target/**',
      'ui-selenium-java/**/surefire-reports/**',
      '**/playwright-report/**',
      '**/test-results/**',
      '**/trace/**',
    ],
  },

  // 2) Base JS
  js.configs.recommended,

  // 3) Cypress tests
  {
    files: ['ui-cypress/**/*.{js,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        describe: 'readonly',
        it: 'readonly',
        before: 'readonly',
        beforeEach: 'readonly',
        after: 'readonly',
        afterEach: 'readonly',
        expect: 'readonly',
        cy: 'readonly',
        Cypress: 'readonly',
      },
    },
    rules: { 'no-undef': 'off' },
  },

  // 4) Playwright TS tests (no type-aware rules yet)
  {
    files: ['ui-playwright-ts/**/*.{ts,tsx}'],
    plugins: { '@typescript-eslint': tseslint.plugin },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        // keep type-aware linting OFF here
        project: false,
        projectService: false,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.node,
        ...globals.browser,
        test: 'readonly',
        describe: 'readonly',
        expect: 'readonly',
      },
    },
    // keep rules minimal here; add more later if you want
    rules: {},
  },

  {
    files: ['ui-playwright-ts/__tests__/**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.jest, // gives describe, it, test, expect, before*, after*
      },
    },
  },
  // 5) k6 scripts
  {
    files: ['perf-k6/**/*.js'],
    languageOptions: { globals: { __ENV: 'readonly' } },
    // silence the "check is defined but never used" warning
    rules: { 'no-unused-vars': ['error', { varsIgnorePattern: '^check$' }] },
  },

  {
    files: ['api-postman-newman/**/*.js'],
    languageOptions: {
      globals: { ...globals.node },
      sourceType: 'commonjs', // so require/module.exports are OK
    },
  },

  // 6) YAML rules (keep lightweight for CI speed)
  {
    files: ['**/*.{yml,yaml}'],
    languageOptions: { parser: yamlParser },
    plugins: { yml: ymlPlugin },
    rules: {
      // keep only basic, non-stylistic safety checks
      'yml/no-empty-document': 'error',
      'yml/no-irregular-whitespace': 'error',
      'yml/indent': ['error', 2],

      // let Prettier handle style; avoid conflicts with .yamllint & your formatter
      'yml/plain-scalar': 'off',
      'yml/quotes': 'off',
      'spaced-comment': 'off',
      'yml/flow-mapping-curly-spacing': 'off',
      'yml/flow-sequence-bracket-spacing': 'off',
      'yml/key-spacing': 'off',
    },
  },

  // 7) Turn off stylistic rules that conflict with Prettier
  prettier,
];

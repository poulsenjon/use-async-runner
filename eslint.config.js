import eslint from '@eslint/js'
import pluginImport from 'eslint-plugin-import'
import pluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import pluginReact from 'eslint-plugin-react'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import tsEslint from 'typescript-eslint'

export default tsEslint.config(
  eslint.configs.recommended,
  tsEslint.configs.recommended,
  pluginImport.flatConfigs.recommended,
  pluginImport.flatConfigs.errors,
  pluginImport.flatConfigs.warnings,
  pluginImport.flatConfigs.typescript,
  pluginPrettierRecommended,
  { files: ['**/*.{ts,tsx,js,jsx,mjs,cjs}'] },
  { ignores: ['**/node_modules/*', '**/dist/*'] },
  {
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
    },
    settings: {
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
      'import/resolver': {
        typescript: true,
        node: true,
      },
    },
  },
  {
    plugins: {
      react: pluginReact,
      'react-hooks': pluginReactHooks,
    },
  },
  {
    rules: {
      'import/newline-after-import': ['error', { count: 1 }],
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'parent', 'sibling', 'index'],
          'newlines-between': 'never',
          alphabetize: {
            order: 'asc',
            orderImportKind: 'asc',
            caseInsensitive: false,
          },
        },
      ],
      'import/first': ['error', 'disable-absolute-first'],
      'import/no-named-as-default': 'off',
      'import/no-named-as-default-member': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/no-unused-expressions': 'off',
      'no-process-env': 'error',
      'no-console': ['error', { allow: ['info', 'warn', 'error'] }],
      ...pluginReactHooks.configs.recommended.rules,
      'react-hooks/exhaustive-deps': 'error',
    },
  },
)

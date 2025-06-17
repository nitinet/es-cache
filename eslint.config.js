import pluginJs from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [{ languageOptions: { globals: globals.node } }, pluginJs.configs.recommended, ...tseslint.configs.strict, eslintPluginPrettierRecommended];

// ESLint flat config: catches real bugs; formatting is left to Prettier.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['node_modules/', 'my_notes/'] },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    // Exercise stubs leave things unused by design:
    //  - params in `function f(a, b) { return todo(); }`
    //  - generic params in `type MyPartial<T> = TODO_TYPE` (single capital letters)
    //  - the quiz placeholder import `TODO`
    // Generator stubs have no `yield` yet. Other unused variables are still reported,
    // so your own solutions get the usual hints.
    files: ['src/**/exercises.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { args: 'none', varsIgnorePattern: '^(TODO|[A-Z])$' },
      ],
      'require-yield': 'off',
    },
  },
);

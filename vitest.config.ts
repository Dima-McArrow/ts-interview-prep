import path from 'node:path';
import { defineConfig, type Plugin } from 'vitest/config';

/**
 * When SOLUTIONS=1 is set, every `import ... from './exercises'` inside a test
 * file is redirected to `solutions/<module-folder>.ts`.
 * This lets the very same tests verify the reference solutions:
 *   npm run test:solutions
 */
const useSolutions = (): Plugin => ({
  name: 'use-solutions',
  enforce: 'pre',
  resolveId(source, importer) {
    if (!importer || source !== './exercises') return null;
    const moduleFolder = path.basename(path.dirname(importer)); // e.g. "01-arrays"
    return path.resolve(import.meta.dirname, 'solutions', `${moduleFolder}.ts`);
  },
});

export default defineConfig({
  plugins: process.env.SOLUTIONS ? [useSolutions()] : [],
  test: {
    include: ['src/**/*.test.ts'],
    // Type-level tests (*.test-d.ts) are checked by the TS compiler, not executed.
    // Skipped for test:solutions, because the alias trick works only at runtime.
    typecheck: {
      enabled: !process.env.SOLUTIONS,
      include: ['src/**/*.test-d.ts'],
      tsconfig: './tsconfig.vitest.json',
    },
    // Clear output when a single task fails: show one line per test.
    reporters: ['default'],
  },
});

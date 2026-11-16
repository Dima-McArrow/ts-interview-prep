import { inspect } from 'node:util';

/** Prints a big header so lesson output is easy to scan. */
export function section(title: string): void {
  console.log(`\n${'='.repeat(70)}\n  ${title}\n${'='.repeat(70)}`);
}

/**
 * Prints `label → value` with full depth (plain console.log hides nested
 * arrays deeper than 2 levels as [Array]).
 */
export function show(label: string, value: unknown): void {
  const printed =
    typeof value === 'string'
      ? JSON.stringify(value)
      : inspect(value, { depth: null, colors: true, breakLength: Infinity });
  console.log(`${label.padEnd(44)} → ${printed}`);
}

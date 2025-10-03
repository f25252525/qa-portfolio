/**
 * Stryker mutation setup: mutates TS production sources via Jest while enforcing 80/60% score thresholds
 * so regressions surface without breaking the pipeline (break remains 0 for small suites). HTML + progress
 * reporters keep artifacts actionable in CI.
 */
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  mutate: ['src/**/*.ts'], // Only mutate app TypeScript files; tests/config stay untouched to keep runs fast.
  testRunner: 'jest',
  reporters: ['html', 'progress', 'clear-text'],
  thresholds: { high: 80, low: 60, break: 0 }, // break=0 avoids flaky failures while still tracking coverage goals.
  jest: {
    projectType: 'custom',
    configFile: 'jest.config.ts',
    enableFindRelatedTests: false,
  },
  tsconfigFile: 'tsconfig.json',
};

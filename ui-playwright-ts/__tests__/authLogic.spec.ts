import { isValidLogin } from '../src/authLogic';

describe('authLogic.isValidLogin', () => {
  test('returns true for typical valid creds', () => {
    expect(isValidLogin('standard_user', 'secret_sauce')).toBe(true);
  });

  test('trims whitespace and validates', () => {
    expect(isValidLogin('  user  ', '  passw ')).toBe(true);
  });

  test('fails for empty username', () => {
    expect(isValidLogin('', 'abcd')).toBe(false);
  });

  test('fails for empty password', () => {
    expect(isValidLogin('user', '')).toBe(false);
  });

  test('fails for short password (<4)', () => {
    expect(isValidLogin('user', '123')).toBe(false);
  });

  test('handles nullish inputs safely', () => {
    // @ts-expect-error: intentional null/undefined to test runtime behavior
    expect(isValidLogin(undefined, 'abcd')).toBe(false);
    // @ts-expect-error: intentional null/undefined to test runtime behavior
    expect(isValidLogin('user', undefined)).toBe(false);
  });
});

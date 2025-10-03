import { shouldShowCartBadge } from '../src/cartLogic';

describe('cartLogic.shouldShowCartBadge', () => {
  test('shows badge when count > 0', () => {
    expect(shouldShowCartBadge(1)).toBe(true);
    expect(shouldShowCartBadge(5)).toBe(true);
  });

  test('hides badge when count is 0', () => {
    expect(shouldShowCartBadge(0)).toBe(false);
  });

  test('hides badge for negative counts', () => {
    expect(shouldShowCartBadge(-1)).toBe(false);
  });

  test('hides badge for non-finite counts', () => {
    expect(shouldShowCartBadge(NaN as any)).toBe(false);
    expect(shouldShowCartBadge(Infinity)).toBe(false);
    expect(shouldShowCartBadge(-Infinity)).toBe(false);
  });
});

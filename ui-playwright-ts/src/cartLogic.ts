/**
 * Cart related pure logic helpers for mutation testing.
 */
export function shouldShowCartBadge(count: number): boolean {
  if (!Number.isFinite(count)) return false;
  return count > 0;
}

export default { shouldShowCartBadge };

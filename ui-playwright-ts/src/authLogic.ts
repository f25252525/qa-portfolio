/**
 * Simple authentication input validator.
 * Pure logic used by tests to enable mutation testing targets.
 */
export function isValidLogin(user: string, pass: string): boolean {
  const u = user?.trim() ?? '';
  const p = pass?.trim() ?? '';
  // both must be non-empty and password should meet a minimal length
  if (u.length === 0 || p.length === 0) return false;
  if (p.length < 4) return false;
  return true;
}

export default { isValidLogin };

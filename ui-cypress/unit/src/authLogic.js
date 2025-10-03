// Simple logic helpers mirrored from Playwright TS project
function isValidLogin(user, pass) {
  const u = (user || '').trim();
  const p = (pass || '').trim();
  if (!u || !p) return false;
  return p.length >= 4;
}

function shouldShowCartBadge(count) {
  return Number.isFinite(count) && count > 0;
}

module.exports = { isValidLogin, shouldShowCartBadge };

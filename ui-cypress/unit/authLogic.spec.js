const { expect } = require('chai');
const { isValidLogin, shouldShowCartBadge } = require('./src/authLogic');

describe('authLogic.isValidLogin', () => {
  it('returns true for typical valid creds', () => {
    expect(isValidLogin('standard_user', 'secret_sauce')).to.equal(true);
  });
  it('trims whitespace and validates', () => {
    expect(isValidLogin('  user  ', '  passw ')).to.equal(true);
  });
  it('fails for empty username', () => {
    expect(isValidLogin('', 'abcd')).to.equal(false);
  });
  it('fails for empty password', () => {
    expect(isValidLogin('user', '')).to.equal(false);
  });
  it('fails for short password (<4)', () => {
    expect(isValidLogin('user', '123')).to.equal(false);
  });
});

describe('cartLogic.shouldShowCartBadge', () => {
  it('shows badge when count > 0', () => {
    expect(shouldShowCartBadge(1)).to.equal(true);
    expect(shouldShowCartBadge(5)).to.equal(true);
  });
  it('hides badge when count is 0', () => {
    expect(shouldShowCartBadge(0)).to.equal(false);
  });
  it('hides badge for negative/non-finite', () => {
    expect(shouldShowCartBadge(-1)).to.equal(false);
    expect(shouldShowCartBadge(NaN)).to.equal(false);
    expect(shouldShowCartBadge(Infinity)).to.equal(false);
  });
});

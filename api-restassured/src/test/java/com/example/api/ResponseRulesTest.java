package com.example.api;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class ResponseRulesTest {

  @Test
  @DisplayName("isValidUserListCount: accepts 1 and 100")
  void validCounts() {
    assertTrue(ResponseRules.isValidUserListCount(1));
    assertTrue(ResponseRules.isValidUserListCount(100));
    assertTrue(ResponseRules.isValidUserListCount(42));
  }

  @Test
  @DisplayName("isValidUserListCount: rejects 0, negatives, and >100")
  void invalidCounts() {
    assertFalse(ResponseRules.isValidUserListCount(0));
    assertFalse(ResponseRules.isValidUserListCount(-1));
    assertFalse(ResponseRules.isValidUserListCount(101));
  }

  @Test
  @DisplayName("requiresAuth: true for null/blank/invalid tokens")
  void requiresAuthForMissingOrInvalid() {
    assertTrue(ResponseRules.requiresAuth(null));
    assertTrue(ResponseRules.requiresAuth(""));
    assertTrue(ResponseRules.requiresAuth("   "));
    assertTrue(ResponseRules.requiresAuth("token"));
    assertTrue(ResponseRules.requiresAuth("Bearer"));
    assertTrue(ResponseRules.requiresAuth("Bearer ")); // missing value after prefix
  }

  @Test
  @DisplayName("requiresAuth: false for non-empty Bearer tokens (trimmed)")
  void doesNotRequireAuthWithBearerToken() {
    assertFalse(ResponseRules.requiresAuth("Bearer abcdef"));
    assertFalse(ResponseRules.requiresAuth("  Bearer   xyz  "));
  }
}


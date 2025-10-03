package com.example.unit;

import static org.testng.Assert.*;

import com.example.util.ResponseRules;
import org.testng.annotations.Test;

public class ResponseRulesTest {
  @Test
  public void validCounts() {
    assertTrue(ResponseRules.isValidUserListCount(1));
    assertTrue(ResponseRules.isValidUserListCount(42));
    assertTrue(ResponseRules.isValidUserListCount(100));
  }

  @Test
  public void invalidCounts() {
    assertFalse(ResponseRules.isValidUserListCount(0));
    assertFalse(ResponseRules.isValidUserListCount(-1));
    assertFalse(ResponseRules.isValidUserListCount(101));
  }

  @Test
  public void requiresAuthForMissingOrInvalid() {
    assertTrue(ResponseRules.requiresAuth(null));
    assertTrue(ResponseRules.requiresAuth(""));
    assertTrue(ResponseRules.requiresAuth("   "));
    assertTrue(ResponseRules.requiresAuth("token"));
    assertTrue(ResponseRules.requiresAuth("Bearer "));
  }

  @Test
  public void doesNotRequireAuthWithBearerToken() {
    assertFalse(ResponseRules.requiresAuth("Bearer abcdef"));
    assertFalse(ResponseRules.requiresAuth("  Bearer   xyz  "));
  }
}

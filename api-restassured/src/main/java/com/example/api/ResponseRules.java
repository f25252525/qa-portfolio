package com.example.api;

/**
 * Tiny pure logic helpers so mutation testing can target production code
 * without hitting the network.
 */
public final class ResponseRules {
  private ResponseRules() {}

  /**
   * Validates a user list count (e.g., items per page). Accept 1..100 inclusive.
   */
  public static boolean isValidUserListCount(int count) {
    return count > 0 && count <= 100;
  }

  /**
   * Returns true if the request requires auth (i.e., token missing/invalid).
   * A valid token is considered a non-empty string that starts with "Bearer ".
   */
  public static boolean requiresAuth(String token) {
    if (token == null) return true;
    String t = token.trim();
    if (t.isEmpty()) return true;
    if (t.startsWith("Bearer ") && t.length() > 7) {
      return false; // has a non-empty bearer token
    }
    return true; // anything else is considered requiring auth
  }
}


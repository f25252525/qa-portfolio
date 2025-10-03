package com.example.util;

public final class ResponseRules {
  private ResponseRules() {}

  // Accept 1..100 inclusive
  public static boolean isValidUserListCount(int count) {
    return count > 0 && count <= 100;
  }

  // Require non-empty Bearer token
  public static boolean requiresAuth(String token) {
    if (token == null) {
      return true;
    }
    String t = token.trim();
    if (t.isEmpty()) {
      return true;
    }
    return !(t.startsWith("Bearer ") && t.length() > 7);
  }
}

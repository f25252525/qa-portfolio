package com.example.api;

import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.*;

import org.junit.jupiter.api.Test;

/**
 * Smoke coverage for the ReqRes API, exercising the happy user list and a representative negative lookup.
 */
public class ApiTests {
  private final String BASE = System.getenv().getOrDefault("API_BASE", "https://reqres.in/api");

  /**
   * Endpoint: GET /users?page=2. Success when status is 200 with a non-empty "data" array; 401 is tolerated for
   * secured environments. Guards against pagination regressions that would break user listings consumed by the UI.
   */
  @Test
  public void listUsers() {
    io.restassured.response.Response res = given().get(BASE + "/users?page=2");
    res.then().statusCode(anyOf(is(200), is(401)));
    if (res.statusCode() == 200) {
      res.then().body("data", not(empty()));
    }
  }

  /**
   * Endpoint: GET /unknown/23. Expects a 404 for missing resources (or 401 when auth is enforced), ensuring the
   * platform surfaces proper error semantics for absent entities referenced by clients.
   */
  @Test
  public void negativeNotFoundOrUnauthorized() {
    given()
      .get(BASE + "/unknown/23")
      .then()
      .statusCode(anyOf(is(404), is(401)));
  }
}

package com.example.tests.smoke;

import static org.testng.Assert.assertTrue;

import com.example.pages.LoginPage;
import com.example.tests.BaseTest;
import org.testng.annotations.Test;

public class LoginSmokeTest extends BaseTest {
  /**
   * Flow: Launches the login page, signs in with env credentials, and keeps focus on smoke
   * coverage. Assertions: Confirms the Products keyword is present in the resulting HTML to prove
   * navigation succeeded. Risk: Catches high-priority login outages before other Selenium suites
   * execute.
   */
  @Test
  public void userLogsInAndSeesTheProductsPage() {
    new LoginPage(driver).open(base).login(user, pass);
    assertTrue(driver.getPageSource().contains("Products"));
  }
}

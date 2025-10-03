package com.example.tests;

import java.net.URL;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.testng.annotations.*;

public class BaseTest {
  protected WebDriver driver;
  protected String base =
      System.getProperty(
          "base.url", System.getenv().getOrDefault("APP_BASE_URL", "https://www.saucedemo.com"));
  protected String user =
      System.getProperty("user", System.getenv().getOrDefault("USER", "standard_user"));
  protected String pass =
      System.getProperty("pass", System.getenv().getOrDefault("PASS", "secret_sauce"));

  @BeforeClass
  public void setUp() throws Exception {
    String grid =
        System.getProperty(
            "selenium.grid.url", System.getenv().getOrDefault("SELENIUM_GRID_URL", ""));
    String browser =
        System.getProperty("browser", System.getenv().getOrDefault("BROWSER", "chrome"))
            .toLowerCase();
    if (grid != null && !grid.isBlank()) {
      if ("firefox".equals(browser)) {
        FirefoxOptions fx = new FirefoxOptions();
        fx.addArguments("-width=1280");
        fx.addArguments("-height=900");
        driver = new RemoteWebDriver(new URL(grid), fx);
      } else {
        ChromeOptions cx = new ChromeOptions();
        cx.addArguments("--window-size=1280,900");
        driver = new RemoteWebDriver(new URL(grid), cx);
      }
    } else {
      ChromeOptions cx = new ChromeOptions();
      cx.addArguments("--window-size=1280,900");
      driver = new ChromeDriver(cx);
    }
  }

  @AfterClass
  public void tearDown() {
    if (driver != null) driver.quit();
  }
}

package com.example.pages;

import java.time.Duration;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

public class LoginPage {
  private final WebDriver driver;
  private final WebDriverWait wait;

  private final By username = By.cssSelector("[data-test='username'], #user-name");
  private final By password = By.cssSelector("[data-test='password'], #password");
  private final By loginButton = By.cssSelector("[data-test='login-button'], #login-button");

  public LoginPage(WebDriver driver) {
    this.driver = driver;
    this.wait = new WebDriverWait(driver, Duration.ofSeconds(20));
  }

  public LoginPage open(String baseUrl) {
    String root =
        (baseUrl == null || baseUrl.isBlank())
            ? System.getenv().getOrDefault("APP_BASE_URL", "https://www.saucedemo.com")
            : baseUrl;
    driver.get(root + "/");
    wait.until(ExpectedConditions.visibilityOfElementLocated(username));
    return this;
  }

  public ProductsPage login(String user, String pass) {
    driver.findElement(username).sendKeys(user);
    driver.findElement(password).sendKeys(pass);
    driver.findElement(loginButton).click();
    return new ProductsPage(driver).awaitLoaded();
  }
}

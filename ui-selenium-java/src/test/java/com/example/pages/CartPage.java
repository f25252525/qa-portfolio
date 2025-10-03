package com.example.pages;

import java.time.Duration;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

public class CartPage {
  private final WebDriver driver;
  private final WebDriverWait wait;

  private final By title = By.xpath("//*[contains(text(),'Your Cart')]");
  private final By backpackItem = By.xpath("//*[contains(text(),'Sauce Labs Backpack')]");

  public CartPage(WebDriver driver) {
    this.driver = driver;
    this.wait = new WebDriverWait(driver, Duration.ofSeconds(5));
  }

  public CartPage awaitLoaded() {
    wait.until(ExpectedConditions.visibilityOfElementLocated(title));
    return this;
  }

  public boolean hasBackpackItem() {
    wait.until(ExpectedConditions.visibilityOfElementLocated(backpackItem));
    return driver.findElements(backpackItem).size() > 0;
  }
}

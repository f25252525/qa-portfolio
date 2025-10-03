package com.example.pages;

import java.time.Duration;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

public class ProductsPage {
  private final WebDriver driver;
  private final WebDriverWait wait;

  private final By productsTitle = By.xpath("//*[contains(text(),'Products')]");
  private final By inventoryOrTitle =
      By.cssSelector("#inventory_container, .inventory_list, span.title");
  private final By addBackpack = By.cssSelector("[data-test='add-to-cart-sauce-labs-backpack']");
  private final By cartLink = By.cssSelector("[data-test='shopping-cart-link']");

  public ProductsPage(WebDriver driver) {
    this.driver = driver;
    this.wait = new WebDriverWait(driver, Duration.ofSeconds(20));
  }

  public ProductsPage awaitLoaded() {
    // Wait for either the title text or inventory container to be visible
    try {
      wait.until(
          ExpectedConditions.or(
              ExpectedConditions.visibilityOfElementLocated(inventoryOrTitle),
              ExpectedConditions.urlContains("inventory")));
    } catch (Exception e) {
      // Fallback to explicit title text
      wait.until(ExpectedConditions.visibilityOfElementLocated(productsTitle));
    }
    return this;
  }

  public ProductsPage addBackpackToCart() {
    wait.until(ExpectedConditions.elementToBeClickable(addBackpack)).click();
    return this;
  }

  public CartPage goToCart() {
    driver.findElement(cartLink).click();
    return new CartPage(driver).awaitLoaded();
  }
}

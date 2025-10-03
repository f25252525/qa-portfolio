package com.example.tests;

import static org.testng.Assert.assertTrue;

import com.example.pages.CartPage;
import com.example.pages.LoginPage;
import com.example.pages.ProductsPage;
import org.testng.annotations.Test;

public class CartTest extends BaseTest {
  /**
   * Flow: Logs in with env credentials, adds the backpack, and navigates to the cart summary.
   * Assertions: Uses page objects to ensure the cart page loads and the backpack item is present.
   * Risk: Protects add-to-cart wiring and cart navigation from regressions blocking checkout.
   */
  @Test
  public void userAddsBackpackAndSeesItInCart() {
    ProductsPage products = new LoginPage(driver).open(base).login(user, pass);

    CartPage cart = products.addBackpackToCart().goToCart();

    assertTrue(cart.hasBackpackItem(), "Expected 'Sauce Labs Backpack' to be present in cart");
  }
}

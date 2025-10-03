# Flow: Authenticates a standard shopper to unlock the product catalog.
# Assertions: Confirms the Products page loads and route /inventory.html is reached.
# Risk: Detects login outages, button wiring issues, or redirects tied to default data.
# Data: Uses env USER/PASS with fallback to standard_user/secret_sauce credentials.

@smoke
Feature: Login smoke
  As a Saucedemo shopper
  I want to sign in with my valid credentials
  So that I can view the products page

  Scenario: Successful login with standard credentials
    Given I am on the login page
    When I sign in with valid credentials
    Then I should see the products page

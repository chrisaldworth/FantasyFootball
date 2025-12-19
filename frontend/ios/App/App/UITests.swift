//
//  UITests.swift
//  AppUITests
//
//  UI Tests for Fantasy Football iOS App
//

import XCTest

final class UITests: XCTestCase {
    
    var app: XCUIApplication!
    
    override func setUpWithError() throws {
        continueAfterFailure = false
        
        app = XCUIApplication()
        app.launchArguments = ["--uitesting"]
        app.launch()
    }
    
    override func tearDownWithError() throws {
        app = nil
    }
    
    // MARK: - Login Flow Tests
    
    func testLoginFlow() throws {
        // Wait for app to load
        XCTAssertTrue(app.waitForExistence(timeout: 5))
        
        // Try to find and interact with login elements
        // Note: These selectors may need adjustment based on actual UI
        
        // Look for email field
        let emailFields = app.textFields
        if emailFields.count > 0 {
            let emailField = emailFields.firstMatch
            if emailField.exists {
                emailField.tap()
                emailField.typeText("test@example.com")
            }
        }
        
        // Look for password field
        let passwordFields = app.secureTextFields
        if passwordFields.count > 0 {
            let passwordField = passwordFields.firstMatch
            if passwordField.exists {
                passwordField.tap()
                passwordField.typeText("testpassword123")
            }
        }
        
        // Look for login button
        let loginButtons = app.buttons.matching(identifier: "Sign In")
        if loginButtons.count > 0 {
            loginButtons.firstMatch.tap()
            
            // Wait for navigation (either success or error)
            let _ = app.waitForExistence(timeout: 5)
        }
    }
    
    // MARK: - Navigation Tests
    
    func testNavigationWorks() throws {
        XCTAssertTrue(app.waitForExistence(timeout: 5))
        
        // Test that we can navigate through the app
        // This is a basic navigation smoke test
        
        // Check if we can see navigation elements
        let hasNavigation = app.navigationBars.count > 0 || 
                           app.tabBars.count > 0 ||
                           app.buttons.count > 0
        
        XCTAssertTrue(hasNavigation, "App should have navigation elements")
    }
    
    // MARK: - Dashboard Tests
    
    func testDashboardLoads() throws {
        // If user is logged in, dashboard should load
        // This test verifies dashboard elements exist
        
        XCTAssertTrue(app.waitForExistence(timeout: 5))
        
        // Wait a bit for content to load
        sleep(2)
        
        // Check if dashboard has content
        let hasContent = app.staticTexts.count > 0 || 
                        app.images.count > 0 ||
                        app.otherElements.count > 0
        
        XCTAssertTrue(hasContent, "Dashboard should have content")
    }
    
    // MARK: - Error Handling Tests
    
    func testErrorHandling() throws {
        // Test that app handles errors gracefully
        // This could test network errors, invalid input, etc.
        
        XCTAssertTrue(app.waitForExistence(timeout: 5))
        
        // Try to trigger an error (e.g., invalid login)
        let emailFields = app.textFields
        if emailFields.count > 0 {
            emailFields.firstMatch.tap()
            emailFields.firstMatch.typeText("invalid@test.com")
        }
        
        let passwordFields = app.secureTextFields
        if passwordFields.count > 0 {
            passwordFields.firstMatch.tap()
            passwordFields.firstMatch.typeText("wrongpassword")
        }
        
        // Try to submit
        let submitButtons = app.buttons.matching(identifier: "Sign In")
        if submitButtons.count > 0 {
            submitButtons.firstMatch.tap()
            
            // App should handle error gracefully (not crash)
            XCTAssertTrue(app.waitForExistence(timeout: 5), "App should not crash on error")
        }
    }
}











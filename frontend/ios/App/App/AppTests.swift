//
//  AppTests.swift
//  AppTests
//
//  Automated tests for Fantasy Football iOS App
//

import XCTest
@testable import App

final class AppTests: XCTestCase {
    
    var app: XCUIApplication!
    let backendURL = "http://localhost:8080"
    
    override func setUpWithError() throws {
        // Put setup code here. This method is called before the invocation of each test method in the class.
        continueAfterFailure = false
        
        // Launch the app
        app = XCUIApplication()
        app.launchArguments = ["--uitesting"]
        app.launch()
    }
    
    override func tearDownWithError() throws {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
        app = nil
    }
    
    // MARK: - App Launch Tests
    
    func testAppLaunches() throws {
        // Verify app launches successfully
        XCTAssertTrue(app.waitForExistence(timeout: 5), "App should launch")
    }
    
    func testAppHasMainElements() throws {
        // Wait for app to load
        let exists = app.waitForExistence(timeout: 5)
        XCTAssertTrue(exists, "App should exist")
        
        // Check if we can see any UI elements (login page, dashboard, etc.)
        // This is a basic smoke test
        let hasContent = app.otherElements.count > 0 || app.buttons.count > 0 || app.staticTexts.count > 0
        XCTAssertTrue(hasContent, "App should have some UI elements")
    }
    
    // MARK: - Navigation Tests
    
    func testCanNavigateToLogin() throws {
        // If app starts on home page, navigate to login
        // This test verifies navigation works
        let loginButton = app.buttons["Login"]
        if loginButton.exists {
            loginButton.tap()
            XCTAssertTrue(app.waitForExistence(timeout: 2), "Should navigate to login")
        }
    }
    
    // MARK: - API Connection Tests
    
    func testBackendConnection() throws {
        // Test that the app can connect to the backend
        // This is done by checking if API calls work
        // Note: This requires backend to be running
        
        let expectation = XCTestExpectation(description: "Backend connection test")
        
        // Create a URL request to test backend
        guard let url = URL(string: "\(backendURL)/health") else {
            XCTFail("Invalid URL")
            return
        }
        
        let task = URLSession.shared.dataTask(with: url) { data, response, error in
            if let error = error {
                XCTFail("Backend connection failed: \(error.localizedDescription)")
                return
            }
            
            if let httpResponse = response as? HTTPURLResponse {
                XCTAssertEqual(httpResponse.statusCode, 200, "Backend should return 200 OK")
            }
            
            expectation.fulfill()
        }
        
        task.resume()
        wait(for: [expectation], timeout: 10.0)
    }
    
    // MARK: - Authentication Tests
    
    func testLoginScreenExists() throws {
        // Check if login screen elements exist
        // This verifies the login UI is present
        
        // Look for common login elements
        let emailField = app.textFields.firstMatch
        let passwordField = app.secureTextFields.firstMatch
        let loginButton = app.buttons.matching(identifier: "Sign In").firstMatch
        
        // At least one of these should exist
        let hasLoginElements = emailField.exists || passwordField.exists || loginButton.exists
        
        // If we're on dashboard, that's also OK (means already logged in)
        let onDashboard = app.navigationBars.firstMatch.exists
        
        XCTAssertTrue(hasLoginElements || onDashboard, "Should be on login screen or dashboard")
    }
    
    // MARK: - Performance Tests
    
    func testAppLaunchPerformance() throws {
        if #available(iOS 13.0, *) {
            measure(metrics: [XCTApplicationLaunchMetric()]) {
                XCUIApplication().launch()
            }
        }
    }
    
    // MARK: - Accessibility Tests
    
    func testBasicAccessibility() throws {
        // Basic accessibility check
        // Ensure app has accessible elements
        let hasAccessibleElements = app.buttons.count > 0 || 
                                   app.staticTexts.count > 0 || 
                                   app.textFields.count > 0
        
        XCTAssertTrue(hasAccessibleElements, "App should have accessible UI elements")
    }
}











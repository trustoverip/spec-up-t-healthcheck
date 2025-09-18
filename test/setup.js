/**
 * @fileoverview Jest test setup configuration
 * 
 * This file configures Jest testing environment settings, global variables,
 * and common test utilities. It provides consistent testing behavior across
 * all test files and reduces boilerplate in individual test suites.
 * 
 * @author spec-up-t-healthcheck
 * @version 1.0.1-beta
 */

/**
 * Jest setup file for configuring global test environment settings.
 * 
 * This setup file is automatically loaded by Jest before running tests
 * and provides common configuration that applies to all test suites.
 */

/**
 * Increase timeout for integration tests that may involve filesystem operations
 * or other potentially slow operations. Default Jest timeout is 5000ms.
 */
jest.setTimeout(30000);

/**
 * Mock console methods in tests to reduce noise during test execution.
 * 
 * This preserves the original console functionality while preventing
 * test output from being cluttered with application log messages.
 * Individual tests can still access the original console methods if needed.
 */
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};
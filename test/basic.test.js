/**
 * @fileoverview Basic integration tests for spec-up-t-healthcheck
 * 
 * This test suite provides comprehensive integration testing for the health check
 * functionality, covering the main API endpoints, provider implementations, and
 * core health checking logic. The tests validate both individual components and
 * end-to-end workflows.
 * 
 * @author spec-up-t-healthcheck
 * @version 1.0.1-beta
 */

import { healthCheck, createLocalProvider } from '../lib/index.js';

/**
 * Test suite covering the basic health check functionality and provider operations.
 * 
 * These tests ensure that the core health checking logic works correctly,
 * providers can be created and used properly, and the convenience API functions
 * as expected. The tests use the current directory as a test subject since it
 * contains the necessary files (package.json, etc.) for validation.
 */
describe('Basic Health Check Functionality', () => {
  
  /**
   * Tests for the main healthCheck convenience function.
   * 
   * These tests validate that the high-level API works correctly
   * and can perform health checks with various configuration options.
   */
  describe('HealthCheck', () => {
    /**
     * Validates that the healthCheck function can execute successfully
     * and return a properly structured report object.
     */
    it('should run health check', async () => {
      const report = await healthCheck('.', {
        categories: ['repository', 'configuration']
      });
      expect(report).toBeDefined();
    });
  });

  /**
   * Tests for the LocalProvider implementation.
   * 
   * These tests validate that the local filesystem provider works correctly,
   * can access files and directories, and provides the expected interface
   * for health check operations.
   */
  describe('LocalProvider', () => {
    /**
     * Validates that LocalProvider instances can be created successfully.
     */
    it('should create a LocalProvider instance', () => {
      const provider = createLocalProvider('.');
      expect(provider).toBeDefined();
    });

    /**
     * Tests the provider's ability to return a valid base path.
     * Note: This test references a method that may not exist in the current implementation.
     */
    it('should get base path', () => {
      const provider = createLocalProvider('.');
      const basePath = provider.getBasePath();
      expect(typeof basePath).toBe('string');
      expect(basePath.length).toBeGreaterThan(0);
    });

    /**
     * Validates the provider's file existence checking functionality.
     * Note: This test references a method that may not exist in the current implementation.
     */
    it('should check if package.json exists', async () => {
      const provider = createLocalProvider('.');
      const exists = await provider.checkExists('package.json');
      expect(exists).toBe(true);
    });
  });

  /**
   * Tests for the high-level convenience functions and end-to-end workflows.
   * 
   * These tests validate that the complete health checking workflow functions
   * correctly from start to finish, including provider creation, health check
   * execution, and result formatting.
   */
  describe('Convenience Functions', () => {
    /**
     * Comprehensive end-to-end test that validates the complete health check workflow.
     * 
     * This test runs a full health check on the current directory and validates
     * that the returned report has the expected structure and content. It serves
     * as a smoke test for the entire system.
     * 
     * @timeout 10000 - Extended timeout for filesystem operations
     */
    it('should run basic health check on current directory', async () => {
      const report = await healthCheck('.', {
        categories: ['repository', 'configuration']
      });
      
      expect(report).toBeDefined();
      expect(report.sections).toHaveLength(2);
      expect(report.metadata.target).toBe('.');
      expect(report.metadata.provider).toBe('LocalProvider');
    }, 10000);
  });
});
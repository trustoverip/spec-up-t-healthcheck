/**
 * @fileoverview Jest testing framework configuration
 * 
 * This configuration file sets up Jest for testing the spec-up-t-healthcheck library.
 * It defines test discovery patterns, coverage collection rules, and environment settings
 * optimized for Node.js module testing with ES6 imports.
 * 
 * @author spec-up-t-healthcheck
 * @version 1.0.1-beta
 */

/**
 * Jest configuration object defining test execution and coverage settings.
 * 
 * This configuration optimizes Jest for a Node.js library with ES6 modules,
 * providing comprehensive test coverage and appropriate timeout settings
 * for filesystem operations and integration tests.
 * 
 * @type {import('jest').Config}
 */
export default {
  /** Set test environment to Node.js (no DOM APIs) */
  testEnvironment: 'node',
  
  /** Define root directories for test discovery */
  roots: ['<rootDir>/lib', '<rootDir>/test'],
  
  /** Test file matching patterns */
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  
  /** Coverage collection configuration */
  collectCoverageFrom: [
    'lib/**/*.js',
    '!lib/**/*.test.js',
    '!lib/**/*.spec.js'
  ],
  
  /** Coverage output directory */
  coverageDirectory: 'coverage',
  
  /** Coverage report formats */
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],
  
  /** Test setup file for global configuration */
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  
  /** Extended timeout for filesystem operations */
  testTimeout: 30000
};
/**
 * @fileoverview Main entry point for spec-up-t-healthcheck
 * 
 * This module serves as the primary API for the spec-up-t-healthcheck library,
 * providing convenient access to all core functionality including health checking,
 * result formatting, and provider management. It offers both individual component
 * access and a simplified high-level API.
 * 
 * @author spec-up-t-healthcheck
 * @version 1.0.1-beta
 */

// Re-export provider functionality
export { createProvider, createLocalProvider } from './providers.js';

// Re-export health checking functionality
export { runHealthChecks, createHealthCheckResult, checkPackageJson, checkSpecFiles } from './health-checker.js';

// Re-export formatting functionality
export { formatResultsAsText, formatResultsAsJson } from './formatters.js';

/**
 * Simplified high-level API for performing health checks on a specification repository.
 * 
 * This convenience function combines provider creation and health checking into a single
 * call, making it easy to perform health checks without managing providers manually.
 * It automatically determines the appropriate provider type based on the input.
 * 
 * @param {string} input - The path or URL to the specification repository
 * @param {Object} [options={}] - Configuration options for the health check
 * @param {string[]} [options.checks] - Specific checks to run (defaults to all available)
 * @param {Object} [options.providerOptions] - Options to pass to the provider
 * @returns {Promise<import('./health-checker.js').HealthCheckReport>} Complete health check report
 * 
 * @example
 * ```javascript
 * // Check a local repository
 * const report = await healthCheck('/path/to/spec-repo');
 * 
 * // Check with specific options
 * const customReport = await healthCheck('/path/to/spec-repo', {
 *   checks: ['package-json', 'spec-files']
 * });
 * 
 * // Display results
 * console.log(`Health score: ${report.summary.score}%`);
 * if (report.summary.hasErrors) {
 *   console.error('Some health checks failed');
 * }
 * ```
 * 
 * @since 1.0.0
 */
export async function healthCheck(input, options = {}) {
  const { createProvider } = await import('./providers.js');
  const { runHealthChecks } = await import('./health-checker.js');
  
  const provider = createProvider(input, options.providerOptions);
  return await runHealthChecks(provider, options);
}

/**
 * The current version of the spec-up-t-healthcheck library.
 * @type {string}
 * @readonly
 */
export const version = '1.0.0';

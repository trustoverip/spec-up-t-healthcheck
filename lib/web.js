/**
 * @fileoverview Browser-compatible entry point for spec-up-t-healthcheck
 * 
 * This module provides a browser-safe API that excludes Node.js-specific modules
 * like file-opener which depend on child_process. This allows the health check
 * functionality to work in browser environments like Vite.
 * 
 * @author spec-up-t-healthcheck
 */

// Re-export provider functionality (browser-compatible)
export { createProvider } from './providers.js';

// Re-export health checking functionality (browser-compatible)
export { 
  runHealthChecks, 
  createHealthCheckResult, 
  checkPackageJson, 
  checkSpecFiles, 
  checkSpecsJson 
} from './health-checker.js';

// Re-export formatting functionality (browser-compatible)
export { 
  formatResultsAsText, 
  formatResultsAsJson, 
  formatResultsAsHtml 
} from './formatters.js';

// Import functions for internal use
import { createProvider } from './providers.js';
import { runHealthChecks } from './health-checker.js';

/**
 * Simplified API for browser environments
 * 
 * This function provides the same functionality as the main package
 * but excludes file opening capabilities that require Node.js
 * 
 * @param {Object} provider - File system provider (must be provided)
 * @param {Object} [options={}] - Health check options
 * @returns {Promise<Object>} Health check results
 * 
 * @example
 * ```javascript
 * import { runHealthCheck } from 'spec-up-t-healthcheck/web';
 * 
 * const provider = createGitHubProvider(token, owner, repo);
 * const results = await runHealthCheck(provider);
 * ```
 */
export async function runHealthCheck(provider, options = {}) {
  if (!provider) {
    throw new Error('Provider is required for browser environments');
  }
  
  return await runHealthChecks(provider, options);
}

/**
 * Browser-compatible health check API
 * Excludes file opening functionality for browser safety
 */
export const browserApi = {
  runHealthCheck,
  createProvider,
  runHealthChecks
};

export default browserApi;
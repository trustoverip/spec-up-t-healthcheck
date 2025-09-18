/**
 * @fileoverview Health checker module for spec-up-t-healthcheck
 * 
 * This module provides a unified interface for health checking functionality while
 * maintaining backward compatibility. It acts as a facade for the modular health
 * check system, allowing existing code to continue working while providing access
 * to the new modular architecture.
 * 
 * @author spec-up-t-healthcheck
 */

// Import the modular components
import { 
  createHealthCheckResult as utilsCreateHealthCheckResult,
  calculateSummary,
  isValidHealthCheckResult,
  createErrorResult,
  HEALTH_CHECK_STATUSES
} from './health-check-utils.js';

import { 
  globalRegistry,
  HealthCheckRegistry,
  registerHealthCheck,
  getHealthCheck,
  autoDiscoverHealthChecks
} from './health-check-registry.js';

import { 
  HealthCheckOrchestrator,
  globalOrchestrator,
  runHealthChecks as orchestratorRunHealthChecks
} from './health-check-orchestrator.js';

// Import individual check modules for backward compatibility
import checkPackageJsonModule from './checks/package-json.js';
import checkSpecFilesModule from './checks/spec-files.js';

// Re-export types for backward compatibility
/**
 * @typedef {import('./health-check-utils.js').HealthCheckResult} HealthCheckResult
 */

/**
 * @typedef {import('./health-check-utils.js').HealthCheckSummary} HealthCheckSummary
 */

/**
 * @typedef {import('./health-check-utils.js').HealthCheckReport} HealthCheckReport
 */

/**
 * Creates a standardized health check result object.
 * 
 * This is a backward-compatible wrapper around the modular utility function.
 * It ensures that existing code continues to work with the new modular architecture.
 * 
 * @param {string} check - The identifier/name of the health check being performed
 * @param {'pass'|'fail'|'warn'|'skip'} status - The status of the health check
 * @param {string} message - A human-readable message describing the result
 * @param {Object} [details={}] - Optional additional details about the check
 * @returns {HealthCheckResult} A standardized health check result object
 * 
 * @example
 * ```javascript
 * const result = createHealthCheckResult(
 *   'package-json',
 *   'pass',
 *   'package.json is valid',
 *   { packageData: { name: 'my-spec', version: '1.0.0' } }
 * );
 * ```
 */
export function createHealthCheckResult(check, status, message, details = {}) {
  return utilsCreateHealthCheckResult(check, status, message, details);
}

/**
 * Validates the existence and structure of package.json in a repository.
 * 
 * This is a backward-compatible wrapper around the modular package.json check.
 * It maintains the original API while using the new modular implementation.
 * 
 * @param {import('./providers.js').Provider} provider - The provider instance for file operations
 * @returns {Promise<HealthCheckResult>} The health check result with validation details
 * 
 * @example
 * ```javascript
 * const provider = createLocalProvider('/path/to/repo');
 * const result = await checkPackageJson(provider);
 * console.log(result.status); // 'pass' or 'fail'
 * ```
 */
export async function checkPackageJson(provider) {
  return await checkPackageJsonModule(provider);
}

/**
 * Checks for the presence and accessibility of specification files in the repository.
 * 
 * This is a backward-compatible wrapper around the modular spec files check.
 * It maintains the original API while using the new modular implementation.
 * 
 * @param {import('./providers.js').Provider} provider - The provider instance for file operations
 * @returns {Promise<HealthCheckResult>} The health check result with file discovery details
 * 
 * @example
 * ```javascript
 * const provider = createLocalProvider('/path/to/repo');
 * const result = await checkSpecFiles(provider);
 * console.log(result.details.specFiles); // Array of found specification files
 * ```
 */
export async function checkSpecFiles(provider) {
  return await checkSpecFilesModule(provider);
}

/**
 * Runs a comprehensive health check suite on a specification repository.
 * 
 * This is the main entry point for performing health checks, now using the
 * modular orchestrator while maintaining backward compatibility. It supports
 * the original API while providing access to new features through options.
 * 
 * @param {import('./providers.js').Provider} provider - The provider instance for repository access
 * @param {Object} [options={}] - Configuration options for the health check run
 * @param {string[]} [options.checks=['package-json', 'spec-files']] - Array of check names to run
 * @param {boolean} [options.continueOnError=true] - Whether to continue on failures
 * @param {number} [options.timeout=30000] - Timeout for individual checks
 * @param {boolean} [options.parallel=false] - Whether to run checks in parallel
 * @returns {Promise<HealthCheckReport>} Complete health check report with results and summary
 * 
 * @example
 * ```javascript
 * const provider = createLocalProvider('/path/to/repo');
 * 
 * // Run all default checks (backward compatible)
 * const report = await runHealthChecks(provider);
 * 
 * // Run specific checks only
 * const customReport = await runHealthChecks(provider, {
 *   checks: ['package-json']
 * });
 * 
 * // Use new modular features
 * const advancedReport = await runHealthChecks(provider, {
 *   parallel: true,
 *   timeout: 10000,
 *   categories: ['configuration']
 * });
 * 
 * console.log(`Health score: ${report.summary.score}%`);
 * console.log(`${report.summary.passed}/${report.summary.total} checks passed`);
 * ```
 */
export async function runHealthChecks(provider, options = {}) {
  // Provide backward compatibility by defaulting to the original checks
  const mergedOptions = {
    checks: ['package-json', 'spec-files'],
    ...options
  };
  
  return await orchestratorRunHealthChecks(provider, mergedOptions);
}

// Re-export modular components for advanced usage
export {
  // Utils
  calculateSummary,
  isValidHealthCheckResult,
  createErrorResult,
  HEALTH_CHECK_STATUSES,
  
  // Registry
  HealthCheckRegistry,
  globalRegistry,
  registerHealthCheck,
  getHealthCheck,
  autoDiscoverHealthChecks,
  
  // Orchestrator
  HealthCheckOrchestrator,
  globalOrchestrator,
  
  // Individual checks (for advanced usage)
  checkPackageJsonModule as checkPackageJsonAdvanced,
  checkSpecFilesModule as checkSpecFilesAdvanced
};

// Export default function for convenience
export default runHealthChecks;

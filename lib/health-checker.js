/**
 * @fileoverview Health checker module for spec-up-t-healthcheck
 * 
 * This module provides comprehensive health checking functionality for specification repositories.
 * It validates package.json files, checks for specification files, and provides a unified
 * interface for running multiple health checks with detailed reporting.
 * 
 * @author spec-up-t-healthcheck
 
 */

/**
 * @typedef {Object} HealthCheckResult
 * @property {string} check - The name/identifier of the health check
 * @property {'pass'|'fail'|'warn'|'skip'} status - The result status
 * @property {string} message - Human-readable result message
 * @property {string} timestamp - ISO timestamp when the check was performed
 * @property {Object} [details={}] - Additional details about the check result
 */

/**
 * @typedef {Object} HealthCheckSummary
 * @property {number} total - Total number of checks performed
 * @property {number} passed - Number of checks that passed
 * @property {number} failed - Number of checks that failed
 * @property {number} warnings - Number of checks with warnings
 * @property {number} skipped - Number of checks that were skipped
 * @property {number} score - Overall health score as a percentage (0-100)
 * @property {boolean} hasErrors - Whether any checks failed
 * @property {boolean} hasWarnings - Whether any checks had warnings
 */

/**
 * @typedef {Object} HealthCheckReport
 * @property {HealthCheckResult[]} results - Array of individual check results
 * @property {HealthCheckSummary} summary - Aggregated summary of all check results
 * @property {string} timestamp - ISO timestamp when the report was generated
 * @property {Object} provider - Information about the provider used for checks
 * @property {string} provider.type - The type of provider ('local', 'remote', etc.)
 * @property {string} [provider.repoPath] - The repository path (for local providers)
 */

/**
 * Creates a standardized health check result object.
 * 
 * This utility function ensures consistent structure across all health check results,
 * automatically adding timestamps and providing a standard format for reporting.
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
  return {
    check,
    status,
    message,
    timestamp: new Date().toISOString(),
    details
  };
}

/**
 * Validates the existence and structure of package.json in a repository.
 * 
 * This health check ensures that a valid package.json file exists at the repository root
 * and contains the required fields for a proper Node.js package. It checks for the
 * presence of essential metadata and validates JSON structure.
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
  const check = 'package-json';
  
  try {
    const exists = await provider.fileExists('package.json');
    if (!exists) {
      return createHealthCheckResult(check, 'fail', 'package.json not found');
    }

    const content = await provider.readFile('package.json');
    const packageData = JSON.parse(content);

    const requiredFields = ['name', 'version'];
    const missingFields = requiredFields.filter(field => !packageData[field]);
    
    if (missingFields.length > 0) {
      return createHealthCheckResult(
        check, 
        'fail', 
        `Missing required fields: ${missingFields.join(', ')}`,
        { missingFields }
      );
    }

    return createHealthCheckResult(
      check, 
      'pass', 
      'package.json is valid',
      { packageData: { name: packageData.name, version: packageData.version } }
    );

  } catch (error) {
    return createHealthCheckResult(
      check, 
      'fail', 
      `Error checking package.json: ${error.message}`,
      { error: error.message }
    );
  }
}

/**
 * Checks for the presence and accessibility of specification files in the repository.
 * 
 * This health check searches for markdown files in common specification directories
 * (spec/, specs/, docs/, documentation/) as well as the repository root. It validates
 * that specification content is available and properly organized.
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
  const check = 'spec-files';
  
  try {
    const specPaths = ['spec/', 'specs/', 'docs/', 'documentation/'];
    const markdownExtensions = ['.md', '.markdown'];
    
    let specFiles = [];
    let specDirectory = null;

    // Check spec directories
    for (const dir of specPaths) {
      try {
        const files = await provider.listFiles(dir);
        if (files.length > 0) {
          specDirectory = dir;
          specFiles = files.filter(f => 
            f.isFile && markdownExtensions.some(ext => f.name.endsWith(ext))
          );
          break;
        }
      } catch {
        // Directory doesn't exist, continue
      }
    }

    // Also check root for markdown files
    try {
      const rootFiles = await provider.listFiles('');
      const rootMarkdown = rootFiles.filter(f => 
        f.isFile && markdownExtensions.some(ext => f.name.endsWith(ext))
      );
      specFiles = [...specFiles, ...rootMarkdown];
    } catch {
      // Error listing root, continue
    }

    if (specFiles.length === 0) {
      return createHealthCheckResult(
        check, 
        'fail', 
        'No specification files found',
        { searchedPaths: specPaths }
      );
    }

    return createHealthCheckResult(
      check, 
      'pass', 
      `Found ${specFiles.length} specification files`,
      { 
        specFiles: specFiles.map(f => f.name), 
        specDirectory,
        count: specFiles.length 
      }
    );

  } catch (error) {
    return createHealthCheckResult(
      check, 
      'fail', 
      `Error checking specification files: ${error.message}`,
      { error: error.message }
    );
  }
}

/**
 * Runs a comprehensive health check suite on a specification repository.
 * 
 * This is the main entry point for performing health checks. It orchestrates multiple
 * individual checks, aggregates results, and provides detailed reporting with summary
 * statistics. The function supports configurable check selection and provides comprehensive
 * error handling.
 * 
 * @param {import('./providers.js').Provider} provider - The provider instance for repository access
 * @param {Object} [options={}] - Configuration options for the health check run
 * @param {string[]} [options.checks=['package-json', 'spec-files']] - Array of check names to run
 * @returns {Promise<HealthCheckReport>} Complete health check report with results and summary
 * 
 * @example
 * ```javascript
 * const provider = createLocalProvider('/path/to/repo');
 * 
 * // Run all default checks
 * const report = await runHealthChecks(provider);
 * 
 * // Run specific checks only
 * const customReport = await runHealthChecks(provider, {
 *   checks: ['package-json']
 * });
 * 
 * console.log(`Health score: ${report.summary.score}%`);
 * console.log(`${report.summary.passed}/${report.summary.total} checks passed`);
 * ```
 */
export async function runHealthChecks(provider, options = {}) {
  const { checks = ['package-json', 'spec-files'] } = options;
  
  const availableChecks = {
    'package-json': checkPackageJson,
    'spec-files': checkSpecFiles
  };

  const results = [];

  for (const check of checks) {
    if (availableChecks[check]) {
      const result = await availableChecks[check](provider);
      results.push(result);
    } else {
      console.warn(`Unknown health check: ${check}`);
    }
  }

  const summary = {
    total: results.length,
    passed: results.filter(r => r.status === 'pass').length,
    failed: results.filter(r => r.status === 'fail').length,
    warnings: results.filter(r => r.status === 'warn').length,
    skipped: results.filter(r => r.status === 'skip').length
  };

  summary.score = summary.total > 0 ? (summary.passed / summary.total) * 100 : 0;
  summary.hasErrors = summary.failed > 0;
  summary.hasWarnings = summary.warnings > 0;

  return {
    results,
    summary,
    timestamp: new Date().toISOString(),
    provider: {
      type: provider.type,
      ...(provider.repoPath && { repoPath: provider.repoPath })
    }
  };
}

/**
 * @fileoverview Specs.json health check module
 *
 * This module validates the existence and structure of specs.json files in
 * specification repositories. It ensures that essential spec metadata is
 * present and properly formatted.
 *
 * @author spec-up-t-healthcheck
 */

import { createHealthCheckResult, createErrorResult } from '../health-check-utils.js';

/**
 * The identifier for this health check, used in reports and registries.
 * @type {string}
 */
export const CHECK_ID = 'specs-json';

/**
 * Human-readable name for this health check.
 * @type {string}
 */
export const CHECK_NAME = 'Specs.json Validation';

/**
 * Description of what this health check validates.
 * @type {string}
 */
export const CHECK_DESCRIPTION = 'Validates the existence and structure of specs.json file';

/**
 * Required fields that must be present in a valid specs.json file.
 * These fields are essential for proper spec identification.
 * @type {readonly string[]}
 */
const REQUIRED_FIELDS = Object.freeze(['title', 'version']);

/**
 * Validates the existence and structure of specs.json in a repository.
 *
 * This health check ensures that a valid specs.json file exists at the repository root
 * and contains the required fields for a proper spec. It checks for the
 * presence of essential metadata and validates JSON structure.
 *
 * The check performs the following validations:
 * - File exists at repository root
 * - File contains valid JSON
 * - Required fields (title, version) are present
 *
 * @param {import('../providers.js').Provider} provider - The provider instance for file operations
 * @returns {Promise<import('../health-check-utils.js').HealthCheckResult>} The health check result with validation details
 *
 * @example
 * ```javascript
 * const provider = createLocalProvider('/path/to/repo');
 * const result = await checkSpecsJson(provider);
 * console.log(result.status); // 'pass', 'fail', or 'warn'
 * ```
 */
export async function checkSpecsJson(provider) {
  try {
    // Check if specs.json exists
    const exists = await provider.fileExists('specs.json');
    if (!exists) {
      return createHealthCheckResult(
        CHECK_ID,
        'fail',
        'specs.json not found in repository root'
      );
    }

    // Read and parse the specs.json file
    const content = await provider.readFile('specs.json');
    let specsData;

    try {
      specsData = JSON.parse(content);
    } catch (parseError) {
      return createHealthCheckResult(
        CHECK_ID,
        'fail',
        'specs.json contains invalid JSON',
        {
          parseError: parseError.message,
          fileContent: content.substring(0, 500) + (content.length > 500 ? '...' : '')
        }
      );
    }

    // Validate required fields
    const missingRequired = REQUIRED_FIELDS.filter(field =>
      !specsData[field] || (typeof specsData[field] === 'string' && specsData[field].trim() === '')
    );

    if (missingRequired.length > 0) {
      return createHealthCheckResult(
        CHECK_ID,
        'fail',
        `specs.json is missing required fields: ${missingRequired.join(', ')}`,
        { missingFields: missingRequired }
      );
    }

    // If all validations pass
    return createHealthCheckResult(
      CHECK_ID,
      'pass',
      'specs.json is valid and contains all required fields'
    );

  } catch (error) {
    return createErrorResult(CHECK_ID, error);
  }
}

// Export as default for backward compatibility
export default {
  CHECK_ID,
  CHECK_NAME,
  CHECK_DESCRIPTION,
  checkSpecsJson
};

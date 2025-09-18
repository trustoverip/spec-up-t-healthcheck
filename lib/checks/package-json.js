/**
 * @fileoverview Package.json health check module
 * 
 * This module validates the existence and structure of package.json files in
 * specification repositories. It ensures that essential package metadata is
 * present and properly formatted for Node.js compatibility.
 * 
 * @author spec-up-t-healthcheck
 */

import { createHealthCheckResult, createErrorResult } from '../health-check-utils.js';

/**
 * The identifier for this health check, used in reports and registries.
 * @type {string}
 */
export const CHECK_ID = 'package-json';

/**
 * Human-readable name for this health check.
 * @type {string}
 */
export const CHECK_NAME = 'Package.json Validation';

/**
 * Description of what this health check validates.
 * @type {string}
 */
export const CHECK_DESCRIPTION = 'Validates the existence and structure of package.json file';

/**
 * Required fields that must be present in a valid package.json file.
 * These fields are essential for proper Node.js package identification.
 * @type {readonly string[]}
 */
const REQUIRED_FIELDS = Object.freeze(['name', 'version']);

/**
 * Recommended fields that should be present in a well-formed package.json.
 * Missing these fields will generate warnings rather than failures.
 * @type {readonly string[]}
 */
const RECOMMENDED_FIELDS = Object.freeze(['description', 'author', 'license']);

/**
 * Validates the existence and structure of package.json in a repository.
 * 
 * This health check ensures that a valid package.json file exists at the repository root
 * and contains the required fields for a proper Node.js package. It checks for the
 * presence of essential metadata and validates JSON structure.
 * 
 * The check performs the following validations:
 * - File exists at repository root
 * - File contains valid JSON
 * - Required fields (name, version) are present
 * - Recommended fields are present (warnings if missing)
 * 
 * @param {import('../providers.js').Provider} provider - The provider instance for file operations
 * @returns {Promise<import('../health-check-utils.js').HealthCheckResult>} The health check result with validation details
 * 
 * @example
 * ```javascript
 * const provider = createLocalProvider('/path/to/repo');
 * const result = await checkPackageJson(provider);
 * console.log(result.status); // 'pass', 'fail', or 'warn'
 * ```
 */
export async function checkPackageJson(provider) {
  try {
    // Check if package.json exists
    const exists = await provider.fileExists('package.json');
    if (!exists) {
      return createHealthCheckResult(
        CHECK_ID, 
        'fail', 
        'package.json not found in repository root'
      );
    }

    // Read and parse the package.json file
    const content = await provider.readFile('package.json');
    let packageData;
    
    try {
      packageData = JSON.parse(content);
    } catch (parseError) {
      return createHealthCheckResult(
        CHECK_ID,
        'fail',
        'package.json contains invalid JSON',
        { 
          parseError: parseError.message,
          fileContent: content.substring(0, 500) + (content.length > 500 ? '...' : '')
        }
      );
    }

    // Validate required fields
    const missingRequired = REQUIRED_FIELDS.filter(field => 
      !packageData[field] || (typeof packageData[field] === 'string' && packageData[field].trim() === '')
    );
    
    if (missingRequired.length > 0) {
      return createHealthCheckResult(
        CHECK_ID, 
        'fail', 
        `Missing required fields: ${missingRequired.join(', ')}`,
        { 
          missingRequired,
          presentFields: Object.keys(packageData),
          packageSample: extractPackageSample(packageData)
        }
      );
    }

    // Check for recommended fields (warnings)
    const missingRecommended = RECOMMENDED_FIELDS.filter(field => 
      !packageData[field] || (typeof packageData[field] === 'string' && packageData[field].trim() === '')
    );

    const details = {
      packageSample: extractPackageSample(packageData),
      hasAllRequired: true,
      missingRecommended,
      fieldCount: Object.keys(packageData).length
    };

    // Return warning if missing recommended fields, otherwise pass
    if (missingRecommended.length > 0) {
      return createHealthCheckResult(
        CHECK_ID,
        'warn',
        `package.json is valid but missing recommended fields: ${missingRecommended.join(', ')}`,
        details
      );
    }

    return createHealthCheckResult(
      CHECK_ID, 
      'pass', 
      'package.json is valid and well-formed',
      details
    );

  } catch (error) {
    return createErrorResult(CHECK_ID, error, {
      context: 'checking package.json file',
      provider: provider.type
    });
  }
}

/**
 * Extracts a safe sample of package.json data for reporting purposes.
 * 
 * This function creates a sanitized version of package data that can be safely
 * included in health check results without exposing sensitive information.
 * 
 * @param {Object} packageData - The parsed package.json data
 * @returns {Object} A sanitized sample of the package data
 * @private
 */
function extractPackageSample(packageData) {
  const safeFields = ['name', 'version', 'description', 'author', 'license'];
  const sample = {};
  
  for (const field of safeFields) {
    if (packageData[field]) {
      sample[field] = packageData[field];
    }
  }
  
  return sample;
}

// Export the health check function as default for easy registration
export default checkPackageJson;
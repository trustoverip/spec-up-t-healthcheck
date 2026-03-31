/**
 * @fileoverview Heading hierarchy validation health check module
 * 
 * This module validates that markdown headings follow a proper hierarchy
 * without skipping levels, as required by W3C accessibility guidelines.
 * For example, an h5 must not directly follow an h3 without an h4 in between.
 * 
 * This check works on markdown source files so it can run in both
 * Node.js and browser environments.
 * 
 * @author spec-up-t-healthcheck
 */

import { createHealthCheckResult, createErrorResult } from '../health-check-utils.js';

/**
 * The identifier for this health check, used in reports and registries.
 * @type {string}
 */
export const CHECK_ID = 'heading-hierarchy';

/**
 * Human-readable name for this health check.
 * @type {string}
 */
export const CHECK_NAME = 'Heading Hierarchy Validation';

/**
 * Description of what this health check validates.
 * @type {string}
 */
export const CHECK_DESCRIPTION = 'Validates that heading levels do not skip levels (W3C accessibility)';

/**
 * Regex to match markdown headings at the start of a line.
 * Captures the hash characters and the heading text.
 * @type {RegExp}
 */
const HEADING_REGEX = /^(#{1,6})\s+(.+)$/;

/**
 * Extracts headings from markdown content.
 * 
 * Parses each line for ATX-style headings (# through ######),
 * skipping lines inside fenced code blocks.
 * 
 * @param {string} content - The markdown content to parse
 * @param {string} filePath - Path to the file (for reporting)
 * @returns {Array<{level: number, text: string, line: number, file: string}>} Array of heading info
 */
function extractHeadings(content, filePath) {
  const lines = content.split('\n');
  const headings = [];
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    // Track fenced code blocks so we don't match headings inside them
    if (trimmed.startsWith('```') || trimmed.startsWith('~~~')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const match = trimmed.match(HEADING_REGEX);
    if (match) {
      headings.push({
        level: match[1].length,
        text: match[2].trim(),
        line: i + 1,
        file: filePath
      });
    }
  }

  return headings;
}

/**
 * Finds heading hierarchy violations in a list of headings.
 * 
 * A violation occurs when a heading level jumps down by more than one
 * from the previous heading. For example, going from h2 to h4 skips h3.
 * 
 * @param {Array<{level: number, text: string, line: number, file: string}>} headings - Headings to check
 * @returns {Array<{current: Object, previous: Object, skipped: number}>} Array of violations
 */
function findViolations(headings) {
  const violations = [];

  for (let i = 1; i < headings.length; i++) {
    const prev = headings[i - 1];
    const curr = headings[i];

    // Only flag when going deeper by more than one level
    // Going up (e.g. h4 back to h2) is always valid
    if (curr.level > prev.level + 1) {
      violations.push({
        current: curr,
        previous: prev,
        skipped: curr.level - prev.level - 1
      });
    }
  }

  return violations;
}

/**
 * Validates heading hierarchy in specification markdown files.
 * 
 * This health check discovers markdown files in the repository, extracts
 * all ATX-style headings, and validates that heading levels never skip
 * levels when going deeper. Skipping heading levels violates W3C
 * accessibility guidelines and causes validation warnings.
 * 
 * @param {import('../providers.js').Provider} provider - The provider instance for file operations
 * @returns {Promise<import('../health-check-utils.js').HealthCheckResult>} The health check result
 * 
 * @example
 * ```javascript
 * const provider = createLocalProvider('/path/to/repo');
 * const result = await checkHeadingHierarchy(provider);
 * console.log(result.status); // 'pass' or 'warn'
 * ```
 */
export async function checkHeadingHierarchy(provider) {
  try {
    const specFiles = await discoverSpecificationFiles(provider);

    if (specFiles.length === 0) {
      return createHealthCheckResult(
        CHECK_ID,
        'warn',
        'No specification files found to validate heading hierarchy',
        { filesChecked: 0, totalHeadings: 0, violations: [] }
      );
    }

    let totalHeadings = 0;
    const allViolations = [];

    for (const filePath of specFiles) {
      try {
        const content = await provider.readFile(filePath);
        const headings = extractHeadings(content, filePath);
        totalHeadings += headings.length;

        const violations = findViolations(headings);
        allViolations.push(...violations);
      } catch (error) {
        // File could not be read — skip it
      }
    }

    if (allViolations.length === 0) {
      return createHealthCheckResult(
        CHECK_ID,
        'pass',
        `All ${totalHeadings} headings follow a valid hierarchy`,
        { filesChecked: specFiles.length, totalHeadings, violations: [] }
      );
    }

    const violationDetails = allViolations.map(v => ({
      file: v.current.file,
      line: v.current.line,
      message: `h${v.current.level} "${v.current.text}" follows h${v.previous.level} "${v.previous.text}", skipping ${v.skipped} heading level${v.skipped > 1 ? 's' : ''}`,
      currentLevel: v.current.level,
      previousLevel: v.previous.level,
      skippedLevels: v.skipped
    }));

    return createHealthCheckResult(
      CHECK_ID,
      'warn',
      `Found ${allViolations.length} heading hierarchy violation${allViolations.length > 1 ? 's' : ''} (W3C accessibility)`,
      {
        filesChecked: specFiles.length,
        totalHeadings,
        violations: violationDetails
      }
    );

  } catch (error) {
    return createErrorResult(
      CHECK_ID,
      `Failed to validate heading hierarchy: ${error.message}`,
      { error: error.message, stack: error.stack }
    );
  }
}

/**
 * Discovers specification files to check for heading hierarchy.
 * 
 * Searches for markdown files in common spec directories
 * and the repository root.
 * 
 * @param {import('../providers.js').Provider} provider - The provider instance
 * @returns {Promise<string[]>} Array of file paths to check
 * @private
 */
async function discoverSpecificationFiles(provider) {
  const files = [];
  const searchPaths = ['spec/', 'specs/', 'docs/', ''];

  for (const searchPath of searchPaths) {
    try {
      const entries = await provider.listFiles(searchPath);

      const mdFiles = entries.filter(entry =>
        entry.isFile &&
        (entry.name.endsWith('.md') || entry.name.endsWith('.markdown'))
      );

      files.push(...mdFiles.map(entry => entry.path));
    } catch (error) {
      // Directory doesn't exist or can't be read — continue
    }
  }

  return [...new Set(files)];
}

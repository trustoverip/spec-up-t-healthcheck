/**
 * @fileoverview Shared result details formatter for health check results
 * 
 * This module provides functions to format health check result details into HTML.
 * It works in both Node.js and browser environments, enabling consistent display
 * of health check results in CLI tools, HTML reports, and web applications.
 * 
 * The module formats:
 * - Errors array with red styling
 * - Warnings array with yellow/orange styling
 * - Success messages array with green styling
 * - Additional metadata (missingFields, count, packageData)
 * 
 * URLs in messages are automatically converted to clickable links.
 * 
 * @author spec-up-t-healthcheck
 */

/**
 * Escapes HTML special characters to prevent XSS attacks.
 * This is critical for security when displaying user-generated content.
 * 
 * @param {string|any} text - Text to escape
 * @returns {string} HTML-escaped text
 * 
 * @example
 * ```javascript
 * escapeHtml('<script>alert("xss")</script>');
 * // Returns: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
 * ```
 */
export function escapeHtml(text) {
  if (typeof text !== 'string') {
    return String(text);
  }
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Converts URLs in text to clickable links that open in a new tab.
 * The text is first escaped for HTML safety, then URLs are converted to links.
 * 
 * This function enhances user experience by making URLs in error messages,
 * warnings, and other feedback immediately actionable.
 * 
 * @param {string} text - Text potentially containing URLs
 * @returns {string} HTML string with clickable links
 * 
 * @example
 * ```javascript
 * linkifyUrls('Check https://example.com for details');
 * // Returns: 'Check <a href="https://example.com" target="_blank" rel="noopener noreferrer">https://example.com</a> for details'
 * ```
 */
export function linkifyUrls(text) {
  if (typeof text !== 'string') {
    return escapeHtml(String(text));
  }
  
  // First escape the text for HTML safety
  const escaped = escapeHtml(text);
  
  // URL regex pattern that matches http://, https://, and www. URLs
  const urlPattern = /(https?:\/\/[^\s<>"]+|www\.[^\s<>"]+)/g;
  
  // Replace URLs with clickable links
  return escaped.replace(urlPattern, (url) => {
    // Ensure the URL has a protocol for the href attribute
    const href = url.startsWith('http') ? url : `https://${url}`;
    
    // Create an anchor tag that opens in a new tab with security attributes
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-decoration-underline">${url}</a>`;
  });
}

/**
 * Formats result details into HTML.
 * 
 * This is the main formatter function that converts a health check result's
 * details object into a formatted HTML string. It handles:
 * - Errors: Displayed in red with bullet points
 * - Warnings: Displayed in yellow/orange with bullet points
 * - Success: Displayed in green with bullet points (can be hidden for brevity)
 * - Metadata: Missing fields, counts, package data
 * 
 * All URLs in messages are automatically converted to clickable links.
 * 
 * @param {Object} details - The details object from a health check result
 * @param {string[]} [details.errors] - Array of error messages
 * @param {string[]} [details.warnings] - Array of warning messages
 * @param {string[]} [details.success] - Array of success messages
 * @param {string[]} [details.missingFields] - Array of missing field names
 * @param {number} [details.count] - Count of items found
 * @param {Object} [details.packageData] - Package metadata
 * @param {string} [details.packageData.name] - Package name
 * @param {string} [details.packageData.version] - Package version
 * @returns {string} Formatted HTML string
 * 
 * @example
 * ```javascript
 * const details = {
 *   errors: ['Field "title" is missing'],
 *   warnings: ['Field "favicon" is recommended'],
 *   success: ['Field "author" exists']
 * };
 * const html = formatResultDetails(details);
 * // Returns formatted HTML with error, warning, and success lists
 * ```
 */
export function formatResultDetails(details) {
  let html = '';
  
  // Display errors array with clickable URLs
  // Errors are shown with strong red styling to draw immediate attention
  if (details.errors && details.errors.length > 0) {
    html += `<div class="mt-2 detail-errors"><strong class="text-danger">Errors:</strong><ul class="mb-0 mt-1">`;
    details.errors.forEach(error => {
      html += `<li class="text-danger">${linkifyUrls(error)}</li>`;
    });
    html += `</ul></div>`;
  }
  
  // Display warnings array with clickable URLs
  // Warnings indicate potential issues that should be addressed but aren't critical
  if (details.warnings && details.warnings.length > 0) {
    html += `<div class="mt-2 detail-warnings"><strong class="text-warning">Warnings:</strong><ul class="mb-0 mt-1">`;
    details.warnings.forEach(warning => {
      html += `<li class="text-warning">${linkifyUrls(warning)}</li>`;
    });
    html += `</ul></div>`;
  }
  
  // Display success messages array with clickable URLs
  // Add detail-success class so these can be hidden when "Show passing checks" is disabled
  // This helps users focus on issues while still providing complete information when needed
  if (details.success && details.success.length > 0) {
    html += `<div class="mt-2 detail-success"><strong class="text-success">Success:</strong><ul class="mb-0 mt-1">`;
    details.success.forEach(success => {
      html += `<li class="text-success">${linkifyUrls(success)}</li>`;
    });
    html += `</ul></div>`;
  }
  
  // Display missing fields (existing functionality for backward compatibility)
  // Provides a quick summary of what's missing in validation results
  if (details.missingFields && details.missingFields.length > 0) {
    html += `<br><small class="text-muted">Missing fields: ${details.missingFields.map(escapeHtml).join(', ')}</small>`;
  }
  
  // Display count (existing functionality)
  // Shows the number of items found in checks that count resources
  if (details.count !== undefined) {
    html += `<br><small class="text-muted">Files found: ${details.count}</small>`;
  }
  
  // Display package data (existing functionality)
  // Shows package name and version for package.json validation
  if (details.packageData) {
    html += `<br><small class="text-muted">Package: ${escapeHtml(details.packageData.name)}@${escapeHtml(details.packageData.version)}</small>`;
  }
  
  return html;
}

/**
 * Formats a single health check result into a table row HTML string.
 * 
 * This function is useful for building tables of health check results.
 * It includes status badges, check names, messages, and formatted details.
 * 
 * @param {Object} result - A health check result object
 * @param {string} result.status - Status of the check ('pass', 'fail', 'warn', 'skip')
 * @param {string} result.check - Name of the health check
 * @param {string} result.message - Primary message describing the result
 * @param {Object} [result.details] - Additional details to format
 * @returns {string} HTML table row string
 * 
 * @example
 * ```javascript
 * const result = {
 *   status: 'fail',
 *   check: 'specs.json validation',
 *   message: 'specs.json has 2 error(s)',
 *   details: {
 *     errors: ['Field "title" is missing', 'Field "author" is empty']
 *   }
 * };
 * const rowHtml = formatResultAsTableRow(result);
 * ```
 */
export function formatResultAsTableRow(result) {
  const { statusClass, statusIcon, statusText } = getStatusDisplay(result);
  const rowClass = getRowClass(result);
  
  let detailsHtml = '';
  if (result.details && Object.keys(result.details).length > 0) {
    detailsHtml = formatResultDetails(result.details);
  }

  return `<tr data-status="${result.status}" class="check-row ${rowClass}">
    <td class="${statusClass} status-badge">
      <i class="bi ${statusIcon} status-icon"></i>
      <span>${statusText}</span>
    </td>
    <td>${escapeHtml(result.check)}</td>
    <td>
      ${escapeHtml(result.message)}
      ${detailsHtml}
    </td>
  </tr>`;
}

/**
 * Gets display properties (class, icon, text) for a result status.
 * 
 * This helper function centralizes the mapping between status values
 * and their visual representation, ensuring consistency across the UI.
 * 
 * @param {Object} result - The health check result
 * @param {string} result.status - Status value ('pass', 'fail', 'warn', 'skip')
 * @returns {{statusClass: string, statusIcon: string, statusText: string}}
 * 
 * @example
 * ```javascript
 * const display = getStatusDisplay({ status: 'fail' });
 * // Returns: {
 * //   statusClass: 'text-danger',
 * //   statusIcon: 'bi-x-circle-fill',
 * //   statusText: 'Fail'
 * // }
 * ```
 */
export function getStatusDisplay(result) {
  switch (result.status) {
    case 'pass':
      return {
        statusClass: 'text-success',
        statusIcon: 'bi-check-circle-fill',
        statusText: 'Pass'
      };
    case 'fail':
      return {
        statusClass: 'text-danger',
        statusIcon: 'bi-x-circle-fill',
        statusText: 'Fail'
      };
    case 'warn':
      return {
        statusClass: 'text-warning',
        statusIcon: 'bi-exclamation-triangle-fill',
        statusText: 'Warning'
      };
    case 'skip':
      return {
        statusClass: 'text-muted',
        statusIcon: 'bi-dash-circle',
        statusText: 'Skipped'
      };
    default:
      return {
        statusClass: 'text-secondary',
        statusIcon: 'bi-question-circle',
        statusText: 'Unknown'
      };
  }
}

/**
 * Gets the appropriate CSS class for a table row based on the result status.
 * 
 * This provides Bootstrap table row styling to visually distinguish
 * different result statuses in tabular displays.
 * 
 * @param {Object} result - The health check result
 * @param {string} result.status - Status value ('pass', 'fail', 'warn')
 * @returns {string} CSS class name
 * 
 * @example
 * ```javascript
 * const rowClass = getRowClass({ status: 'fail' });
 * // Returns: 'table-danger'
 * ```
 */
export function getRowClass(result) {
  switch (result.status) {
    case 'fail':
      return 'table-danger';
    case 'warn':
      return 'table-warning';
    case 'pass':
      return 'table-success';
    default:
      return '';
  }
}

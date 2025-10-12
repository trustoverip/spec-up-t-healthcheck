/**
 * @fileoverview HTML report generator for health check results
 * 
 * This module generates Bootstrap-styled HTML reports for health check results,
 * providing an interactive and visually appealing presentation of the data.
 * The generated reports include filtering capabilities, status indicators, and
 * responsive design elements.
 * 
 * @author spec-up-t-healthcheck
 
 */

/**
 * Generates a complete HTML report from health check results.
 * 
 * Creates a comprehensive HTML document using Bootstrap framework for styling,
 * including interactive features like filtering passing checks, status indicators,
 * and responsive layout. The report follows the visual design patterns from
 * the HealthCheck.vue reference.
 * 
 * @param {import('./health-checker.js').HealthCheckReport} healthCheckOutput - The complete health check report
 * @param {Object} [options={}] - Configuration options for HTML generation
 * @param {string} [options.title='Spec-Up-T Health Check Report'] - Custom title for the report
 * @param {boolean} [options.showPassingByDefault=true] - Whether to show passing checks by default
 * @param {string} [options.repositoryUrl] - URL to the repository being checked
 * @returns {string} Complete HTML document as string
 * 
 * @example
 * ```javascript
 * const report = await runHealthChecks(provider);
 * const htmlContent = generateHtmlReport(report, {
 *   title: 'My Custom Health Check Report',
 *   repositoryUrl: 'https://github.com/user/repo'
 * });
 * ```
 */
export function generateHtmlReport(healthCheckOutput, options = {}) {
  const {
    title = 'Spec-Up-T Health Check Report',
    showPassingByDefault = true,
    repositoryUrl
  } = options;

  const { results, summary, timestamp, provider } = healthCheckOutput;
  
  // Generate the main content sections
  const headerSection = generateHeaderSection(title, timestamp, provider, repositoryUrl);
  const summarySection = generateSummarySection(summary, showPassingByDefault);
  const resultsSection = generateResultsSection(results);
  const scriptsSection = generateScriptsSection();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
  <style>
    body {
      padding-top: 2rem;
      padding-bottom: 2rem;
      background-color: #f8f9fa;
    }
    .report-header {
      margin-bottom: 2rem;
    }
    .timestamp {
      color: #6c757d;
    }
    .repo-info {
      color: #6c757d;
      margin-bottom: 1rem;
    }
    .filter-toggle {
      margin-bottom: 1.5rem;
    }
    .hidden-item {
      display: none !important;
    }
    .status-icon {
      font-size: 1.1em;
      margin-right: 0.25rem;
    }
    .health-score {
      font-size: 2rem;
      font-weight: bold;
    }
    .summary-card {
      border: none;
      box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    }
    .results-card {
      border: none;
      box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
      margin-bottom: 1.5rem;
    }
    .card-header {
      border-bottom: 1px solid #dee2e6;
      background-color: #f8f9fa;
    }
    .table th {
      border-top: none;
      font-weight: 600;
      background-color: #f8f9fa;
    }
    .status-badge {
      white-space: nowrap;
      font-weight: 500;
    }
    .overall-status-pass {
      color: #198754;
    }
    .overall-status-warning {
      color: #fd7e14;
    }
    .overall-status-fail {
      color: #dc3545;
    }
  </style>
</head>
<body>
  <div class="container">
    ${headerSection}
    ${summarySection}
    ${resultsSection}
  </div>
  
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
  ${scriptsSection}
</body>
</html>`;
}

/**
 * Generates the header section of the HTML report.
 * 
 * @param {string} title - Report title
 * @param {string} timestamp - Report generation timestamp
 * @param {Object} provider - Provider information
 * @param {string} [repositoryUrl] - Optional repository URL
 * @returns {string} HTML string for the header section
 */
function generateHeaderSection(title, timestamp, provider, repositoryUrl) {
  const formattedTimestamp = new Date(timestamp).toLocaleString();
  
  let repoInfo = '';
  if (provider.repoPath) {
    repoInfo = `<p class="repo-info">
      <i class="bi bi-folder"></i>
      Repository: ${escapeHtml(provider.repoPath)}
    </p>`;
  }
  
  if (repositoryUrl) {
    repoInfo += `<p class="repo-info">
      <i class="bi bi-link-45deg"></i>
      URL: <a href="${escapeHtml(repositoryUrl)}" target="_blank">${escapeHtml(repositoryUrl)}</a>
    </p>`;
  }

  return `<div class="report-header">
    <h1>
      <i class="bi bi-heart-pulse text-primary"></i>
      ${escapeHtml(title)}
    </h1>
    <p class="timestamp">
      <i class="bi bi-clock"></i>
      Generated: ${escapeHtml(formattedTimestamp)}
    </p>
    ${repoInfo}
  </div>`;
}

/**
 * Generates the summary section with overall statistics and status.
 * 
 * @param {import('./health-checker.js').HealthCheckSummary} summary - Health check summary
 * @param {boolean} showPassingByDefault - Whether to show passing checks by default
 * @returns {string} HTML string for the summary section
 */
function generateSummarySection(summary, showPassingByDefault) {
  const overallStatusClass = summary.hasErrors ? 'overall-status-fail' : 
                            summary.hasWarnings ? 'overall-status-warning' : 'overall-status-pass';
  
  const overallStatusIcon = summary.hasErrors ? 'bi-x-circle-fill' : 
                           summary.hasWarnings ? 'bi-exclamation-triangle-fill' : 'bi-check-circle-fill';
  
  const overallStatusText = summary.hasErrors ? 'FAILED' : 
                           summary.hasWarnings ? 'PASSED WITH WARNINGS' : 'PASSED';

  const scoreColor = summary.score >= 80 ? 'text-success' : 
                    summary.score >= 60 ? 'text-warning' : 'text-danger';

  return `<div class="card summary-card mb-4">
    <div class="card-header">
      <div class="d-flex justify-content-between align-items-center">
        <h5 class="mb-0">
          <i class="bi bi-bar-chart"></i>
          Summary
        </h5>
        <div class="filter-toggle form-check form-switch">
          <input class="form-check-input" type="checkbox" id="togglePassingChecks" ${showPassingByDefault ? 'checked' : ''}>
          <label class="form-check-label" for="togglePassingChecks">
            Show passing checks
          </label>
        </div>
      </div>
    </div>
    <div class="card-body">
      <div class="row">
        <div class="col-md-8">
          <div class="row">
            <div class="col-6 col-md-3 text-center mb-3">
              <div class="h4 mb-1">${summary.total}</div>
              <small class="text-muted">Total</small>
            </div>
            <div class="col-6 col-md-3 text-center mb-3">
              <div class="h4 mb-1 text-success">${summary.passed}</div>
              <small class="text-muted">Passed</small>
            </div>
            <div class="col-6 col-md-3 text-center mb-3">
              <div class="h4 mb-1 text-danger">${summary.failed}</div>
              <small class="text-muted">Failed</small>
            </div>
            ${summary.warnings > 0 ? `<div class="col-6 col-md-3 text-center mb-3">
              <div class="h4 mb-1 text-warning">${summary.warnings}</div>
              <small class="text-muted">Warnings</small>
            </div>` : ''}
          </div>
          <div class="${overallStatusClass}">
            <i class="bi ${overallStatusIcon} status-icon"></i>
            <strong>Overall Status: ${overallStatusText}</strong>
          </div>
        </div>
        <div class="col-md-4 text-center">
          <div class="health-score ${scoreColor}">${Math.round(summary.score)}%</div>
          <small class="text-muted">Health Score</small>
        </div>
      </div>
    </div>
  </div>`;
}

/**
 * Generates the results section with individual check details.
 * 
 * @param {import('./health-checker.js').HealthCheckResult[]} results - Array of check results
 * @returns {string} HTML string for the results section
 */
function generateResultsSection(results) {
  if (results.length === 0) {
    return `<div class="card results-card">
      <div class="card-body text-center py-5">
        <i class="bi bi-heart-pulse" style="font-size: 3rem; color: #6c757d;"></i>
        <h5 class="mt-3">No Health Check Results</h5>
        <p class="text-muted">No health checks have been performed yet.</p>
      </div>
    </div>`;
  }

  const resultsHtml = results.map((result, index) => {
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
  }).join('');

  return `<div class="card results-card" data-section="health-check-results">
    <div class="card-header">
      <h5 class="mb-0">
        <i class="bi bi-list-check"></i>
        Detailed Results
      </h5>
    </div>
    <div class="card-body">
      <table class="table table-striped table-hover mb-0">
        <thead>
          <tr>
            <th style="width: 120px;">Status</th>
            <th style="width: 200px;">Check</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          ${resultsHtml}
        </tbody>
      </table>
    </div>
  </div>`;
}

/**
 * Generates the JavaScript section for interactive functionality.
 * 
 * @returns {string} HTML script section
 */
function generateScriptsSection() {
  return `<script>
    // Toggle function for passing checks
    document.getElementById('togglePassingChecks').addEventListener('change', function() {
      const showPassing = this.checked;
      const passingRows = document.querySelectorAll('tr[data-status="pass"]');
      
      // Hide/show passing rows
      passingRows.forEach(row => {
        if (showPassing) {
          row.classList.remove('hidden-item');
        } else {
          row.classList.add('hidden-item');
        }
      });
      
      // Check each results card to see if it should be hidden
      document.querySelectorAll('.results-card').forEach(card => {
        const visibleRows = card.querySelectorAll('tr.check-row:not(.hidden-item)');
        
        if (visibleRows.length === 0) {
          // If no visible rows, hide the entire card
          card.classList.add('hidden-item');
        } else {
          // Otherwise show it
          card.classList.remove('hidden-item');
        }
      });
    });
    
    // Initialize the filter state
    document.getElementById('togglePassingChecks').dispatchEvent(new Event('change'));
  </script>`;
}

/**
 * Gets the appropriate display properties for a health check result status.
 * 
 * @param {import('./health-checker.js').HealthCheckResult} result - The health check result
 * @returns {Object} Object containing statusClass, statusIcon, and statusText
 */
function getStatusDisplay(result) {
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
 * @param {import('./health-checker.js').HealthCheckResult} result - The health check result
 * @returns {string} CSS class name
 */
function getRowClass(result) {
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

/**
 * Formats result details into HTML.
 * 
 * @param {Object} details - The details object from a health check result
 * @returns {string} Formatted HTML string
 */
function formatResultDetails(details) {
  let html = '';
  
  // Display errors array
  if (details.errors && details.errors.length > 0) {
    html += `<div class="mt-2"><strong class="text-danger">Errors:</strong><ul class="mb-0 mt-1">`;
    details.errors.forEach(error => {
      html += `<li class="text-danger">${escapeHtml(error)}</li>`;
    });
    html += `</ul></div>`;
  }
  
  // Display warnings array
  if (details.warnings && details.warnings.length > 0) {
    html += `<div class="mt-2"><strong class="text-warning">Warnings:</strong><ul class="mb-0 mt-1">`;
    details.warnings.forEach(warning => {
      html += `<li class="text-warning">${escapeHtml(warning)}</li>`;
    });
    html += `</ul></div>`;
  }
  
  // Display success messages array
  if (details.success && details.success.length > 0) {
    html += `<div class="mt-2"><strong class="text-success">Success:</strong><ul class="mb-0 mt-1">`;
    details.success.forEach(success => {
      html += `<li class="text-success">${escapeHtml(success)}</li>`;
    });
    html += `</ul></div>`;
  }
  
  // Display missing fields (existing functionality)
  if (details.missingFields && details.missingFields.length > 0) {
    html += `<br><small class="text-muted">Missing fields: ${details.missingFields.map(escapeHtml).join(', ')}</small>`;
  }
  
  // Display count (existing functionality)
  if (details.count !== undefined) {
    html += `<br><small class="text-muted">Files found: ${details.count}</small>`;
  }
  
  // Display package data (existing functionality)
  if (details.packageData) {
    html += `<br><small class="text-muted">Package: ${escapeHtml(details.packageData.name)}@${escapeHtml(details.packageData.version)}</small>`;
  }
  
  return html;
}

/**
 * Escapes HTML special characters to prevent XSS attacks.
 * 
 * @param {string} text - Text to escape
 * @returns {string} HTML-escaped text
 */
function escapeHtml(text) {
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
#!/usr/bin/env node

/**
 * @fileoverview Node.js usage examples for spec-up-t-healthcheck
 * 
 * This example file demonstrates various ways to use the spec-up-t-healthcheck
 * library programmatically in Node.js applications. It showcases both basic
 * convenience functions and advanced usage patterns with custom configuration.
 * 
 * The examples show real-world usage patterns that developers can copy and
 * adapt for their own projects. All examples use the current directory as
 * the target for demonstration purposes.
 * 
 * @author spec-up-t-healthcheck
 * @version 1.0.1-beta
 */

// Note: Using require() syntax for compatibility demonstration
// The library also supports ES6 import syntax
const { checkRepository, HealthChecker, LocalProvider } = require('../lib/index.js');

/**
 * Demonstrates basic usage of the health check library using convenience functions.
 * 
 * This example shows the simplest way to perform health checks with minimal
 * configuration. It uses the high-level API that handles most common use cases
 * automatically, including provider creation and result formatting.
 * 
 * @example
 * ```javascript
 * // Basic usage in your own project:
 * const { healthCheck } = require('spec-up-t-healthcheck');
 * const report = await healthCheck('./my-spec-repo');
 * ```
 */
async function basicExample() {
  console.log('🔍 Running basic health check on current directory...\n');

  try {
    // Method 1: Using convenience function
    const report = await checkRepository('.', {
      categories: ['repository', 'configuration', 'structure']
    });

    console.log('📊 Health Check Results:');
    console.log('Target:', report.metadata.target);
    console.log('Provider:', report.metadata.provider);
    console.log('Overall Status:', report.getOverallStatus());
    
    const summary = report.getOverallSummary();
    console.log(`Results: ${summary.passed}/${summary.total} checks passed`);
    
    console.log('\n📋 Sections:');
    report.sections.forEach(section => {
      const sectionStatus = section.getOverallStatus();
      const statusIcon = sectionStatus === true ? '✅' : sectionStatus === 'partial' ? '⚠️' : '❌';
      console.log(`${statusIcon} ${section.title}`);
      
      section.results.forEach(result => {
        const resultIcon = result.success === true ? '  ✓' : result.success === 'partial' ? '  ⚠' : '  ✗';
        console.log(`${resultIcon} ${result.checkName}: ${result.message}`);
      });
    });

  } catch (error) {
    console.error('❌ Error running health check:', error.message);
    process.exit(1);
  }
}

/**
 * Demonstrates advanced usage with custom configuration and direct API access.
 * 
 * This example shows how to use the lower-level APIs for more control over
 * the health checking process. It demonstrates custom provider creation,
 * specific check selection, and alternative result processing methods.
 * 
 * This approach is useful when you need:
 * - Custom provider configurations
 * - Specific subset of checks
 * - Custom error handling
 * - Direct access to result objects
 * 
 * @example
 * ```javascript
 * // Advanced usage in your own project:
 * const { createLocalProvider, runHealthChecks } = require('spec-up-t-healthcheck');
 * const provider = createLocalProvider('./custom-path');
 * const report = await runHealthChecks(provider, { checks: ['package-json'] });
 * ```
 */
async function advancedExample() {
  console.log('\n🔧 Running advanced health check with custom configuration...\n');

  try {
    // Method 2: Using HealthChecker directly for more control
    const checker = new HealthChecker();
    const provider = new LocalProvider('.');
    
    const report = await checker.runChecks('.', null, provider, {
      categories: ['configuration'],
      continueOnError: true
    });

    console.log('📊 Advanced Results:');
    console.log('Available categories:', checker.getAvailableCategories());
    console.log('JSON output:', JSON.stringify(report.toJSON(), null, 2));

  } catch (error) {
    console.error('❌ Error in advanced example:', error.message);
  }
}

/**
 * Main execution function that runs all examples in sequence.
 * 
 * This function orchestrates the execution of both basic and advanced examples,
 * providing a complete demonstration of the library's capabilities. It includes
 * proper error handling and demonstrates best practices for using the library
 * in real applications.
 */
async function main() {
  await basicExample();
  await advancedExample();
  console.log('\n✅ Examples completed!');
}

// Execute the examples
main().catch(console.error);
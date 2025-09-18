#!/usr/bin/env node

/**
 * Example: Basic Node.js usage of the health check tool
 * This demonstrates how to use the tool programmatically in a Node.js application
 */

const { checkRepository, HealthChecker, LocalProvider } = require('../lib/index.js');

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

// Run examples
async function main() {
  await basicExample();
  await advancedExample();
  console.log('\n✅ Examples completed!');
}

main().catch(console.error);
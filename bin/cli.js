#!/usr/bin/env node

import { Command } from 'commander';
import { createProvider, runHealthChecks, formatResultsAsText, formatResultsAsJson } from '../lib/index.js';

const program = new Command();

program
  .name('spec-up-t-healthcheck')
  .description('Health check tool for spec-up-t repositories')
  .version('1.0.0');

program
  .command('check')
  .description('Run health checks on a repository')
  .argument('<target>', 'Repository path (local) or URL (remote)')
  .option('-c, --checks <checks>', 'Comma-separated list of checks to run (package-json,spec-files)')
  .option('-f, --format <format>', 'Output format (text|json)', 'text')
  .option('-o, --output <file>', 'Output file path')
  .action(async (target, options) => {
    try {
      console.log(`\n🔍 Checking: ${target}\n`);
      
      // Parse checks option
      const checks = options.checks ? options.checks.split(',').map(c => c.trim()) : undefined;
      
      // Create provider and run checks
      const provider = createProvider(target);
      const results = await runHealthChecks(provider, { checks });
      
      // Format output
      let output;
      if (options.format === 'json') {
        output = formatResultsAsJson(results, 2);
      } else {
        output = formatResultsAsText(results);
      }
      
      // Output results
      if (options.output) {
        const fs = await import('fs/promises');
        await fs.writeFile(options.output, output);
        console.log(`✅ Results written to ${options.output}`);
      } else {
        console.log(output);
      }
      
      // Exit with appropriate code
      if (results.summary.hasErrors) {
        process.exit(1);
      } else if (results.summary.hasWarnings) {
        process.exit(2);
      }
      
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('list-checks')
  .description('List available health checks')
  .action(() => {
    console.log('📋 Available Health Checks:\n');
    console.log('1. package-json - Validates package.json structure and required fields');
    console.log('2. spec-files   - Finds and validates specification markdown files');
    console.log('\nUsage: spec-up-t-healthcheck check <target> --checks package-json,spec-files');
  });

program
  .command('example')
  .description('Show usage examples')
  .action(() => {
    console.log('📚 Usage Examples:\n');
    console.log('Local repository:');
    console.log('  spec-up-t-healthcheck check ./my-spec-repo\n');
    console.log('Specific checks only:');
    console.log('  spec-up-t-healthcheck check ./repo --checks package-json\n');
    console.log('JSON output:');
    console.log('  spec-up-t-healthcheck check ./repo --format json\n');
    console.log('Save to file:');
    console.log('  spec-up-t-healthcheck check ./repo --output report.txt');
  });

program.parse();

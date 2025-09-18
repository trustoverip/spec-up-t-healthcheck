#!/usr/bin/env node

/**
 * @fileoverview Command Line Interface for spec-up-t-healthcheck
 * 
 * This CLI tool provides a convenient command-line interface for running health checks
 * on specification repositories. It supports various output formats, check selection,
 * and file output options. The CLI is built using Commander.js and provides a user-friendly
 * interface for all health checking functionality.
 * 
 * @author spec-up-t-healthcheck
 * @version 1.0.1-beta
 */

import { Command } from 'commander';
import { createProvider, runHealthChecks, formatResultsAsText, formatResultsAsJson } from '../lib/index.js';

const program = new Command();

program
  .name('spec-up-t-healthcheck')
  .description('Health check tool for spec-up-t repositories')
  .version('1.0.0');

/**
 * Main 'check' command that performs health checks on a repository.
 * 
 * This command creates a provider for the target repository, runs the specified
 * health checks, and outputs the results in the requested format. It supports
 * both local and remote repositories (when implemented) and provides flexible
 * output options.
 * 
 * Exit codes:
 * - 0: All checks passed
 * - 1: One or more checks failed or command error
 * - 2: Checks passed but with warnings
 * 
 * @example
 * ```bash
 * # Basic usage
 * spec-up-t-healthcheck check ./my-repo
 * 
 * # Specific checks only
 * spec-up-t-healthcheck check ./my-repo --checks package-json
 * 
 * # JSON output to file
 * spec-up-t-healthcheck check ./my-repo --format json --output report.json
 * ```
 */
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

/**
 * 'list-checks' command that displays available health checks.
 * 
 * This informational command helps users discover what health checks are available
 * and understand what each check validates. It provides descriptions of each check
 * and examples of how to use them.
 */
program
  .command('list-checks')
  .description('List available health checks')
  .action(() => {
    console.log('📋 Available Health Checks:\n');
    console.log('1. package-json - Validates package.json structure and required fields');
    console.log('2. spec-files   - Finds and validates specification markdown files');
    console.log('\nUsage: spec-up-t-healthcheck check <target> --checks package-json,spec-files');
  });

/**
 * 'example' command that demonstrates CLI usage patterns.
 * 
 * This command provides practical examples of how to use the CLI tool
 * with different options and scenarios. It helps users understand the
 * available command-line options and common usage patterns.
 */
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

/**
 * Parse and execute the command line arguments.
 * This must be called at the end to process user input.
 */
program.parse();

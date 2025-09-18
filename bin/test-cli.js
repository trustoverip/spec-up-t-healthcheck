#!/usr/bin/env node

/**
 * @fileoverview Test CLI utility for spec-up-t-healthcheck
 * 
 * This is a simple test script that validates the basic functionality
 * of the health check library. It performs a basic import test to ensure
 * the module can be loaded correctly and the main API is accessible.
 * 
 * This script is primarily used for development testing and debugging
 * import/export issues during the build process.
 * 
 * @author spec-up-t-healthcheck
 */

import { healthCheck } from '../lib/index.js';

/**
 * Simple test to verify that the healthCheck function can be imported
 * and called without throwing an error. This helps validate that the
 * module structure and exports are working correctly.
 */
console.log('Testing vanilla JS import...');
const result = healthCheck();
console.log(result);
console.log('✅ Success!');

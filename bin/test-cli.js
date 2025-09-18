#!/usr/bin/env node
import { healthCheck } from '../lib/index.js';

console.log('Testing vanilla JS import...');
const result = healthCheck();
console.log(result);
console.log('✅ Success!');

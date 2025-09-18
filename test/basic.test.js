/**
 * Basic integration test to verify the health check tool works
 */

import { healthCheck, createLocalProvider } from '../lib/index.js';

describe('Basic Health Check Functionality', () => {
  
  describe('HealthCheck', () => {
    it('should run health check', async () => {
      const report = await healthCheck('.', {
        categories: ['repository', 'configuration']
      });
      expect(report).toBeDefined();
    });
  });

  describe('LocalProvider', () => {
    it('should create a LocalProvider instance', () => {
      const provider = createLocalProvider('.');
      expect(provider).toBeDefined();
    });

    it('should get base path', () => {
      const provider = createLocalProvider('.');
      const basePath = provider.getBasePath();
      expect(typeof basePath).toBe('string');
      expect(basePath.length).toBeGreaterThan(0);
    });

    it('should check if package.json exists', async () => {
      const provider = createLocalProvider('.');
      const exists = await provider.checkExists('package.json');
      expect(exists).toBe(true);
    });
  });

  describe('Convenience Functions', () => {
    it('should run basic health check on current directory', async () => {
      const report = await healthCheck('.', {
        categories: ['repository', 'configuration']
      });
      
      expect(report).toBeDefined();
      expect(report.sections).toHaveLength(2);
      expect(report.metadata.target).toBe('.');
      expect(report.metadata.provider).toBe('LocalProvider');
    }, 10000);
  });
});
// Test script to check CMS configuration
import fs from 'fs';
import yaml from 'js-yaml';

// Read and parse YAML config
const yamlContent = fs.readFileSync('./config/site.yaml', 'utf8');
const yamlConfig = yaml.load(yamlContent);

console.log('CMS Config:', yamlConfig.cms);
console.log('CMS Enabled:', yamlConfig.cms?.enabled);

// Simulate the site-config.ts logic
const cmsConfig = {
  enabled: yamlConfig.cms?.enabled ?? false,
  url: yamlConfig.cms?.url ?? 'http://localhost:5173',
  port: yamlConfig.cms?.port ?? 5173,
};

console.log('Processed CMS Config:', cmsConfig);
console.log('Should show CMS button:', cmsConfig.enabled);
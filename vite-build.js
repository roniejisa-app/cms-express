const { execSync } = require('child_process');
const minimist = require('minimist');

// Parse command-line arguments
const args = minimist(process.argv.slice(2));
const target = args.name || 'default';
// Set an environment variable for the build target
process.env.BUILD_TARGET = target;

// Run Vite build with the specified target
execSync('vite build', { stdio: 'inherit' });
// Example usage:
// npm run build -- --name=admin

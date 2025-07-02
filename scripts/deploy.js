/**
 * Deployment script for different environments
 * Usage: node scripts/deploy.js [environment]
 * Where environment is one of: development, staging, production
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get environment from command line arguments
const environment = process.argv[2] || 'development';
const validEnvironments = ['development', 'staging', 'production'];

if (!validEnvironments.includes(environment)) {
  console.error(`Error: Invalid environment "${environment}". Must be one of: ${validEnvironments.join(', ')}`);
  process.exit(1);
}

// Configuration for different environments
const config = {
  development: {
    buildCommand: 'npm run build:dev',
    outputDir: 'dist',
    deployCommand: 'npx netlify-cli deploy --dir=dist --prod',
    envFile: '.env.development'
  },
  staging: {
    buildCommand: 'npm run build:staging',
    outputDir: 'dist',
    deployCommand: 'az webapp deployment source config-zip --resource-group myResourceGroup --name myApp-staging --src ./dist.zip',
    envFile: '.env.staging'
  },
  production: {
    buildCommand: 'npm run build',
    outputDir: 'dist',
    deployCommand: 'npm run deploy',
    envFile: '.env.production'
  }
};

// Get configuration for the selected environment
const envConfig = config[environment];

console.log(`Deploying to ${environment} environment...`);

try {
  // Check if environment file exists
  const envFilePath = path.resolve(process.cwd(), envConfig.envFile);
  if (fs.existsSync(envFilePath)) {
    console.log(`Using environment file: ${envConfig.envFile}`);
    // Copy environment file to .env for build process
    fs.copyFileSync(envFilePath, path.resolve(process.cwd(), '.env'));
  } else {
    console.warn(`Warning: Environment file ${envConfig.envFile} not found.`);
  }

  // Run build command
  console.log(`Running build command: ${envConfig.buildCommand}`);
  execSync(envConfig.buildCommand, { stdio: 'inherit' });

  // Create zip file for some deployment methods
  if (envConfig.deployCommand.includes('config-zip')) {
    console.log('Creating deployment zip file...');
    const archiver = require('archiver');
    const output = fs.createWriteStream(path.resolve(process.cwd(), 'dist.zip'));
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    output.on('close', () => {
      console.log(`Zip file created (${archive.pointer()} bytes)`);
      
      // Run deploy command
      console.log(`Running deploy command: ${envConfig.deployCommand}`);
      execSync(envConfig.deployCommand, { stdio: 'inherit' });
    });
    
    archive.on('error', (err) => {
      throw err;
    });
    
    archive.pipe(output);
    archive.directory(envConfig.outputDir, false);
    archive.finalize();
  } else {
    // Run deploy command directly
    console.log(`Running deploy command: ${envConfig.deployCommand}`);
    execSync(envConfig.deployCommand, { stdio: 'inherit' });
  }

  console.log(`Successfully deployed to ${environment} environment!`);
} catch (error) {
  console.error(`Deployment failed: ${error.message}`);
  process.exit(1);
}
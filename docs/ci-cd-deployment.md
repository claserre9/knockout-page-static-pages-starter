# CI/CD and Deployment Documentation

This document describes the CI/CD pipeline and deployment process for the project.

## Table of Contents

1. [GitHub Actions Workflows](#github-actions-workflows)
2. [Automated Versioning and Changelog Generation](#automated-versioning-and-changelog-generation)
3. [Deployment Scripts](#deployment-scripts)
4. [Feature Flags](#feature-flags)
5. [Monitoring and Error Reporting](#monitoring-and-error-reporting)

## GitHub Actions Workflows

The project uses GitHub Actions for continuous integration and deployment. There are three main workflows:

### CI Workflow

The CI workflow runs on every push to the main and develop branches, as well as on pull requests targeting these branches. It performs the following tasks:

- Checks out the code
- Sets up Node.js
- Installs dependencies
- Runs linting
- Runs tests
- Uploads test results as artifacts

To view the CI workflow configuration, see [.github/workflows/ci.yml](../.github/workflows/ci.yml).

### CD Workflow

The CD workflow runs when code is pushed to the main, staging, or develop branches, or when a tag starting with 'v' is created. It performs the following tasks:

- Checks out the code
- Sets up Node.js
- Installs dependencies
- Builds the application with environment-specific settings
- Uploads the build artifacts
- Deploys to the appropriate environment:
  - main branch → GitHub Pages (production)
  - staging branch → Azure (staging)
  - develop branch → Netlify (development)

To view the CD workflow configuration, see [.github/workflows/cd.yml](../.github/workflows/cd.yml).

### Release Workflow

The release workflow is manually triggered and allows you to create a new release with a specified version bump (major, minor, or patch). It performs the following tasks:

- Checks out the code
- Sets up Node.js
- Installs dependencies
- Bumps the version in package.json
- Generates a changelog from commit messages
- Creates a git tag and commits the version bump
- Creates a GitHub release with the changelog as the release notes

To view the release workflow configuration, see [.github/workflows/release.yml](../.github/workflows/release.yml).

## Automated Versioning and Changelog Generation

The project uses semantic versioning (SemVer) for version numbers. The release workflow automates the process of bumping the version and generating a changelog.

### Version Bumping

Version bumping follows these rules:

- Major version (X.0.0): Breaking changes
- Minor version (0.X.0): New features, no breaking changes
- Patch version (0.0.X): Bug fixes and minor changes

To create a new release:

1. Go to the Actions tab in GitHub
2. Select the "Release" workflow
3. Click "Run workflow"
4. Select the branch (usually main)
5. Choose the release type (major, minor, or patch)
6. Click "Run workflow"

### Changelog Generation

The changelog is automatically generated from commit messages since the last tag. To ensure meaningful changelog entries, follow these commit message conventions:

- `feat: ...` for new features
- `fix: ...` for bug fixes
- `docs: ...` for documentation changes
- `style: ...` for code style changes
- `refactor: ...` for code refactoring
- `perf: ...` for performance improvements
- `test: ...` for test-related changes
- `chore: ...` for build process or tooling changes

## Deployment Scripts

The project includes a deployment script that can deploy the application to different environments. The script is located at [scripts/deploy.js](../scripts/deploy.js).

### Environment Configuration

Each environment has its own configuration file:

- Development: [.env.development](../.env.development)
- Staging: [.env.staging](../.env.staging)
- Production: [.env.production](../.env.production)

### Deployment Commands

To deploy to a specific environment, run:

```bash
node scripts/deploy.js [environment]
```

Where `[environment]` is one of:
- `development` (default)
- `staging`
- `production`

The script will:
1. Load the appropriate environment configuration
2. Build the application with environment-specific settings
3. Deploy the application to the specified environment

## Feature Flags

The project includes a feature flag service that allows for controlled rollouts of new features. The service is located at [src/services/feature-flags/FeatureFlagService.ts](../src/services/feature-flags/FeatureFlagService.ts).

### Using Feature Flags

To use feature flags in your code:

```typescript
import { getFeatureFlagService } from '../services/feature-flags/FeatureFlagService';

const featureFlagService = getFeatureFlagService();

// Check if a feature is enabled
if (featureFlagService.isEnabled('new_ui')) {
  // Show new UI
} else {
  // Show old UI
}

// Use an observable feature flag with Knockout
class MyViewModel {
  public showNewFeature = featureFlagService.observe('new_feature');
  
  constructor() {
    // The showNewFeature observable will update automatically
    // when the feature flag changes
  }
}
```

### Configuring Feature Flags

Feature flags are configured in the environment files:

```
# Feature Flags
FEATURE_NEW_UI=true
FEATURE_ANALYTICS=false
FEATURE_USER_PROFILES=true
```

## Monitoring and Error Reporting

The project includes a monitoring service for error reporting and performance tracking. The service is located at [src/services/monitoring/MonitoringService.ts](../src/services/monitoring/MonitoringService.ts).

### Using the Monitoring Service

To use the monitoring service in your code:

```typescript
import { getMonitoringService } from '../services/monitoring/MonitoringService';

const monitoringService = getMonitoringService();

// Initialize the service
await monitoringService.initialize({
  environment: 'production',
  release: '1.0.0'
});

// Report an error
try {
  // Some code that might throw an error
} catch (error) {
  monitoringService.reportError(error, {
    component: 'MyComponent',
    action: 'saveData'
  });
}

// Measure performance
const stopMeasurement = monitoringService.measurePerformance('data_loading');
// Do some work
stopMeasurement(); // This will report the time taken

// Set user information
monitoringService.setUser('user123', {
  email: 'user@example.com',
  role: 'admin'
});
```

### Configuring Monitoring

The monitoring service can be configured in the environment files:

```
# Monitoring
MONITORING_API_KEY=your-api-key
MONITORING_DSN=https://your-sentry-dsn
MONITORING_ENABLED=true
MONITORING_SAMPLE_RATE=0.1
```

For production use, you would typically integrate with a service like Sentry for error reporting and Google Analytics or similar for performance monitoring. The service includes commented examples of how to integrate with these services.
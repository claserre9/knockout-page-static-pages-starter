/**
 * Feature Flag Service
 * 
 * This service provides a way to control feature availability in the application.
 * It reads feature flags from environment variables and provides methods to check
 * if a feature is enabled.
 */

import { observable } from 'knockout';

/**
 * Interface for feature flag configuration
 */
export interface FeatureFlags {
  [key: string]: boolean;
}

/**
 * Feature flag service interface
 */
export interface IFeatureFlagService {
  /**
   * Check if a feature is enabled
   * 
   * @param featureName - The name of the feature to check
   * @returns True if the feature is enabled, false otherwise
   */
  isEnabled(featureName: string): boolean;
  
  /**
   * Get an observable for a feature flag
   * 
   * @param featureName - The name of the feature to observe
   * @returns An observable that will be updated when the feature flag changes
   */
  observe(featureName: string): KnockoutObservable<boolean>;
  
  /**
   * Override a feature flag (useful for testing or user preferences)
   * 
   * @param featureName - The name of the feature to override
   * @param enabled - Whether the feature should be enabled
   */
  override(featureName: string, enabled: boolean): void;
  
  /**
   * Reset all overrides
   */
  resetOverrides(): void;
}

/**
 * Feature flag service implementation
 */
export class FeatureFlagService implements IFeatureFlagService {
  private flags: FeatureFlags;
  private overrides: FeatureFlags = {};
  private observables: Map<string, KnockoutObservable<boolean>> = new Map();
  
  /**
   * Create a new feature flag service
   * 
   * @param initialFlags - Initial feature flag values
   */
  constructor(initialFlags: FeatureFlags = {}) {
    this.flags = this.loadFlagsFromEnvironment();
    
    // Merge initial flags with environment flags
    this.flags = { ...this.flags, ...initialFlags };
  }
  
  /**
   * Check if a feature is enabled
   * 
   * @param featureName - The name of the feature to check
   * @returns True if the feature is enabled, false otherwise
   */
  public isEnabled(featureName: string): boolean {
    // Check if there's an override for this feature
    if (featureName in this.overrides) {
      return this.overrides[featureName];
    }
    
    // Otherwise check the flags
    return this.flags[featureName] === true;
  }
  
  /**
   * Get an observable for a feature flag
   * 
   * @param featureName - The name of the feature to observe
   * @returns An observable that will be updated when the feature flag changes
   */
  public observe(featureName: string): KnockoutObservable<boolean> {
    if (!this.observables.has(featureName)) {
      this.observables.set(featureName, observable(this.isEnabled(featureName)));
    }
    
    return this.observables.get(featureName)!;
  }
  
  /**
   * Override a feature flag (useful for testing or user preferences)
   * 
   * @param featureName - The name of the feature to override
   * @param enabled - Whether the feature should be enabled
   */
  public override(featureName: string, enabled: boolean): void {
    this.overrides[featureName] = enabled;
    
    // Update the observable if it exists
    if (this.observables.has(featureName)) {
      this.observables.get(featureName)!(enabled);
    }
  }
  
  /**
   * Reset all overrides
   */
  public resetOverrides(): void {
    this.overrides = {};
    
    // Update all observables to their default values
    this.observables.forEach((observable, featureName) => {
      observable(this.flags[featureName] === true);
    });
  }
  
  /**
   * Load feature flags from environment variables
   * 
   * @returns Feature flags loaded from environment variables
   */
  private loadFlagsFromEnvironment(): FeatureFlags {
    const flags: FeatureFlags = {};
    
    // In a browser environment, we can't directly access process.env
    // So we need to use webpack's DefinePlugin to inject environment variables
    // or load them from a global object
    
    // Check if we have a global featureFlags object
    const globalFlags = (window as any).featureFlags || {};
    
    // Look for environment variables with the FEATURE_ prefix
    Object.keys(globalFlags).forEach(key => {
      if (key.startsWith('FEATURE_')) {
        const featureName = key.replace('FEATURE_', '').toLowerCase();
        flags[featureName] = globalFlags[key] === 'true' || globalFlags[key] === true;
      }
    });
    
    return flags;
  }
}

/**
 * Singleton instance of the feature flag service
 */
let featureFlagService: IFeatureFlagService | null = null;

/**
 * Get the feature flag service instance
 * 
 * @param initialFlags - Initial feature flag values (only used if the service hasn't been initialized yet)
 * @returns The feature flag service instance
 */
export const getFeatureFlagService = (initialFlags?: FeatureFlags): IFeatureFlagService => {
  if (!featureFlagService) {
    featureFlagService = new FeatureFlagService(initialFlags);
  }
  
  return featureFlagService;
};
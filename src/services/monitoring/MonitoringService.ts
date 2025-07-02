/**
 * Monitoring Service
 * 
 * This service provides error reporting and performance monitoring for the application.
 * It can be configured to send data to different monitoring services based on the environment.
 */

/**
 * Interface for error details
 */
export interface ErrorDetails {
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
  tags?: string[];
}

/**
 * Interface for performance metric
 */
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percent';
  tags?: Record<string, string>;
}

/**
 * Monitoring service interface
 */
export interface IMonitoringService {
  /**
   * Initialize the monitoring service
   * 
   * @param config - Configuration options
   */
  initialize(config?: MonitoringConfig): Promise<void>;
  
  /**
   * Report an error to the monitoring service
   * 
   * @param error - The error to report
   * @param context - Additional context for the error
   */
  reportError(error: Error | string, context?: Record<string, unknown>): void;
  
  /**
   * Report a performance metric to the monitoring service
   * 
   * @param metric - The performance metric to report
   */
  reportMetric(metric: PerformanceMetric): void;
  
  /**
   * Start a performance measurement
   * 
   * @param name - The name of the measurement
   * @returns A function to stop the measurement and report the metric
   */
  measurePerformance(name: string): () => void;
  
  /**
   * Set user information for the current session
   * 
   * @param userId - The user ID
   * @param userInfo - Additional user information
   */
  setUser(userId: string, userInfo?: Record<string, unknown>): void;
}

/**
 * Configuration options for the monitoring service
 */
export interface MonitoringConfig {
  apiKey?: string;
  environment?: string;
  release?: string;
  dsn?: string;
  sampleRate?: number;
  enabled?: boolean;
  errorSampleRate?: number;
  traceSampleRate?: number;
}

/**
 * Monitoring service implementation
 */
export class MonitoringService implements IMonitoringService {
  private config: MonitoringConfig = {
    environment: 'development',
    sampleRate: 1.0,
    enabled: true,
    errorSampleRate: 1.0,
    traceSampleRate: 0.1
  };
  
  private performanceMeasurements: Record<string, number> = {};
  private initialized = false;
  
  /**
   * Initialize the monitoring service
   * 
   * @param config - Configuration options
   */
  public async initialize(config: MonitoringConfig = {}): Promise<void> {
    // Merge provided config with defaults
    this.config = { ...this.config, ...config };
    
    if (!this.config.enabled) {
      console.log('Monitoring service is disabled');
      return;
    }
    
    try {
      // Initialize error monitoring (e.g., Sentry)
      await this.initializeErrorMonitoring();
      
      // Initialize performance monitoring (e.g., Google Analytics)
      await this.initializePerformanceMonitoring();
      
      this.initialized = true;
      console.log(`Monitoring service initialized for ${this.config.environment} environment`);
    } catch (error) {
      console.error('Failed to initialize monitoring service:', error);
    }
  }
  
  /**
   * Report an error to the monitoring service
   * 
   * @param error - The error to report
   * @param context - Additional context for the error
   */
  public reportError(error: Error | string, context: Record<string, unknown> = {}): void {
    if (!this.initialized || !this.config.enabled) {
      return;
    }
    
    // Skip reporting based on sample rate
    if (Math.random() > (this.config.errorSampleRate || 1.0)) {
      return;
    }
    
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    
    // In a real implementation, this would send the error to a service like Sentry
    console.error('Error reported to monitoring service:', {
      message: errorObj.message,
      stack: errorObj.stack,
      context,
      environment: this.config.environment,
      release: this.config.release
    });
    
    // Example integration with Sentry
    // if (window.Sentry) {
    //   window.Sentry.withScope((scope) => {
    //     Object.entries(context).forEach(([key, value]) => {
    //       scope.setExtra(key, value);
    //     });
    //     window.Sentry.captureException(errorObj);
    //   });
    // }
  }
  
  /**
   * Report a performance metric to the monitoring service
   * 
   * @param metric - The performance metric to report
   */
  public reportMetric(metric: PerformanceMetric): void {
    if (!this.initialized || !this.config.enabled) {
      return;
    }
    
    // Skip reporting based on sample rate
    if (Math.random() > (this.config.sampleRate || 1.0)) {
      return;
    }
    
    // In a real implementation, this would send the metric to a service like Google Analytics or Datadog
    console.log('Metric reported to monitoring service:', {
      ...metric,
      environment: this.config.environment
    });
    
    // Example integration with Google Analytics
    // if (window.gtag) {
    //   window.gtag('event', 'performance', {
    //     'event_category': 'performance',
    //     'event_label': metric.name,
    //     'value': metric.value,
    //     ...metric.tags
    //   });
    // }
  }
  
  /**
   * Start a performance measurement
   * 
   * @param name - The name of the measurement
   * @returns A function to stop the measurement and report the metric
   */
  public measurePerformance(name: string): () => void {
    if (!this.initialized || !this.config.enabled) {
      return () => {}; // No-op if monitoring is disabled
    }
    
    // Record start time
    this.performanceMeasurements[name] = performance.now();
    
    // Return a function to stop the measurement
    return () => {
      const startTime = this.performanceMeasurements[name];
      if (startTime) {
        const duration = performance.now() - startTime;
        this.reportMetric({
          name,
          value: duration,
          unit: 'ms'
        });
        
        // Clean up
        delete this.performanceMeasurements[name];
      }
    };
  }
  
  /**
   * Set user information for the current session
   * 
   * @param userId - The user ID
   * @param userInfo - Additional user information
   */
  public setUser(userId: string, userInfo: Record<string, unknown> = {}): void {
    if (!this.initialized || !this.config.enabled) {
      return;
    }
    
    // In a real implementation, this would set the user context in a service like Sentry
    console.log('User set in monitoring service:', {
      id: userId,
      ...userInfo
    });
    
    // Example integration with Sentry
    // if (window.Sentry) {
    //   window.Sentry.setUser({
    //     id: userId,
    //     ...userInfo
    //   });
    // }
  }
  
  /**
   * Initialize error monitoring (e.g., Sentry)
   */
  private async initializeErrorMonitoring(): Promise<void> {
    // In a real implementation, this would initialize a service like Sentry
    // Example:
    // if (this.config.dsn) {
    //   await import('@sentry/browser').then(Sentry => {
    //     Sentry.init({
    //       dsn: this.config.dsn,
    //       environment: this.config.environment,
    //       release: this.config.release,
    //       tracesSampleRate: this.config.traceSampleRate || 0.1
    //     });
    //   });
    // }
    
    // For now, just set up a global error handler
    window.addEventListener('error', (event) => {
      this.reportError(event.error || new Error(event.message), {
        source: event.filename,
        line: event.lineno,
        column: event.colno
      });
    });
    
    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError(event.reason || new Error('Unhandled Promise rejection'), {
        type: 'unhandledrejection'
      });
    });
  }
  
  /**
   * Initialize performance monitoring (e.g., Google Analytics)
   */
  private async initializePerformanceMonitoring(): Promise<void> {
    // In a real implementation, this would initialize a service like Google Analytics
    // Example:
    // if (this.config.apiKey) {
    //   await import('web-vitals').then(({ getCLS, getFID, getLCP }) => {
    //     getCLS(metric => this.reportMetric({
    //       name: 'CLS',
    //       value: metric.value,
    //       unit: 'count'
    //     }));
    //     getFID(metric => this.reportMetric({
    //       name: 'FID',
    //       value: metric.value,
    //       unit: 'ms'
    //     }));
    //     getLCP(metric => this.reportMetric({
    //       name: 'LCP',
    //       value: metric.value,
    //       unit: 'ms'
    //     }));
    //   });
    // }
    
    // For now, just track some basic performance metrics
    if (window.performance && window.performance.timing) {
      window.addEventListener('load', () => {
        // Wait for the next tick to ensure timing data is available
        setTimeout(() => {
          const timing = window.performance.timing;
          
          // Calculate and report page load time
          const loadTime = timing.loadEventEnd - timing.navigationStart;
          this.reportMetric({
            name: 'page_load_time',
            value: loadTime,
            unit: 'ms'
          });
          
          // Calculate and report time to first byte
          const ttfb = timing.responseStart - timing.navigationStart;
          this.reportMetric({
            name: 'time_to_first_byte',
            value: ttfb,
            unit: 'ms'
          });
          
          // Calculate and report DOM content loaded time
          const domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
          this.reportMetric({
            name: 'dom_content_loaded',
            value: domContentLoaded,
            unit: 'ms'
          });
        }, 0);
      });
    }
  }
}

/**
 * Singleton instance of the monitoring service
 */
let monitoringService: IMonitoringService | null = null;

/**
 * Get the monitoring service instance
 * 
 * @returns The monitoring service instance
 */
export const getMonitoringService = (): IMonitoringService => {
  if (!monitoringService) {
    monitoringService = new MonitoringService();
  }
  
  return monitoringService;
};
import { HttpClient } from '../http/HttpClient';

/**
 * Base interface for all services
 */
export interface IService {
  /**
   * Initializes the service
   */
  initialize(): Promise<void>;
}

/**
 * Base service class that provides common functionality for all services
 */
export abstract class BaseService implements IService {
  protected httpClient: HttpClient;
  
  /**
   * Creates a new BaseService instance
   * 
   * @param httpClient - The HTTP client to use for API requests
   */
  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }
  
  /**
   * Initializes the service
   * This method can be overridden by subclasses to perform initialization tasks
   */
  public async initialize(): Promise<void> {
    // Base implementation does nothing
    return Promise.resolve();
  }
  
  /**
   * Handles errors from service operations
   * 
   * @param error - The error to handle
   * @param defaultMessage - Default message to use if error doesn't have one
   */
  protected handleError(error: unknown, defaultMessage = 'An error occurred'): never {
    if (error instanceof Error) {
      console.error(`Service error: ${error.message}`);
      throw error;
    }
    
    console.error(`Service error: ${defaultMessage}`);
    throw new Error(defaultMessage);
  }
}
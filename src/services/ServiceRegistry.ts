import { HttpClient } from './http/HttpClient';
import { IService } from './base/BaseService';
import { IUserService, UserService } from './user/UserService';
import { DataItem, DataService, IDataService } from './data/DataService';

/**
 * Service registry for managing and accessing application services
 */
export class ServiceRegistry {
  private static instance: ServiceRegistry;
  private services: Map<string, IService>;
  private httpClient: HttpClient;
  
  /**
   * Creates a new ServiceRegistry instance
   * 
   * @param apiBaseUrl - The base URL for API requests
   */
  private constructor(apiBaseUrl: string = '') {
    this.services = new Map<string, IService>();
    this.httpClient = new HttpClient(apiBaseUrl);
    
    // Register core services
    this.registerUserService();
  }
  
  /**
   * Gets the singleton instance of the ServiceRegistry
   * 
   * @param apiBaseUrl - The base URL for API requests (only used on first call)
   */
  public static getInstance(apiBaseUrl: string = ''): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry(apiBaseUrl);
    }
    return ServiceRegistry.instance;
  }
  
  /**
   * Initializes all registered services
   */
  public async initialize(): Promise<void> {
    const initPromises: Promise<void>[] = [];
    
    for (const service of this.services.values()) {
      initPromises.push(service.initialize());
    }
    
    await Promise.all(initPromises);
  }
  
  /**
   * Gets the user service
   */
  public getUserService(): IUserService {
    return this.getService<IUserService>('userService');
  }
  
  /**
   * Gets a data service for the specified entity type
   * 
   * @param entityType - The entity type (used as the API path)
   */
  public getDataService<T extends DataItem>(entityType: string): IDataService<T> {
    const serviceKey = `dataService:${entityType}`;
    
    if (!this.services.has(serviceKey)) {
      const dataService = new DataService<T>(this.httpClient, `/${entityType}`);
      this.registerService(serviceKey, dataService);
    }
    
    return this.getService<IDataService<T>>(serviceKey);
  }
  
  /**
   * Registers a service with the registry
   * 
   * @param key - The service key
   * @param service - The service instance
   */
  public registerService<T extends IService>(key: string, service: T): void {
    this.services.set(key, service);
  }
  
  /**
   * Gets a service from the registry
   * 
   * @param key - The service key
   */
  public getService<T extends IService>(key: string): T {
    const service = this.services.get(key);
    
    if (!service) {
      throw new Error(`Service with key '${key}' not found in registry`);
    }
    
    return service as T;
  }
  
  /**
   * Registers the user service
   */
  private registerUserService(): void {
    const userService = new UserService(this.httpClient);
    this.registerService('userService', userService);
  }
}

/**
 * Helper function to get the service registry instance
 * 
 * @param apiBaseUrl - The base URL for API requests (only used on first call)
 */
export const getServiceRegistry = (apiBaseUrl: string = ''): ServiceRegistry => {
  return ServiceRegistry.getInstance(apiBaseUrl);
};
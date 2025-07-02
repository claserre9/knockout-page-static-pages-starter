import { observable, observableArray } from 'knockout';
import { BaseService, IService } from '../base/BaseService';
import { HttpClient } from '../http/HttpClient';

/**
 * Generic data item interface
 */
export interface DataItem {
  id: string;
  [key: string]: unknown;
}

/**
 * Data service interface for generic CRUD operations
 */
export interface IDataService<T extends DataItem> extends IService {
  /**
   * Gets all items
   * 
   * @param params - Optional query parameters
   */
  getAll(params?: Record<string, string>): Promise<T[]>;
  
  /**
   * Gets an item by ID
   * 
   * @param id - The item ID
   */
  getById(id: string): Promise<T>;
  
  /**
   * Creates a new item
   * 
   * @param item - The item to create
   */
  create(item: Omit<T, 'id'>): Promise<T>;
  
  /**
   * Updates an item
   * 
   * @param id - The item ID
   * @param item - The updated item data
   */
  update(id: string, item: Partial<T>): Promise<T>;
  
  /**
   * Deletes an item
   * 
   * @param id - The item ID
   */
  delete(id: string): Promise<void>;
  
  /**
   * KnockoutObservable array of items
   */
  readonly items: KnockoutObservable<T[]>;
  
  /**
   * KnockoutObservable loading state
   */
  readonly isLoading: KnockoutObservable<boolean>;
}

/**
 * Generic data service implementation for CRUD operations
 */
export class DataService<T extends DataItem> extends BaseService implements IDataService<T> {
  private readonly apiPath: string;
  public readonly items: KnockoutObservable<T[]>;
  public readonly isLoading: KnockoutObservable<boolean>;
  
  /**
   * Creates a new DataService instance
   * 
   * @param httpClient - The HTTP client to use for API requests
   * @param apiPath - The API path for this data type
   */
  constructor(httpClient: HttpClient, apiPath: string) {
    super(httpClient);
    this.apiPath = apiPath;
    this.items = observableArray<T>([]);
    this.isLoading = observable<boolean>(false);
  }
  
  /**
   * Initializes the service by loading all items
   */
  public async initialize(): Promise<void> {
    try {
      const items = await this.getAll();
      this.items(items);
    } catch (error) {
      console.error(`Failed to initialize data service for ${this.apiPath}:`, error);
      this.items([]);
    }
  }
  
  /**
   * Gets all items
   * 
   * @param params - Optional query parameters
   */
  public async getAll(params?: Record<string, string>): Promise<T[]> {
    this.isLoading(true);
    
    try {
      let url = this.apiPath;
      
      // Add query parameters if provided
      if (params && Object.keys(params).length > 0) {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          queryParams.append(key, value);
        });
        url = `${url}?${queryParams.toString()}`;
      }
      
      const response = await this.httpClient.get<T[]>(url);
      return response.data;
    } catch (error) {
      return this.handleError(error, `Failed to get items from ${this.apiPath}`);
    } finally {
      this.isLoading(false);
    }
  }
  
  /**
   * Gets an item by ID
   * 
   * @param id - The item ID
   */
  public async getById(id: string): Promise<T> {
    this.isLoading(true);
    
    try {
      const response = await this.httpClient.get<T>(`${this.apiPath}/${id}`);
      return response.data;
    } catch (error) {
      return this.handleError(error, `Failed to get item with ID ${id}`);
    } finally {
      this.isLoading(false);
    }
  }
  
  /**
   * Creates a new item
   * 
   * @param item - The item to create
   */
  public async create(item: Omit<T, 'id'>): Promise<T> {
    this.isLoading(true);
    
    try {
      const response = await this.httpClient.post<T>(this.apiPath, item);
      const newItem = response.data;
      
      // Update the items array
      const currentItems = this.items();
      this.items([...currentItems, newItem]);
      
      return newItem;
    } catch (error) {
      return this.handleError(error, 'Failed to create item');
    } finally {
      this.isLoading(false);
    }
  }
  
  /**
   * Updates an item
   * 
   * @param id - The item ID
   * @param item - The updated item data
   */
  public async update(id: string, item: Partial<T>): Promise<T> {
    this.isLoading(true);
    
    try {
      const response = await this.httpClient.put<T>(`${this.apiPath}/${id}`, item);
      const updatedItem = response.data;
      
      // Update the items array
      const currentItems = this.items();
      const updatedItems = currentItems.map(existingItem => 
        existingItem.id === id ? updatedItem : existingItem
      );
      this.items(updatedItems);
      
      return updatedItem;
    } catch (error) {
      return this.handleError(error, `Failed to update item with ID ${id}`);
    } finally {
      this.isLoading(false);
    }
  }
  
  /**
   * Deletes an item
   * 
   * @param id - The item ID
   */
  public async delete(id: string): Promise<void> {
    this.isLoading(true);
    
    try {
      await this.httpClient.delete(`${this.apiPath}/${id}`);
      
      // Update the items array
      const currentItems = this.items();
      const updatedItems = currentItems.filter(item => item.id !== id);
      this.items(updatedItems);
    } catch (error) {
      this.handleError(error, `Failed to delete item with ID ${id}`);
    } finally {
      this.isLoading(false);
    }
  }
}
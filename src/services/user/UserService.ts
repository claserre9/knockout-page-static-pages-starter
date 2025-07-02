import { observable} from 'knockout';
import { BaseService, IService } from '../base/BaseService';
import { HttpClient, HttpResponse } from '../http/HttpClient';

/**
 * User model interface
 */
export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
}

/**
 * User service interface
 */
export interface IUserService extends IService {
  /**
   * Gets the current user
   */
  getCurrentUser(): Promise<User | null>;
  
  /**
   * Gets a user by ID
   * 
   * @param id - The user ID
   */
  getUserById(id: string): Promise<User>;
  
  /**
   * Gets all users
   */
  getUsers(): Promise<User[]>;
  
  /**
   * Creates a new user
   * 
   * @param user - The user to create
   */
  createUser(user: Omit<User, 'id'>): Promise<User>;
  
  /**
   * Updates a user
   * 
   * @param id - The user ID
   * @param user - The updated user data
   */
  updateUser(id: string, user: Partial<User>): Promise<User>;
  
  /**
   * Deletes a user
   * 
   * @param id - The user ID
   */
  deleteUser(id: string): Promise<void>;
  
  /**
   * KnockoutObservable for the current user
   */
  readonly currentUser: KnockoutObservable<User | null>;
}

/**
 * User service implementation
 */
export class UserService extends BaseService implements IUserService {
  private readonly apiPath = '/users';
  public readonly currentUser: KnockoutObservable<User | null>;
  
  /**
   * Creates a new UserService instance
   * 
   * @param httpClient - The HTTP client to use for API requests
   */
  constructor(httpClient: HttpClient) {
    super(httpClient);
    this.currentUser = observable<User | null>(null);
  }
  
  /**
   * Initializes the service by loading the current user
   */
  public async initialize(): Promise<void> {
    try {
      const user = await this.getCurrentUser();
      this.currentUser(user);
    } catch (error) {
      console.error('Failed to initialize user service:', error);
      this.currentUser(null);
    }
  }
  
  /**
   * Gets the current user
   */
  public async getCurrentUser(): Promise<User | null> {
    try {
      const response = await this.httpClient.get<User>(`${this.apiPath}/me`);
      return response.data;
    } catch (error) {
      // Don't throw for 401/403 errors, just return null
      if (error instanceof Error && 
          'status' in error && 
          (error.status === 401 || error.status === 403)) {
        return null;
      }
      return this.handleError(error, 'Failed to get current user');
    }
  }
  
  /**
   * Gets a user by ID
   * 
   * @param id - The user ID
   */
  public async getUserById(id: string): Promise<User> {
    try {
      const response = await this.httpClient.get<User>(`${this.apiPath}/${id}`);
      return response.data;
    } catch (error) {
      return this.handleError(error, `Failed to get user with ID ${id}`);
    }
  }
  
  /**
   * Gets all users
   */
  public async getUsers(): Promise<User[]> {
    try {
      const response = await this.httpClient.get<User[]>(this.apiPath);
      return response.data;
    } catch (error) {
      return this.handleError(error, 'Failed to get users');
    }
  }
  
  /**
   * Creates a new user
   * 
   * @param user - The user to create
   */
  public async createUser(user: Omit<User, 'id'>): Promise<User> {
    try {
      const response = await this.httpClient.post<User>(this.apiPath, user);
      return response.data;
    } catch (error) {
      return this.handleError(error, 'Failed to create user');
    }
  }
  
  /**
   * Updates a user
   * 
   * @param id - The user ID
   * @param user - The updated user data
   */
  public async updateUser(id: string, user: Partial<User>): Promise<User> {
    try {
      const response = await this.httpClient.put<User>(`${this.apiPath}/${id}`, user);
      
      // Update current user if this is the current user
      const currentUser = this.currentUser();
      if (currentUser && currentUser.id === id) {
        this.currentUser({...currentUser, ...response.data});
      }
      
      return response.data;
    } catch (error) {
      return this.handleError(error, `Failed to update user with ID ${id}`);
    }
  }
  
  /**
   * Deletes a user
   * 
   * @param id - The user ID
   */
  public async deleteUser(id: string): Promise<void> {
    try {
      await this.httpClient.delete(`${this.apiPath}/${id}`);
      
      // Clear current user if this is the current user
      const currentUser = this.currentUser();
      if (currentUser && currentUser.id === id) {
        this.currentUser(null);
      }
    } catch (error) {
      this.handleError(error, `Failed to delete user with ID ${id}`);
    }
  }
}
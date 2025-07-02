import { observable, observableArray } from 'knockout';
import { BaseViewModel } from '../core/BaseViewModel';
import { getServiceRegistry } from '../services/ServiceRegistry';
import { User } from '../services/user/UserService';

/**
 * View model for displaying a list of users
 */
export class UserListViewModel extends BaseViewModel {
  public users = observableArray<User>([]);
  public isLoading = observable<boolean>(false);
  public errorMessage = observable<string>('');
  
  /**
   * Creates a new UserListViewModel instance
   * 
   * @param context - The page context
   */
  constructor(context: PageJS.Context | undefined) {
    super(context);
    
    // Set the template
    this.setTemplate(`
      <div class="user-list">
        <h1>Users</h1>
        
        <!-- Loading indicator -->
        <div data-bind="visible: isLoading" class="loading">
          Loading users...
        </div>
        
        <!-- Error message -->
        <div data-bind="visible: errorMessage, text: errorMessage" class="error"></div>
        
        <!-- User list -->
        <ul data-bind="visible: users().length > 0 && !isLoading(), foreach: users">
          <li>
            <strong data-bind="text: username"></strong>
            <span data-bind="text: email"></span>
            <button data-bind="click: $parent.deleteUser.bind($parent, id)">Delete</button>
          </li>
        </ul>
        
        <!-- Empty state -->
        <div data-bind="visible: users().length === 0 && !isLoading() && !errorMessage()">
          No users found.
        </div>
      </div>
    `);
  }
  
  /**
   * Called after the template has been rendered
   */
  protected onTemplateRendered(): void {
    // Load users when the view is rendered
    this.loadUsers();
  }
  
  /**
   * Loads the list of users from the API
   */
  public async loadUsers(): Promise<void> {
    this.isLoading(true);
    this.errorMessage('');
    
    try {
      // Get the user service from the registry
      const userService = getServiceRegistry().getUserService();
      
      // Load users
      const users = await userService.getUsers();
      this.users(users);
    } catch (error) {
      console.error('Failed to load users:', error);
      this.errorMessage('Failed to load users. Please try again later.');
    } finally {
      this.isLoading(false);
    }
  }
  
  /**
   * Deletes a user
   * 
   * @param userId - The ID of the user to delete
   */
  public async deleteUser(userId: string): Promise<void> {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }
    
    this.isLoading(true);
    this.errorMessage('');
    
    try {
      // Get the user service from the registry
      const userService = getServiceRegistry().getUserService();
      
      // Delete the user
      await userService.deleteUser(userId);
      
      // Remove the user from the list
      const updatedUsers = this.users().filter(user => user.id !== userId);
      this.users(updatedUsers);
    } catch (error) {
      console.error('Failed to delete user:', error);
      this.errorMessage('Failed to delete user. Please try again later.');
    } finally {
      this.isLoading(false);
    }
  }
}
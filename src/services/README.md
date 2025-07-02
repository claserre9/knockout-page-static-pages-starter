# Service Layer

This directory contains the service layer for the application, which is responsible for handling API calls and business logic.

## Architecture

The service layer is organized into the following components:

### HTTP Client

The `HttpClient` class in `http/HttpClient.ts` provides a robust HTTP client for making API requests. It includes features like:

- Support for all common HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Retry mechanism for failed requests
- Timeout handling
- Error handling with custom HttpError class
- Loading state tracking with Knockout observables
- Response parsing based on content type

### Base Service

The `BaseService` class in `base/BaseService.ts` provides common functionality for all services, including:

- Integration with the HttpClient for API requests
- Error handling
- Initialization

### Service Interfaces

Each service has an interface that defines its contract, ensuring consistency and type safety. For example:

- `IService` - Base interface for all services
- `IUserService` - Interface for user-related operations
- `IDataService<T>` - Generic interface for CRUD operations on data items

### Service Implementations

Concrete service implementations provide the actual business logic and API calls. For example:

- `UserService` - Handles user-related operations
- `DataService<T>` - Generic service for CRUD operations on data items

### Service Registry

The `ServiceRegistry` class in `ServiceRegistry.ts` provides a centralized way to access all services in the application. It:

- Uses the singleton pattern for global access
- Provides lazy initialization of services
- Shares a single HttpClient instance among all services
- Offers helper methods for common services

## Usage

### Accessing Services

To access a service, use the `getServiceRegistry` function:

```typescript
import { getServiceRegistry } from '../services/ServiceRegistry';

// Get the user service
const userService = getServiceRegistry().getUserService();

// Get a data service for a specific entity type
const productService = getServiceRegistry<Product>('products');
```

### Using Services in View Models

Here's an example of using the user service in a view model:

```typescript
import { observable } from 'knockout';
import { BaseViewModel } from '../core/BaseViewModel';
import { getServiceRegistry } from '../services/ServiceRegistry';
import { User } from '../services/user/UserService';

export class UserProfileViewModel extends BaseViewModel {
  public user = observable<User | null>(null);
  public isLoading = observable<boolean>(false);
  
  constructor(context: PageJS.Context | undefined) {
    super(context);
    this.loadUser();
  }
  
  private async loadUser(): Promise<void> {
    this.isLoading(true);
    
    try {
      const userService = getServiceRegistry().getUserService();
      const user = await userService.getCurrentUser();
      this.user(user);
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      this.isLoading(false);
    }
  }
}
```

### Creating a New Service

To create a new service:

1. Define an interface for the service
2. Create a class that extends `BaseService` and implements the interface
3. Register the service in the `ServiceRegistry` if needed

For example:

```typescript
// AuthService.ts
import { BaseService, IService } from '../base/BaseService';
import { HttpClient } from '../http/HttpClient';

export interface AuthCredentials {
  username: string;
  password: string;
}

export interface AuthToken {
  token: string;
  expiresAt: string;
}

export interface IAuthService extends IService {
  login(credentials: AuthCredentials): Promise<AuthToken>;
  logout(): Promise<void>;
  isAuthenticated(): boolean;
}

export class AuthService extends BaseService implements IAuthService {
  private token: AuthToken | null = null;
  
  constructor(httpClient: HttpClient) {
    super(httpClient);
  }
  
  public async login(credentials: AuthCredentials): Promise<AuthToken> {
    try {
      const response = await this.httpClient.post<AuthToken>('/auth/login', credentials);
      this.token = response.data;
      return this.token;
    } catch (error) {
      return this.handleError(error, 'Login failed');
    }
  }
  
  public async logout(): Promise<void> {
    try {
      await this.httpClient.post('/auth/logout');
      this.token = null;
    } catch (error) {
      this.handleError(error, 'Logout failed');
    }
  }
  
  public isAuthenticated(): boolean {
    if (!this.token) {
      return false;
    }
    
    const expiresAt = new Date(this.token.expiresAt).getTime();
    return Date.now() < expiresAt;
  }
}

// Register in ServiceRegistry
private registerAuthService(): void {
  const authService = new AuthService(this.httpClient);
  this.registerService('authService', authService);
}

// Add getter method
public getAuthService(): IAuthService {
  return this.getService<IAuthService>('authService');
}
```

## Testing

The service layer includes unit tests to ensure it works correctly. For example, `HttpClient.test.ts` tests the HTTP client functionality.

To run the tests:

```bash
npm test
```
import { observable } from 'knockout';

/**
 * Configuration options for HTTP requests
 */
export interface HttpRequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

/**
 * HTTP response interface
 */
export interface HttpResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
  ok: boolean;
}

/**
 * HTTP error interface
 */
export class HttpError extends Error {
  public status: number;
  public response: Response | null;

  constructor(message: string, status: number, response: Response | null = null) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.response = response;
  }
}

/**
 * HTTP client for making API requests
 */
export class HttpClient {
  private baseUrl: string;
  private defaultOptions: HttpRequestOptions;
  public isLoading: KnockoutObservable<boolean>;

  /**
   * Creates a new HttpClient instance
   * 
   * @param baseUrl - The base URL for all requests
   * @param defaultOptions - Default options for all requests
   */
  constructor(baseUrl: string = '', defaultOptions: HttpRequestOptions = {}) {
    this.baseUrl = baseUrl;
    this.defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000, // 30 seconds
      retries: 1,
      retryDelay: 1000,
      ...defaultOptions
    };
    this.isLoading = observable(false);
  }

  /**
   * Makes a GET request
   * 
   * @param url - The URL to request
   * @param options - Request options
   * @returns Promise with the response data
   */
  public async get<T>(url: string, options?: HttpRequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>('GET', url, undefined, options);
  }

  /**
   * Makes a POST request
   * 
   * @param url - The URL to request
   * @param data - The data to send
   * @param options - Request options
   * @returns Promise with the response data
   */
  public async post<T>(url: string, data?: unknown, options?: HttpRequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>('POST', url, data, options);
  }

  /**
   * Makes a PUT request
   * 
   * @param url - The URL to request
   * @param data - The data to send
   * @param options - Request options
   * @returns Promise with the response data
   */
  public async put<T>(url: string, data?: unknown, options?: HttpRequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>('PUT', url, data, options);
  }

  /**
   * Makes a PATCH request
   * 
   * @param url - The URL to request
   * @param data - The data to send
   * @param options - Request options
   * @returns Promise with the response data
   */
  public async patch<T>(url: string, data?: unknown, options?: HttpRequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>('PATCH', url, data, options);
  }

  /**
   * Makes a DELETE request
   * 
   * @param url - The URL to request
   * @param options - Request options
   * @returns Promise with the response data
   */
  public async delete<T>(url: string, options?: HttpRequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>('DELETE', url, undefined, options);
  }

  /**
   * Makes an HTTP request with retry capability
   * 
   * @param method - The HTTP method
   * @param url - The URL to request
   * @param data - The data to send
   * @param options - Request options
   * @returns Promise with the response data
   */
  private async request<T>(
    method: string,
    url: string,
    data?: unknown,
    options?: HttpRequestOptions
  ): Promise<HttpResponse<T>> {
    const mergedOptions = { ...this.defaultOptions, ...options };
    const { retries = 1, retryDelay = 1000 } = mergedOptions;
    
    this.isLoading(true);
    
    try {
      return await this.executeRequestWithRetries<T>(method, url, data, mergedOptions, retries, retryDelay);
    } finally {
      this.isLoading(false);
    }
  }

  /**
   * Executes a request with retry logic
   */
  private async executeRequestWithRetries<T>(
    method: string,
    url: string,
    data?: unknown,
    options?: HttpRequestOptions,
    retriesLeft: number = 1,
    retryDelay: number = 1000
  ): Promise<HttpResponse<T>> {
    try {
      return await this.executeRequest<T>(method, url, data, options);
    } catch (error) {
      if (retriesLeft <= 0 || !this.shouldRetry(error)) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      
      // Retry the request
      return this.executeRequestWithRetries<T>(
        method, 
        url, 
        data, 
        options, 
        retriesLeft - 1,
        retryDelay
      );
    }
  }

  /**
   * Determines if a request should be retried based on the error
   */
  private shouldRetry(error: unknown): boolean {
    if (error instanceof HttpError) {
      // Retry on network errors or 5xx server errors
      return error.status === 0 || (error.status >= 500 && error.status < 600);
    }
    return false;
  }

  /**
   * Executes a single HTTP request
   */
  private async executeRequest<T>(
    method: string,
    url: string,
    data?: unknown,
    options?: HttpRequestOptions
  ): Promise<HttpResponse<T>> {
    const fullUrl = this.buildUrl(url);
    const { headers, timeout } = options || {};

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout || 30000);

    try {
      const response = await fetch(fullUrl, {
        method,
        headers: {
          ...this.defaultOptions.headers,
          ...headers
        },
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal
      });

      // Parse response headers
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      if (!response.ok) {
        throw new HttpError(
          `Request failed with status ${response.status}`,
          response.status,
          response
        );
      }

      // Parse response based on content type
      let responseData: T;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        responseData = await response.json();
      } else if (contentType?.includes('text/')) {
        responseData = await response.text() as unknown as T;
      } else {
        // Handle other content types or binary data
        responseData = await response.blob() as unknown as T;
      }

      return {
        data: responseData,
        status: response.status,
        headers: responseHeaders,
        ok: response.ok
      };
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new HttpError('Request timeout', 0);
      }
      
      throw new HttpError(
        error instanceof Error ? error.message : 'Unknown error',
        0
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Builds a full URL from the base URL and path
   */
  private buildUrl(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    const baseUrl = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    
    return `${baseUrl}${normalizedPath}`;
  }
}
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HttpClient, HttpError } from '../../../src/services/http/HttpClient';

// Mock fetch API
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock Response constructor
global.Response = vi.fn() as any;

// Helper to create mock responses
const createMockResponse = (status: number, data: any, headers: Record<string, string> = {}) => {
  const headersMap = new Map();
  Object.entries(headers).forEach(([key, value]) => {
    headersMap.set(key, value);
  });
  
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(data),
    text: vi.fn().mockResolvedValue(typeof data === 'string' ? data : JSON.stringify(data)),
    blob: vi.fn().mockResolvedValue(new Blob()),
    headers: {
      get: (key: string) => headers[key] || null,
      forEach: (callback: (value: string, key: string) => void) => {
        Object.entries(headers).forEach(([key, value]) => callback(value, key));
      }
    }
  };
};

describe('HttpClient', () => {
  let httpClient: HttpClient;
  
  beforeEach(() => {
    httpClient = new HttpClient('https://api.example.com');
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.resetAllMocks();
  });
  
  it('should create an instance with default options', () => {
    expect(httpClient).toBeDefined();
  });
  
  it('should make a GET request', async () => {
    const mockData = { id: '1', name: 'Test' };
    const mockResponse = createMockResponse(200, mockData, { 'content-type': 'application/json' });
    mockFetch.mockResolvedValueOnce(mockResponse);
    
    const response = await httpClient.get('/users/1');
    
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/users/1',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        })
      })
    );
    expect(response.data).toEqual(mockData);
    expect(response.status).toBe(200);
    expect(response.ok).toBe(true);
  });
  
  it('should make a POST request with data', async () => {
    const requestData = { name: 'New User', email: 'user@example.com' };
    const responseData = { id: '2', ...requestData };
    const mockResponse = createMockResponse(201, responseData, { 'content-type': 'application/json' });
    mockFetch.mockResolvedValueOnce(mockResponse);
    
    const response = await httpClient.post('/users', requestData);
    
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/users',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(requestData)
      })
    );
    expect(response.data).toEqual(responseData);
    expect(response.status).toBe(201);
  });
  
  it('should handle error responses', async () => {
    const errorResponse = createMockResponse(404, { error: 'Not found' });
    mockFetch.mockResolvedValueOnce(errorResponse);
    
    await expect(httpClient.get('/users/999')).rejects.toThrow(HttpError);
    await expect(httpClient.get('/users/999')).rejects.toMatchObject({
      status: 404,
      message: expect.stringContaining('404')
    });
  });
  
  it('should retry failed requests', async () => {
    const errorResponse = createMockResponse(500, { error: 'Server error' });
    const successResponse = createMockResponse(200, { id: '1', name: 'Test' }, { 'content-type': 'application/json' });
    
    // First call fails, second call succeeds
    mockFetch.mockResolvedValueOnce(errorResponse);
    mockFetch.mockResolvedValueOnce(successResponse);
    
    const response = await httpClient.get('/users/1', { retries: 1 });
    
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(response.data).toEqual({ id: '1', name: 'Test' });
  });
  
  it('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    
    await expect(httpClient.get('/users/1')).rejects.toThrow(HttpError);
    await expect(httpClient.get('/users/1')).rejects.toMatchObject({
      status: 0,
      message: 'Network error'
    });
  });
  
  it('should handle timeout errors', async () => {
    // Mock AbortController
    const abortController = {
      signal: 'mock-signal',
      abort: vi.fn()
    };
    vi.spyOn(global, 'AbortController').mockImplementation(() => abortController as any);
    
    // Mock setTimeout to trigger abort immediately
    vi.spyOn(global, 'setTimeout').mockImplementation((callback) => {
      callback();
      return 123 as any;
    });
    
    // Mock DOMException for AbortError
    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';
    mockFetch.mockRejectedValueOnce(abortError);
    
    await expect(httpClient.get('/users/1', { timeout: 1000 })).rejects.toThrow(HttpError);
    await expect(httpClient.get('/users/1', { timeout: 1000 })).rejects.toMatchObject({
      status: 0,
      message: 'Request timeout'
    });
    
    expect(abortController.abort).toHaveBeenCalled();
  });
  
  it('should parse different content types correctly', async () => {
    // JSON response
    const jsonData = { id: '1', name: 'Test' };
    const jsonResponse = createMockResponse(200, jsonData, { 'content-type': 'application/json' });
    mockFetch.mockResolvedValueOnce(jsonResponse);
    
    const jsonResult = await httpClient.get('/data.json');
    expect(jsonResult.data).toEqual(jsonData);
    
    // Text response
    const textData = 'Hello, world!';
    const textResponse = createMockResponse(200, textData, { 'content-type': 'text/plain' });
    mockFetch.mockResolvedValueOnce(textResponse);
    
    const textResult = await httpClient.get('/data.txt');
    expect(textResult.data).toEqual(textData);
    
    // Binary response
    const blobResponse = createMockResponse(200, null, { 'content-type': 'image/png' });
    mockFetch.mockResolvedValueOnce(blobResponse);
    
    const blobResult = await httpClient.get('/image.png');
    expect(blobResult.data).toBeInstanceOf(Blob);
  });
});
/**
 * API Client with automatic authentication header injection
 */

interface RequestConfig extends RequestInit {
  skipAuth?: boolean; // Optional flag to skip auth for public endpoints
}

/**
 * Fetch wrapper that automatically adds Authorization header
 */
export const apiClient = async (url: string, config: RequestConfig = {}): Promise<Response> => {
  const { skipAuth = false, headers = {}, ...restConfig } = config;

  // Get token from localStorage
  const token = localStorage.getItem('token');
  console.log(`[API Client] ${restConfig.method || 'GET'} ${url} - Token exists:`, !!token, 'Skip auth:', skipAuth);

  // Build headers
  const finalHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Add Authorization header if token exists and not skipped
  if (token && !skipAuth) {
    (finalHeaders as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    console.log('[API Client] Added Authorization header');
  }

  // Make the request
  return fetch(url, {
    ...restConfig,
    headers: finalHeaders,
  });
};

/**
 * Convenience methods for common HTTP verbs
 */
export const api = {
  get: (url: string, config?: RequestConfig) => 
    apiClient(url, { ...config, method: 'GET' }),
  
  post: (url: string, data?: unknown, config?: RequestConfig) =>
    apiClient(url, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  put: (url: string, data?: unknown, config?: RequestConfig) =>
    apiClient(url, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  patch: (url: string, data?: unknown, config?: RequestConfig) =>
    apiClient(url, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  delete: (url: string, config?: RequestConfig) =>
    apiClient(url, { ...config, method: 'DELETE' }),
};

/**
 * Custom API Error class that preserves status code
 */
export class ApiError extends Error {
  status: number;
  response?: unknown;

  constructor(message: string, status: number, response?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.response = response;
  }
}

/**
 * Helper to handle JSON responses
 */
export const handleResponse = async <T = unknown>(response: Response): Promise<T> => {
  // Check content type to determine if response is JSON
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');

  if (!response.ok) {
    let errorData;
    let message;
    
    if (isJson) {
      errorData = await response.json().catch(() => ({ message: 'Request failed' }));
      message = errorData.message || `HTTP error! status: ${response.status}`;
    } else {
      // If not JSON (e.g., HTML error page), use the status text
      const textResponse = await response.text().catch(() => 'Unknown error');
      message = `API error: ${response.status} ${response.statusText}`;
      errorData = { message, htmlResponse: textResponse.substring(0, 200) };
    }
    
    throw new ApiError(message, response.status, errorData);
  }
  
  // For successful responses, parse JSON if it's JSON content
  if (isJson) {
    return response.json();
  } else {
    // If successful but not JSON, return the text or throw error
    const text = await response.text();
    throw new ApiError('Expected JSON response but received: ' + contentType, response.status, { text: text.substring(0, 200) });
  }
};


// API utility functions with OAuth Bearer token and x-apikey for Haleon Apigee
const OAUTH_URL = 'https://haleon-api-dev.apigee.net/oauth/v2/client_credential/accesstoken';
const API_BASE_URL = 'https://haleon-api-dev.apigee.net/Sustainibility-portal-channel/v1';
const CLIENT_ID = 'bGMxYSqsNUb6F88L9rTY3OOMCynzZKAF';
const CLIENT_SECRET = 'CQTNIAhIOfkigv5m';
const X_API_KEY = 'bGMxYSqsNUb6F88L9rTY3OOMCynzZKAF';

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  issued_at: string;
}

interface TokenData {
  token: string;
  expiresAt: number;
}

class TokenManager {
  private static instance: TokenManager;
  private tokenData: TokenData | null = null;

  private constructor() {}

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  private async fetchNewToken(): Promise<string> {
    const credentials = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
    
    const response = await fetch(`${OAUTH_URL}?grant_type=client_credentials`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.status} ${response.statusText}`);
    }

    const tokenResponse: TokenResponse = await response.json();
    
    // Calculate expiration time (subtract 60 seconds buffer)
    const expiresAt = Date.now() + (tokenResponse.expires_in - 60) * 1000;
    
    this.tokenData = {
      token: tokenResponse.access_token,
      expiresAt
    };

    return tokenResponse.access_token;
  }

  async getValidToken(): Promise<string> {
    // Check if we have a valid token
    if (this.tokenData && Date.now() < this.tokenData.expiresAt) {
      return this.tokenData.token;
    }

    // Token expired or doesn't exist, fetch new one
    return this.fetchNewToken();
  }

  clearToken(): void {
    this.tokenData = null;
  }
}

// Helper function to create headers with Authorization and x-apikey
const createHeaders = async (contentType?: string): Promise<HeadersInit> => {
  const tokenManager = TokenManager.getInstance();
  const token = await tokenManager.getValidToken();
  
  const headers: HeadersInit = {
    'Authorization': `Bearer ${token}`,
    'x-apikey': X_API_KEY
  };
  
  if (contentType) {
    headers['Content-Type'] = contentType;
  }
  
  return headers;
};

// GET request helper
export const apiGet = async (endpoint: string): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'GET',
    headers: await createHeaders()
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// POST request helper
export const apiPost = async (endpoint: string, data: any, contentType: string = 'application/json'): Promise<any> => {
  const body = contentType === 'application/json' ? JSON.stringify(data) : data;
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: await createHeaders(contentType),
    body
  });
  
  if (!response.ok) {
    // Try to get the error message from the response
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = `${errorMessage} - ${errorData.message}`;
      }
    } catch (e) {
      // If we can't parse the response, use the status text
      errorMessage = `${errorMessage} - ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }
  
  return response.json();
};

// PUT request helper
export const apiPut = async (endpoint: string, data: any, contentType: string = 'application/json'): Promise<any> => {
  const body = contentType === 'application/json' ? JSON.stringify(data) : data;
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'PUT',
    headers: await createHeaders(contentType),
    body
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// PATCH request helper
export const apiPatch = async (endpoint: string, data: any): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'PATCH',
    headers: await createHeaders('application/json'),
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// DELETE request helper
export const apiDelete = async (endpoint: string): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'DELETE',
    headers: await createHeaders()
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// For FormData requests (no Content-Type header needed)
export const apiPostFormData = async (endpoint: string, formData: FormData): Promise<any> => {
  const tokenManager = TokenManager.getInstance();
  const token = await tokenManager.getValidToken();
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-apikey': X_API_KEY
    },
    body: formData
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

export const apiPutFormData = async (endpoint: string, formData: FormData): Promise<any> => {
  const tokenManager = TokenManager.getInstance();
  const token = await tokenManager.getValidToken();
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-apikey': X_API_KEY
    },
    body: formData
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// Utility function to manually refresh token (useful for testing or manual token refresh)
export const refreshToken = async (): Promise<string> => {
  const tokenManager = TokenManager.getInstance();
  tokenManager.clearToken();
  return tokenManager.getValidToken();
};

// Export token manager for advanced usage if needed
export const tokenManager = TokenManager.getInstance(); 
import { request } from '@playwright/test';

export class BaseApiClient {
  constructor(baseURL, apiKey = null, readAccessToken = null) {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
    this.readAccessToken = readAccessToken;
    this.defaultHeaders = this._buildDefaultHeaders();
  }

  _buildDefaultHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (this.readAccessToken) {
      headers['Authorization'] = `Bearer ${this.readAccessToken}`;
    }

    return headers;
  }

  async _createContext() {
    return await request.newContext({
      baseURL: this.baseURL,
      extraHTTPHeaders: this.defaultHeaders
    });
  }

  _buildUrl(endpoint, queryParams = {}) {
    const cleanBaseUrl = this.baseURL.replace(/\/+$/, '');
    const cleanEndpoint = endpoint.replace(/^\/+/, '');
    const fullUrl = `${cleanBaseUrl}/${cleanEndpoint}`;
    
    const url = new URL(fullUrl);
    
    // use api key if no bearer token
    if (this.apiKey && !this.readAccessToken) {
      queryParams.api_key = this.apiKey;
    }

    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] !== undefined && queryParams[key] !== null) {
        url.searchParams.append(key, queryParams[key]);
      }
    });

    return url.toString();
  }

  async get(endpoint, queryParams = {}, headers = {}) {
    const context = await this._createContext();
    const url = this._buildUrl(endpoint, queryParams);
    const startTime = Date.now();

    try {
      const response = await context.get(url, { headers });
      const data = await this._parseResponse(response);
      const duration = Date.now() - startTime;
      
      return {
        status: response.status(),
        statusText: response.statusText(),
        headers: response.headers(),
        data: data,
        duration: duration,
        ok: response.ok()
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      throw new Error(
        `GET ${endpoint} failed after ${duration}ms: ${error.message}`
      );
    } finally {
      await context.dispose();
    }
  }

  async post(endpoint, body = {}, queryParams = {}, headers = {}) {
    const context = await this._createContext();
    const url = this._buildUrl(endpoint, queryParams);
    const startTime = Date.now();

    try {
      const response = await context.post(url, {
        data: body,
        headers
      });
      const data = await this._parseResponse(response);
      const duration = Date.now() - startTime;

      return {
        status: response.status(),
        statusText: response.statusText(),
        headers: response.headers(),
        data: data,
        duration: duration,
        ok: response.ok()
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      throw new Error(
        `POST ${endpoint} failed after ${duration}ms: ${error.message}`
      );
    } finally {
      await context.dispose();
    }
  }

  async put(endpoint, body = {}, queryParams = {}, headers = {}) {
    const context = await this._createContext();
    const url = this._buildUrl(endpoint, queryParams);
    const startTime = Date.now();

    try {
      const response = await context.put(url, {
        data: body,
        headers
      });
      const data = await this._parseResponse(response);
      const duration = Date.now() - startTime;

      return {
        status: response.status(),
        statusText: response.statusText(),
        headers: response.headers(),
        data: data,
        duration: duration,
        ok: response.ok()
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      throw new Error(
        `PUT ${endpoint} failed after ${duration}ms: ${error.message}`
      );
    } finally {
      await context.dispose();
    }
  }

  async delete(endpoint, queryParams = {}, headers = {}, body = null) {
    const context = await this._createContext();
    const url = this._buildUrl(endpoint, queryParams);
    const startTime = Date.now();

    try {
      const options = { headers };
      
      if (body) {
        options.data = body;
      }
      
      const response = await context.delete(url, options);
      const data = await this._parseResponse(response);
      const duration = Date.now() - startTime;

      return {
        status: response.status(),
        statusText: response.statusText(),
        headers: response.headers(),
        data: data,
        duration: duration,
        ok: response.ok()
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      throw new Error(
        `DELETE ${endpoint} failed after ${duration}ms: ${error.message}`
      );
    } finally {
      await context.dispose();
    }
  }

  async _parseResponse(response) {
    const contentType = response.headers()['content-type'] || '';
    
    if (contentType.includes('application/json')) {
      try {
        return await response.json();
      } catch (error) {
        console.error('Failed to parse JSON response:', error);
        return await response.text();
      }
    }
    
    return await response.text();
  }

  validateStatus(response, expectedStatus) {
    if (response.status !== expectedStatus) {
      throw new Error(
        `Expected status ${expectedStatus}, but got ${response.status}: ${response.statusText}`
      );
    }
  }

  validateRequiredFields(data, requiredFields) {
    const missingFields = requiredFields.filter(field => !(field in data));
    
    if (missingFields.length > 0) {
      throw new Error(
        `Response missing required fields: ${missingFields.join(', ')}`
      );
    }
  }
}

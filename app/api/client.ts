// API Client with error handling and caching

import { handleError } from '../utils/errors';

const API_BASE_URL = 'https://api.coingecko.com/api/v3';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class ApiClient {
  private cache = new Map<string, CacheEntry<any>>();
  private requestTimeout = 10000; // 10 seconds

  /**
   * Fetch with timeout
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeout = this.requestTimeout
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Get from cache if available and not expired
   */
  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`[Cache] Hit for ${key}`);
      return cached.data;
    }
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  /**
   * Set cache
   */
  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Generic GET request
   */
  async get<T>(
    endpoint: string,
    params?: Record<string, any>,
    useCache = true
  ): Promise<T> {
    const cacheKey = `GET:${endpoint}:${JSON.stringify(params)}`;

    // Check cache first
    if (useCache) {
      const cached = this.getFromCache<T>(cacheKey);
      if (cached) return cached;
    }

    const url = new URL(`${API_BASE_URL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    try {
      const response = await this.fetchWithTimeout(url.toString());

      if (!response.ok) {
        throw {
          status: response.status,
          message: `HTTP ${response.status}`,
        };
      }

      const data: T = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`API Error [GET ${endpoint}]:`, error);
      throw handleError(error);
    }
  }

  /**
   * Generic POST request
   */
  async post<T>(
    endpoint: string,
    body?: Record<string, any>
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    try {
      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        throw {
          status: response.status,
          message: `HTTP ${response.status}`,
        };
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [POST ${endpoint}]:`, error);
      throw handleError(error);
    }
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('[Cache] Cleared');
  }

  /**
   * Clear specific cache entry
   */
  clearCacheEntry(key: string): void {
    this.cache.delete(key);
  }
}

export default new ApiClient();

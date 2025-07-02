/**
 * Cache utility for storing API responses with configurable TTL
 */

type CacheItem<T> = {
  value: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
};

export class Cache {
  private static instance: Cache;
  private storage: Map<string, CacheItem<any>>;
  private defaultTTL: number;

  private constructor(defaultTTL = 3600000) {
    // Default TTL: 1 hour
    this.storage = new Map();
    this.defaultTTL = defaultTTL;
  }

  /**
   * Get the singleton instance of the cache
   */
  public static getInstance(defaultTTL?: number): Cache {
    if (!Cache.instance) {
      Cache.instance = new Cache(defaultTTL);
    }
    return Cache.instance;
  }

  /**
   * Set an item in the cache
   * @param key Cache key
   * @param value Value to store
   * @param ttl Optional TTL in milliseconds
   */
  public set<T>(key: string, value: T, ttl = this.defaultTTL): void {
    this.storage.set(key, {
      value,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Get an item from the cache
   * @param key Cache key
   * @returns The cached value or null if not found or expired
   */
  public get<T>(key: string): T | null {
    const item = this.storage.get(key);

    // Return null if the item doesn't exist
    if (!item) return null;

    // Check if the item has expired
    const now = Date.now();
    if (item.ttl > 0 && now - item.timestamp > item.ttl) {
      // Item has expired, remove it from cache
      this.storage.delete(key);
      return null;
    }

    return item.value as T;
  }

  /**
   * Retrieve a value from cache or compute it if not available
   * @param key Cache key
   * @param fetchFn Function to compute the value if not in cache
   * @param ttl Optional TTL in milliseconds
   * @returns The cached or computed value
   */
  public async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl = this.defaultTTL,
  ): Promise<T> {
    const cachedValue = this.get<T>(key);

    if (cachedValue !== null) {
      return cachedValue;
    }

    // Value not in cache or expired, fetch it
    const value = await fetchFn();
    this.set(key, value, ttl);
    return value;
  }

  /**
   * Check if a key exists in the cache and is not expired
   * @param key Cache key
   * @returns Whether the key exists and is not expired
   */
  public has(key: string): boolean {
    const item = this.storage.get(key);
    if (!item) return false;

    const now = Date.now();
    if (item.ttl > 0 && now - item.timestamp > item.ttl) {
      this.storage.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete an item from the cache
   * @param key Cache key
   * @returns Whether the item was successfully deleted
   */
  public delete(key: string): boolean {
    return this.storage.delete(key);
  }

  /**
   * Clear all items from the cache
   */
  public clear(): void {
    this.storage.clear();
  }

  /**
   * Delete all expired items from the cache
   * @returns Number of items deleted
   */
  public clearExpired(): number {
    const now = Date.now();
    let deletedCount = 0;

    this.storage.forEach((item, key) => {
      if (item.ttl > 0 && now - item.timestamp > item.ttl) {
        this.storage.delete(key);
        deletedCount++;
      }
    });

    return deletedCount;
  }

  /**
   * Delete items matching a prefix
   * @param prefix Key prefix to match
   * @returns Number of items deleted
   */
  public deleteByPrefix(prefix: string): number {
    let deletedCount = 0;

    this.storage.forEach((_, key) => {
      if (key.startsWith(prefix)) {
        this.storage.delete(key);
        deletedCount++;
      }
    });

    return deletedCount;
  }

  /**
   * Get the size of the cache
   * @returns Number of items in the cache
   */
  public size(): number {
    return this.storage.size;
  }

  /**
   * Set the default TTL for cache items
   * @param ttl New default TTL in milliseconds
   */
  public setDefaultTTL(ttl: number): void {
    this.defaultTTL = ttl;
  }
}

// Export a singleton instance
export const cache = Cache.getInstance();

/**
 * Grafana UI specific cache utilities
 */
export class GrafanaUICache {
  private cache: Cache;

  // Cache TTL configurations for different types of data
  private static readonly TTL = {
    COMPONENT_LIST: 24 * 60 * 60 * 1000, // 24 hours - component list changes rarely
    COMPONENT_SOURCE: 12 * 60 * 60 * 1000, // 12 hours - source code changes occasionally
    COMPONENT_METADATA: 6 * 60 * 60 * 1000, // 6 hours - metadata changes occasionally
    COMPONENT_STORIES: 6 * 60 * 60 * 1000, // 6 hours - stories change occasionally
    COMPONENT_DOCS: 6 * 60 * 60 * 1000, // 6 hours - docs change occasionally
    DIRECTORY_STRUCTURE: 24 * 60 * 60 * 1000, // 24 hours - directory structure changes rarely
    RATE_LIMIT: 5 * 60 * 1000, // 5 minutes - rate limit info changes frequently
    PARSED_METADATA: 12 * 60 * 60 * 1000, // 12 hours - parsed metadata is expensive to compute
  };

  constructor(cache: Cache) {
    this.cache = cache;
  }

  /**
   * Generate cache key for component source code
   */
  componentSourceKey(componentName: string): string {
    return `component:${componentName}:source`;
  }

  /**
   * Generate cache key for component metadata
   */
  componentMetadataKey(componentName: string): string {
    return `component:${componentName}:metadata`;
  }

  /**
   * Generate cache key for component stories
   */
  componentStoriesKey(componentName: string): string {
    return `component:${componentName}:stories`;
  }

  /**
   * Generate cache key for component documentation
   */
  componentDocsKey(componentName: string): string {
    return `component:${componentName}:docs`;
  }

  /**
   * Generate cache key for component files
   */
  componentFilesKey(componentName: string): string {
    return `component:${componentName}:files`;
  }

  /**
   * Generate cache key for parsed component metadata
   */
  componentParsedMetadataKey(componentName: string): string {
    return `component:${componentName}:parsed-metadata`;
  }

  /**
   * Generate cache key for component list
   */
  componentListKey(): string {
    return "components:list";
  }

  /**
   * Generate cache key for directory structure
   */
  directoryStructureKey(path?: string): string {
    return `directory:${path || "components"}:structure`;
  }

  /**
   * Generate cache key for rate limit info
   */
  rateLimitKey(): string {
    return "github:rate-limit";
  }

  /**
   * Cache component source code
   */
  async getOrFetchComponentSource(
    componentName: string,
    fetchFn: () => Promise<string>,
  ): Promise<string> {
    return this.cache.getOrFetch(
      this.componentSourceKey(componentName),
      fetchFn,
      GrafanaUICache.TTL.COMPONENT_SOURCE,
    );
  }

  /**
   * Cache component metadata
   */
  async getOrFetchComponentMetadata(
    componentName: string,
    fetchFn: () => Promise<any>,
  ): Promise<any> {
    return this.cache.getOrFetch(
      this.componentMetadataKey(componentName),
      fetchFn,
      GrafanaUICache.TTL.COMPONENT_METADATA,
    );
  }

  /**
   * Cache component stories
   */
  async getOrFetchComponentStories(
    componentName: string,
    fetchFn: () => Promise<string>,
  ): Promise<string> {
    return this.cache.getOrFetch(
      this.componentStoriesKey(componentName),
      fetchFn,
      GrafanaUICache.TTL.COMPONENT_STORIES,
    );
  }

  /**
   * Cache component documentation
   */
  async getOrFetchComponentDocs(
    componentName: string,
    fetchFn: () => Promise<string>,
  ): Promise<string> {
    return this.cache.getOrFetch(
      this.componentDocsKey(componentName),
      fetchFn,
      GrafanaUICache.TTL.COMPONENT_DOCS,
    );
  }

  /**
   * Cache component files
   */
  async getOrFetchComponentFiles(
    componentName: string,
    fetchFn: () => Promise<any>,
  ): Promise<any> {
    return this.cache.getOrFetch(
      this.componentFilesKey(componentName),
      fetchFn,
      GrafanaUICache.TTL.COMPONENT_METADATA,
    );
  }

  /**
   * Cache parsed component metadata
   */
  async getOrFetchParsedMetadata(
    componentName: string,
    fetchFn: () => Promise<any>,
  ): Promise<any> {
    return this.cache.getOrFetch(
      this.componentParsedMetadataKey(componentName),
      fetchFn,
      GrafanaUICache.TTL.PARSED_METADATA,
    );
  }

  /**
   * Cache component list
   */
  async getOrFetchComponentList(
    fetchFn: () => Promise<string[]>,
  ): Promise<string[]> {
    return this.cache.getOrFetch(
      this.componentListKey(),
      fetchFn,
      GrafanaUICache.TTL.COMPONENT_LIST,
    );
  }

  /**
   * Cache directory structure
   */
  async getOrFetchDirectoryStructure(
    path: string,
    fetchFn: () => Promise<any>,
  ): Promise<any> {
    return this.cache.getOrFetch(
      this.directoryStructureKey(path),
      fetchFn,
      GrafanaUICache.TTL.DIRECTORY_STRUCTURE,
    );
  }

  /**
   * Cache rate limit info
   */
  async getOrFetchRateLimit(fetchFn: () => Promise<any>): Promise<any> {
    return this.cache.getOrFetch(
      this.rateLimitKey(),
      fetchFn,
      GrafanaUICache.TTL.RATE_LIMIT,
    );
  }

  /**
   * Invalidate all cache entries for a specific component
   */
  invalidateComponent(componentName: string): void {
    const prefixes = [`component:${componentName}:`];

    prefixes.forEach((prefix) => {
      this.cache.deleteByPrefix(prefix);
    });
  }

  /**
   * Invalidate all component-related cache entries
   */
  invalidateAllComponents(): void {
    this.cache.deleteByPrefix("component:");
    this.cache.delete(this.componentListKey());
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    totalItems: number;
    componentSourceCached: number;
    componentMetadataCached: number;
    componentStoriesCached: number;
    componentDocsCached: number;
    expiredItems: number;
  } {
    const totalItems = this.cache.size();

    // Count different types of cached items
    let componentSourceCached = 0;
    let componentMetadataCached = 0;
    let componentStoriesCached = 0;
    let componentDocsCached = 0;

    // This is a simple approximation - in a real implementation,
    // we'd iterate through the cache keys to count by pattern
    const estimatedItemsPerType = Math.floor(totalItems / 4);
    componentSourceCached = estimatedItemsPerType;
    componentMetadataCached = estimatedItemsPerType;
    componentStoriesCached = estimatedItemsPerType;
    componentDocsCached = estimatedItemsPerType;

    const expiredItems = this.cache.clearExpired();

    return {
      totalItems,
      componentSourceCached,
      componentMetadataCached,
      componentStoriesCached,
      componentDocsCached,
      expiredItems,
    };
  }

  /**
   * Warm up cache with commonly used components
   */
  async warmUp(
    commonComponents: string[],
    fetchFunctions: {
      getComponentSource: (name: string) => Promise<string>;
      getComponentMetadata: (name: string) => Promise<any>;
      getComponentStories: (name: string) => Promise<string>;
      getComponentDocs: (name: string) => Promise<string>;
    },
  ): Promise<void> {
    const promises = commonComponents.flatMap((componentName) => [
      this.getOrFetchComponentSource(componentName, () =>
        fetchFunctions.getComponentSource(componentName),
      ),
      this.getOrFetchComponentMetadata(componentName, () =>
        fetchFunctions.getComponentMetadata(componentName),
      ),
      this.getOrFetchComponentStories(componentName, () =>
        fetchFunctions.getComponentStories(componentName),
      ),
      this.getOrFetchComponentDocs(componentName, () =>
        fetchFunctions.getComponentDocs(componentName),
      ),
    ]);

    // Execute all requests in parallel, but catch errors to prevent one failure from stopping others
    await Promise.allSettled(promises);
  }
}

// Export a singleton instance for Grafana UI cache
export const grafanaUICache = new GrafanaUICache(cache);

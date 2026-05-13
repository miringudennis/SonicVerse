const DEFAULT_INSTANCES = [
  'https://eu-central.monochrome.tf',
  'https://us-west.monochrome.tf',
  'https://arran.monochrome.tf',
  'https://triton.squid.wtf',
  'https://api.monochrome.tf',
  'https://monochrome-api.samidy.com',
  'https://tidal.kinoplus.online'
];

/**
 * Service to interface with Monochrome.tf API infrastructure.
 * This handles robust fallback to multiple API instances.
 */
export const monochromeService = {
  
  /**
   * Fetch with retry logic across multiple instances
   */
  async fetchWithRetry(relativePath: string) {
    // Shuffle instances for load balancing
    const instances = [...DEFAULT_INSTANCES].sort(() => Math.random() - 0.5);
    
    let lastError = null;
    for (const baseUrl of instances) {
        const url = `${baseUrl}${relativePath}`;
        try {
            const response = await fetch(url);
            if (response.ok) return response;
            lastError = new Error(`Request failed with status ${response.status}`);
        } catch (error) {
            lastError = error;
        }
    }
    throw lastError || new Error(`All Monochrome API instances failed for: ${relativePath}`);
  },

  /**
   * Retrieves the stream URL for a track using the robust Monochrome proxy.
   */
  getStreamUrl: async (trackId: string) => {
    try {
        const response = await monochromeService.fetchWithRetry(`/stream?id=${trackId}&quality=LOW`);
        const data = await response.json();
        return data.url || data.streamUrl;
    } catch (err) {
        console.error('Monochrome stream fetch failed:', err);
        throw err;
    }
  },

  /**
   * Fetch metadata
   */
  getTrackMetadata: async (trackId: string) => {
    try {
        const response = await monochromeService.fetchWithRetry(`/info/?id=${trackId}`);
        const json = await response.json();
        return json.data || json;
    } catch (err) {
        console.error('Monochrome metadata fetch failed:', err);
        throw err;
    }
  }
};

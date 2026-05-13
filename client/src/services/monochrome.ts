import api from './api';

const MONOCHROME_BASE_URL = 'https://api.monochrome.tf';

/**
 * Service to interface with Monochrome.tf API for Hi-Fi streaming.
 * This service fetches metadata and stream URLs for high-quality audio.
 */
export const monochromeService = {
  /**
   * Search for tracks using the Monochrome proxy.
   */
  search: async (query: string) => {
    try {
      const response = await api.get(`${MONOCHROME_BASE_URL}/search`, {
        params: { q: query },
      });
      return response.data;
    } catch (error) {
      console.error('Error searching Monochrome:', error);
      throw error;
    }
  },

  /**
   * Get stream URL for a specific track ID.
   * Monochrome/Tidal proxy requires specific track IDs.
   */
  getStreamUrl: async (trackId: string) => {
    // In a real implementation, this would call the Monochrome proxy
    // to retrieve the direct stream URL for the provided track ISRC or ID.
    return `${MONOCHROME_BASE_URL}/stream/${trackId}`;
  },
};

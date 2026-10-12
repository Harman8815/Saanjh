import { apiClient } from './api';
import { VenueCatalog } from '../types/api';

/**
 * Venue catalog service.
 *
 * The catalog is shared reference data: reads are open to any authenticated
 * user, while writes are restricted to admins server-side.
 */
export class VenueService {
  /**
   * Read the venue catalog.
   *
   * The endpoint is paginated, so the results are unwrapped from the envelope.
   */
  static async getVenueCatalog(): Promise<VenueCatalog[]> {
    const response = await apiClient.get<
      VenueCatalog[] | { results: VenueCatalog[] }
    >('/weddings/venue-catalog/');

    if (Array.isArray(response)) {
      return response;
    }
    return response.results ?? [];
  }

  static async searchVenueCatalog(query: string): Promise<VenueCatalog[]> {
    const venues = await VenueService.getVenueCatalog();
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return venues;
    }
    return venues.filter(
      (venue) =>
        venue.name.toLowerCase().includes(needle) ||
        venue.address.toLowerCase().includes(needle)
    );
  }
}

export default VenueService;

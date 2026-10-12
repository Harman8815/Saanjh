import { apiClient } from './api';
import { VenueCatalog } from '../types/api';

/**
 * Venue catalog service.
 *
 * The catalog is shared reference data: reads are open to any authenticated
 * user, while writes are restricted to admins server-side.
 */
export class VenueService {
  static async getVenueCatalog(): Promise<VenueCatalog[]> {
    const data = await apiClient.get<any>('/weddings/venue-catalog/');
    // The endpoint returns a DRF paginated envelope.
    if (Array.isArray(data)) {
      return data as VenueCatalog[];
    }
    return (data?.results ?? []) as VenueCatalog[];
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

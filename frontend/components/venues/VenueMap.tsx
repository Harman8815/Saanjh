'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { VenueCatalog } from '../../types/api';

// Leaflet's default marker icons ship as images that bundlers cannot resolve,
// so the URLs are rebuilt from the CDN paths the library already ships.
const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface VenueMapProps {
  venues: VenueCatalog[];
  /** Centre of the map; falls back to the first geocoded venue. */
  center?: { lat: number; lng: number } | null;
  /** Highlighted venue id. */
  selectedVenueId?: number | null;
  onSelectVenue?: (venueId: number) => void;
  /** Called with the venue the user clicked a marker for. */
  onMarkerClick?: (venue: VenueCatalog) => void;
}

export default function VenueMap({
  venues,
  center,
  selectedVenueId,
  onSelectVenue,
  onMarkerClick,
}: VenueMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<number, L.Marker>>(new Map());

  // Only venues with coordinates can be plotted.
  const geocoded = venues.filter(
    venue => typeof venue.latitude === 'number' && typeof venue.longitude === 'number'
  ) as Array<VenueCatalog & { latitude: number; longitude: number }>;

  // Initialise the map once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const fallback = center
      ? [center.lat, center.lng] as [number, number]
      : geocoded[0]
        ? [geocoded[0].latitude, geocoded[0].longitude] as [number, number]
        : [40.7128, -74.006] as [number, number];
    const map = L.map(containerRef.current, {
      center: fallback,
      zoom: 12,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    // Leaflet measures the container after mount; without this the tiles can
    // render at the wrong size inside a flex/grid layout.
    setTimeout(() => map.invalidateSize(), 0);

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rebuild markers whenever the venue set changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current.clear();

    geocoded.forEach(venue => {
      const marker = L.marker([venue.latitude, venue.longitude], { icon: markerIcon });
      marker.bindPopup(
        `<strong>${venue.name}</strong><br/>${venue.address}<br/>` +
          `<em>${venue.type}</em> &middot; up to ${venue.capacity_max} guests`
      );
      marker.on('click', () => {
        onSelectVenue?.(venue.id);
        onMarkerClick?.(venue);
      });
      marker.addTo(map);
      markersRef.current.set(venue.id, marker);
    });

    if (geocoded.length > 0) {
      const bounds = L.latLngBounds(geocoded.map(v => [v.latitude, v.longitude]));
      map.fitBounds(bounds.pad(0.2), { maxZoom: 14 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venues, geocoded.length]);

  // Recentre when an explicit centre is supplied.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !center) return;
    map.setView([center.lat, center.lng], 13);
  }, [center]);

  // Highlight the selected venue.
  useEffect(() => {
    if (!selectedVenueId) return;
    const marker = markersRef.current.get(selectedVenueId);
    marker?.openPopup();
  }, [selectedVenueId]);

  return <div ref={containerRef} className="w-full h-full min-h-[400px] rounded-xl" />;
}

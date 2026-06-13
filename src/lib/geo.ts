import type { Feature, LineString } from 'geojson';
import type { Port } from '@/types';

const EARTH_RADIUS_KM = 6371;
const KM_PER_NM = 1.852;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Great-circle distance in kilometres (haversine). */
export function haversineKm(a: Port, b: Port): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

export function kmToNm(km: number): number {
  return km / KM_PER_NM;
}

export function haversineNm(a: Port, b: Port): number {
  return kmToNm(haversineKm(a, b));
}

/**
 * Great-circle arc as a GeoJSON LineString, interpolated along the geodesic
 * (slerp on the unit sphere) so long routes curve correctly rather than cutting
 * straight across a lat/lng rectangle. Used for air mode and arc fallback.
 */
export function greatCircleArc(a: Port, b: Port, segments = 64): Feature<LineString> {
  const lat1 = toRad(a.lat);
  const lng1 = toRad(a.lng);
  const lat2 = toRad(b.lat);
  const lng2 = toRad(b.lng);
  const d =
    2 *
    Math.asin(
      Math.sqrt(
        Math.sin((lat2 - lat1) / 2) ** 2 +
          Math.cos(lat1) * Math.cos(lat2) * Math.sin((lng2 - lng1) / 2) ** 2,
      ),
    );
  const coords: [number, number][] = [];
  if (d === 0) {
    coords.push([a.lng, a.lat], [b.lng, b.lat]);
  } else {
    for (let i = 0; i <= segments; i++) {
      const f = i / segments;
      const A = Math.sin((1 - f) * d) / Math.sin(d);
      const B = Math.sin(f * d) / Math.sin(d);
      const x = A * Math.cos(lat1) * Math.cos(lng1) + B * Math.cos(lat2) * Math.cos(lng2);
      const y = A * Math.cos(lat1) * Math.sin(lng1) + B * Math.cos(lat2) * Math.sin(lng2);
      const z = A * Math.sin(lat1) + B * Math.sin(lat2);
      const lat = Math.atan2(z, Math.sqrt(x * x + y * y));
      const lng = Math.atan2(y, x);
      coords.push([(lng * 180) / Math.PI, (lat * 180) / Math.PI]);
    }
  }
  return { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coords } };
}

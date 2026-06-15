import { useEffect, useRef, useState } from 'react';
import maplibregl, { type Map as MlMap } from 'maplibre-gl';
import type { Feature, LineString } from 'geojson';
import 'maplibre-gl/dist/maplibre-gl.css';

const STYLE_URL =
  import.meta.env.VITE_MAP_STYLE_URL ?? 'https://tiles.openfreemap.org/styles/liberty';

export interface RouteLayer {
  id: string;
  feature: Feature<LineString>;
  color: string;
  dashed?: boolean;
}

export interface MapMarker {
  id: string;
  lng: number;
  lat: number;
  color: string;
  label: string;
}

export interface MapBubble {
  id: string;
  lng: number;
  lat: number;
  radius: number; // px
  color: string;
  label: string;
}

export function MapView({
  routes,
  markers,
  bubbles = [],
}: {
  routes: RouteLayer[];
  markers: MapMarker[];
  bubbles?: MapBubble[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const routeIdsRef = useRef<string[]>([]);
  const markerObjsRef = useRef<maplibregl.Marker[]>([]);
  const bubbleObjsRef = useRef<maplibregl.Marker[]>([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    // MapLibre needs WebGL; if the browser/GPU can't provide it (hardware
    // acceleration off, remote desktop, locked-down config) `new Map()` throws.
    // Catch it so the map area degrades to a notice instead of crashing the tab.
    let map: MlMap;
    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style: STYLE_URL,
        center: [20, 25],
        zoom: 1.4,
        attributionControl: { compact: true },
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('MapLibre failed to initialize (WebGL unavailable?):', err);
      setFailed(true);
      return;
    }
    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const apply = () => {
      for (const id of routeIdsRef.current) {
        if (map.getLayer(`${id}-line`)) map.removeLayer(`${id}-line`);
        if (map.getSource(id)) map.removeSource(id);
      }
      routeIdsRef.current = [];

      for (const r of routes) {
        map.addSource(r.id, { type: 'geojson', data: r.feature });
        map.addLayer({
          id: `${r.id}-line`,
          type: 'line',
          source: r.id,
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: {
            'line-color': r.color,
            'line-width': 3,
            ...(r.dashed ? { 'line-dasharray': [2, 2] } : {}),
          },
        });
        routeIdsRef.current.push(r.id);
      }

      for (const bb of bubbleObjsRef.current) bb.remove();
      bubbleObjsRef.current = [];
      for (const b of bubbles) {
        const el = document.createElement('div');
        const d = b.radius * 2;
        el.style.cssText = `width:${d}px;height:${d}px;border-radius:50%;background:${b.color};opacity:0.55;border:1.5px solid ${b.color};cursor:pointer`;
        const bubble = new maplibregl.Marker({ element: el })
          .setLngLat([b.lng, b.lat])
          .setPopup(new maplibregl.Popup({ offset: b.radius, closeButton: false }).setText(b.label))
          .addTo(map);
        el.addEventListener('mouseenter', () => bubble.togglePopup());
        el.addEventListener('mouseleave', () => bubble.togglePopup());
        bubbleObjsRef.current.push(bubble);
      }

      for (const mk of markerObjsRef.current) mk.remove();
      markerObjsRef.current = [];
      for (const m of markers) {
        const el = document.createElement('div');
        el.style.cssText = `width:12px;height:12px;border-radius:50%;background:${m.color};border:2px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,0.25);cursor:pointer`;
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([m.lng, m.lat])
          .setPopup(new maplibregl.Popup({ offset: 12, closeButton: false }).setText(m.label))
          .addTo(map);
        markerObjsRef.current.push(marker);
      }

      const coords: [number, number][] = [
        ...routes.flatMap((r) => r.feature.geometry.coordinates as [number, number][]),
        ...bubbles.map((b) => [b.lng, b.lat] as [number, number]),
      ];
      const first = coords[0];
      if (first) {
        const bounds = coords.reduce(
          (b, c) => b.extend(c),
          new maplibregl.LngLatBounds(first, first),
        );
        map.fitBounds(bounds, { padding: 60, maxZoom: bubbles.length ? 5 : 6, duration: 600 });
      }
    };

    if (map.isStyleLoaded()) apply();
    else map.once('load', apply);
  }, [routes, markers, bubbles]);

  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-50 p-6 text-center text-xs text-slate-500">
        Map unavailable — this browser doesn&rsquo;t support WebGL. Distances, routes, and all
        other panels still work normally.
      </div>
    );
  }

  return <div ref={containerRef} className="h-full w-full" />;
}

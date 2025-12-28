import { useEffect, useRef } from 'react';
import L from 'leaflet';

interface Device {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: 'online' | 'offline';
}

interface WebMapProps {
  devices: Device[];
}

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function WebMap({ devices }: WebMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map only once
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapContainer.current).setView([18.7357, -70.1627], 10);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapInstance.current);
    }

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add markers for each device
    if (devices.length > 0) {
      const bounds = L.latLngBounds([]);

      devices.forEach((device) => {
        // Create custom icon based on status
        const iconHtml = `
          <div style="
            background-color: ${device.status === 'online' ? '#10b981' : '#6b7280'};
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <span style="
              transform: rotate(45deg);
              font-size: 16px;
            ">🚗</span>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        });

        const marker = L.marker([device.lat, device.lng], { icon: customIcon })
          .addTo(mapInstance.current!)
          .bindPopup(`
            <div style="font-family: system-ui, -apple-system, sans-serif;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1e293b;">
                ${device.name}
              </h3>
              <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <div style="
                  width: 8px;
                  height: 8px;
                  border-radius: 50%;
                  background-color: ${device.status === 'online' ? '#10b981' : '#6b7280'};
                  margin-right: 6px;
                "></div>
                <span style="
                  font-size: 13px;
                  font-weight: 500;
                  color: ${device.status === 'online' ? '#10b981' : '#6b7280'};
                ">
                  ${device.status === 'online' ? 'En línea' : 'Fuera de línea'}
                </span>
              </div>
              <p style="margin: 4px 0; font-size: 13px; color: #64748b;">
                <strong>Lat:</strong> ${device.lat.toFixed(6)}<br/>
                <strong>Lng:</strong> ${device.lng.toFixed(6)}
              </p>
            </div>
          `);

        markersRef.current.push(marker);
        bounds.extend([device.lat, device.lng]);
      });

      // Only fit bounds on first load, then let user control the view
      if (bounds.isValid() && isFirstLoad.current) {
        mapInstance.current.fitBounds(bounds, { padding: [50, 50] });
        isFirstLoad.current = false;
      }
    }

    return () => {
      // Cleanup markers on unmount
      markersRef.current.forEach(marker => marker.remove());
    };
  }, [devices]);

  return (
    <div
      ref={mapContainer}
      style={{
        width: '100%',
        height: '600px',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e2e8f0',
      }}
    />
  );
}

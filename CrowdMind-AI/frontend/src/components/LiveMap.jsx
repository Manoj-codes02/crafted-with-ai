import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// SVG Path templates for custom, elegant EOC markers
const SVG_ICONS = {
  Flood: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-blue-600"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  Fire: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#D32F2F" stroke-width="2.5"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
  Medical: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#27AE60" stroke-width="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
  Food: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#E28743" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`,
  RoadClosed: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#333333" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg>`,
  Shelter: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#8E44AD" stroke-width="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  Ambulance: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#2F80ED" stroke-width="2.5"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
  Boat: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#16A085" stroke-width="2.5"><path d="M2 17h20L19 9H5L2 17zM12 2v7M9 5h3"/></svg>`,
  Volunteer: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#4A90E2" stroke-width="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`
};

const createCustomPin = (type, color) => {
  const innerSVG = SVG_ICONS[type] || SVG_ICONS.Medical;
  return L.divIcon({
    html: `
      <div style="
        width: 38px;
        height: 38px;
        background: #FFFFFF;
        border: 2px solid ${color};
        border-radius: 50%;
        box-shadow: 0 4px 10px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s ease-in-out;
      " class="hover:scale-110">
        ${innerSVG}
      </div>
    `,
    className: 'custom-leaflet-icon',
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -19]
  });
};

const LiveMap = ({ incidents = [], resources = [], routeLines = [] }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const routesLayerRef = useRef(null);

  useEffect(() => {
    // 1. Initialize map if not initialized
    if (!mapInstanceRef.current && mapContainerRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        center: [28.6139, 77.2090], // Center in Delhi Capital Region
        zoom: 12,
        zoomControl: false
      });

      // Add a sleek, modern light-themed OpenStreetMap layer (Voyager style-like)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(mapInstanceRef.current);

      L.control.zoom({ position: 'bottomright' }).addTo(mapInstanceRef.current);

      markersLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
      routesLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    }

    return () => {
      // Clean up map when component unmounts
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    const routesLayer = routesLayerRef.current;

    if (!map || !markersLayer || !routesLayer) return;

    // Clear previous layers
    markersLayer.clearLayers();
    routesLayer.clearLayers();

    // Map bounds to auto-fit markers
    const bounds = [];

    // 2. Render Incident Pins
    incidents.forEach((inc) => {
      if (inc.latitude && inc.longitude && inc.status !== 'Resolved') {
        const pinColor = inc.priority === 'High' ? '#EB5757' : inc.priority === 'Medium' ? '#F2C94C' : '#828282';
        const marker = L.marker([inc.latitude, inc.longitude], {
          icon: createCustomPin(inc.type, pinColor)
        });

        const popupContent = `
          <div style="font-family: Inter, sans-serif; min-width: 200px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-weight: 700; font-size: 11px; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; background: ${pinColor}1A; color: ${pinColor}; border: 1px solid ${pinColor}40;">
                ${inc.priority} Urgency
              </span>
              <span style="font-size: 10px; color: #828282;">${inc.source}</span>
            </div>
            <h4 style="margin: 0 0 4px 0; font-weight: 600; font-size: 14px; color: #333;">${inc.title}</h4>
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #666; line-height: 1.4;">${inc.description}</p>
            <div style="border-top: 1px solid #EEE; padding-top: 6px; font-size: 11px; color: #828282; font-weight: 500;">
              📍 ${inc.locationName}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.addTo(markersLayer);
        bounds.push([inc.latitude, inc.longitude]);
      }
    });

    // 3. Render Resource Pins
    resources.forEach((res) => {
      if (res.currentLatitude && res.currentLongitude && res.status === 'Available') {
        const color = '#2F80ED'; // Primary Blue
        const marker = L.marker([res.currentLatitude, res.currentLongitude], {
          icon: createCustomPin(res.type, color)
        });

        const popupContent = `
          <div style="font-family: Inter, sans-serif; min-width: 180px;">
            <h4 style="margin: 0 0 2px 0; font-weight: 700; font-size: 13px; color: #2F80ED;">${res.identifier}</h4>
            <div style="font-size: 11px; color: #828282; font-weight: 500; margin-bottom: 6px;">Type: ${res.type}</div>
            <div style="display: inline-block; font-size: 10px; font-weight: 600; color: #27AE60; background: #27AE601A; padding: 2px 6px; border-radius: 4px; border: 1px solid #27AE6033;">
              Available (Idle)
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.addTo(markersLayer);
        bounds.push([res.currentLatitude, res.currentLongitude]);
      }
    });

    // 4. Render Operations Research Routes
    routeLines.forEach((route) => {
      if (route.routeLine && route.routeLine.length === 2) {
        // Draw route line
        const polyline = L.polyline(route.routeLine, {
          color: '#2F80ED',
          weight: 3,
          opacity: 0.65,
          dashArray: '8, 8', // Dashed lines look very professional
          lineCap: 'round'
        });

        const popupContent = `
          <div style="font-family: Inter, sans-serif; font-size: 12px; padding: 2px;">
            <strong>OR Routing Suggestion</strong><br/>
            Asset: ${route.resourceIdentifier} (${route.resourceType})<br/>
            Incident: ${route.incidentTitle}<br/>
            Est. Distance: ${route.distanceKm} km<br/>
            Est. Transit Time: ${route.estTimeMinutes} mins
          </div>
        `;
        polyline.bindPopup(popupContent);
        polyline.addTo(routesLayer);
      }
    });

    // 5. Fit bounds to show all pins if we have coordinates
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [incidents, resources, routeLines]);

  return (
    <div className="w-full h-full relative overflow-hidden rounded-2xl shadow-sm border border-veryLightGray bg-white">
      <div ref={mapContainerRef} className="w-full h-full min-h-[400px]"></div>
      
      {/* Sleek Floating Map Legend */}
      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-3 rounded-xl shadow-lg border border-veryLightGray/85 z-[1000] max-w-xs pointer-events-auto">
        <h4 className="text-xs font-bold text-textMain uppercase tracking-wide mb-2.5">Platform Legend</h4>
        <div className="space-y-1.5 text-[11px] font-semibold text-textMuted">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-danger"></span>
            <span>High Urgency Incident</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-warning"></span>
            <span>Medium Urgency Incident</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
            <span>Available Emergency Responder</span>
          </div>
          <div className="flex items-center space-x-2 border-t border-gray-100 pt-1.5 mt-1.5">
            <span className="w-5 h-0.5 border-t-2 border-dashed border-primary inline-block"></span>
            <span>OR Allocation Suggestion</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMap;

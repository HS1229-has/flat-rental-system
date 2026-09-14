let leafletPromise = null;

/**
 * Dynamically loads Leaflet CSS and JavaScript from CDN.
 * Requires NO API key, completely open-source and free.
 */
export const loadLeafletScript = () => {
  if (leafletPromise) return leafletPromise;

  leafletPromise = new Promise((resolve, reject) => {
    if (window.L) {
      resolve(window.L);
      return;
    }

    // Load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => {
      if (window.L) {
        resolve(window.L);
      } else {
        reject(new Error('Leaflet namespace not found after load'));
      }
    };
    script.onerror = () => {
      reject(new Error('Failed to load Leaflet script'));
    };
    document.head.appendChild(script);
  });

  return leafletPromise;
};

/**
 * Standard Coordinates for major Indian metro cities
 */
export const CITY_COORDINATES = {
  bangalore: [12.9716, 77.5946],
  bengaluru: [12.9716, 77.5946],
  mumbai: [19.0760, 72.8777],
  delhi: [28.6139, 77.2090],
  noida: [28.5355, 77.3910],
  gurgaon: [28.4595, 77.0266],
  gurugram: [28.4595, 77.0266],
  pune: [18.5204, 73.8567],
  hyderabad: [17.3850, 78.4867],
  chennai: [13.0827, 80.2707],
  kolkata: [22.5726, 88.3639],
  ahmedabad: [23.0225, 72.5714],
  default: [12.9716, 77.5946] // Default Bangalore
};

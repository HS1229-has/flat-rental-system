let googleMapsPromise = null;

/**
 * Dynamically loads the Google Maps JavaScript API script once, returning a promise
 * that resolves to the window.google.maps object.
 * 
 * @returns {Promise<any>}
 */
export const loadGoogleMapsScript = () => {
  if (googleMapsPromise) return googleMapsPromise;

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  googleMapsPromise = new Promise((resolve, reject) => {
    // If google maps is already loaded on window, resolve immediately
    if (window.google && window.google.maps) {
      resolve(window.google.maps);
      return;
    }

    if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
      console.warn("VITE_GOOGLE_MAPS_API_KEY environment variable is not configured or is a placeholder. Google Maps features will run in mock/manual fallback mode.");
      reject(new Error("Google Maps API key is missing or unconfigured"));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google && window.google.maps) {
        resolve(window.google.maps);
      } else {
        reject(new Error("Google Maps script loaded but google.maps namespace is not defined"));
      }
    };
    script.onerror = () => {
      reject(new Error("Failed to load Google Maps script"));
    };
    document.head.appendChild(script);
  });

  return googleMapsPromise;
};

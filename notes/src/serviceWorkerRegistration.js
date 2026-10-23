// Service workers are intentionally disabled for this app.
//
// The previous Create React App setup precached index.html and JavaScript
// bundles. That could leave users running an old frontend/API configuration
// after a deployment until they cleared site data. Keep the exported functions
// for compatibility, but unregister existing workers and remove their caches.

export function register() {
  // Intentionally disabled: production updates should be served by the host.
}

export function unregister() {
  if (!('serviceWorker' in navigator)) {
    return clearAppCaches();
  }

  return navigator.serviceWorker
    .getRegistrations()
    .then((registrations) =>
      Promise.all(registrations.map((registration) => registration.unregister()))
    )
    .then(clearAppCaches)
    .catch((error) => {
      console.error('Unable to clear legacy service worker registrations:', error);
    });
}

function clearAppCaches() {
  if (!('caches' in window)) return Promise.resolve();

  return window.caches.keys().then((keys) =>
    Promise.all(
      keys
        .filter((key) => key.startsWith('workbox-') || key === 'images')
        .map((key) => window.caches.delete(key))
    )
  );
}
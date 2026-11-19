'use strict';
window.oravelFetch = function (path, options) {
  if (typeof path !== 'string' || !path.startsWith('/api/')) {
    return Promise.reject(new Error('Invalid API path'));
  }
  return fetch(window.ORAVEL_API_BASE + path, options);
};

// Optimized font loading to prevent render blocking
(function() {
  // Check if fonts are already cached
  if (sessionStorage.getItem('fontsLoaded')) {
    document.documentElement.classList.add('fonts-loaded');
    return;
  }

  // Load fonts asynchronously
  if ('fonts' in document) {
    Promise.all([
      document.fonts.load('400 1em Orbitron'),
      document.fonts.load('400 1em Space Grotesk'),
    ]).then(function() {
      document.documentElement.classList.add('fonts-loaded');
      sessionStorage.setItem('fontsLoaded', 'true');
    }).catch(function() {
      // Fallback to system fonts if loading fails
      document.documentElement.classList.add('fonts-failed');
    });
  }
})();

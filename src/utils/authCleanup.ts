
// Enhanced cleanup function to clear all auth and profile state
export const cleanupAuthState = () => {
  try {
    // Clear all localStorage keys
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || 
          key.includes('sb-') || 
          key === 'selectedProfile' ||
          key.startsWith('profile-') ||
          key.includes('user-') ||
          key.includes('watchParty-') ||
          key.includes('session-')) {
        localStorage.removeItem(key);
      }
    });

    // Clear sessionStorage as well
    if (typeof sessionStorage !== 'undefined') {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || 
            key.includes('sb-') || 
            key === 'selectedProfile' ||
            key.startsWith('profile-') ||
            key.includes('user-') ||
            key.includes('watchParty-') ||
            key.includes('session-')) {
          sessionStorage.removeItem(key);
        }
      });
    }

    // Clear any cached data
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('auth') || name.includes('profile')) {
            caches.delete(name);
          }
        });
      });
    }
  } catch (error) {
    console.error('Error cleaning up auth state:', error);
  }
};

// Enhanced cleanup specifically for profile switching
export const cleanupProfileState = () => {
  try {
    localStorage.removeItem('selectedProfile');
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('profile-') || key.includes('watchHistory-')) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error cleaning up profile state:', error);
  }
};

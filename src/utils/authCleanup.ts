
// Enhanced cleanup function to clear all auth and profile state
export const cleanupAuthState = () => {
  try {
    console.log('🧹 Starting auth state cleanup...');
    
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
        console.log('🗑️ Removed localStorage key:', key);
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
          console.log('🗑️ Removed sessionStorage key:', key);
        }
      });
    }

    // Clear any cached data
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('auth') || name.includes('profile')) {
            caches.delete(name);
            console.log('🗑️ Removed cache:', name);
          }
        });
      }).catch(error => {
        console.warn('⚠️ Cache cleanup failed:', error);
      });
    }
    
    console.log('✅ Auth state cleanup completed');
  } catch (error) {
    console.error('❌ Error cleaning up auth state:', error);
  }
};

// Enhanced cleanup specifically for profile switching
export const cleanupProfileState = () => {
  try {
    console.log('🧹 Starting profile state cleanup...');
    
    localStorage.removeItem('selectedProfile');
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('profile-') || key.includes('watchHistory-')) {
        localStorage.removeItem(key);
        console.log('🗑️ Removed profile key:', key);
      }
    });
    
    console.log('✅ Profile state cleanup completed');
  } catch (error) {
    console.error('❌ Error cleaning up profile state:', error);
  }
};

// New utility for cleaning up video player state
export const cleanupVideoPlayerState = () => {
  try {
    console.log('🧹 Starting video player state cleanup...');
    
    Object.keys(localStorage).forEach((key) => {
      if (key.includes('video-') || 
          key.includes('player-') || 
          key.includes('stream-') ||
          key.includes('playback-')) {
        localStorage.removeItem(key);
        console.log('🗑️ Removed video player key:', key);
      }
    });
    
    console.log('✅ Video player state cleanup completed');
  } catch (error) {
    console.error('❌ Error cleaning up video player state:', error);
  }
};

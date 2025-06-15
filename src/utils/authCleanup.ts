
// Enhanced cleanup function to clear all auth and profile state
export const cleanupAuthState = () => {
  try {
    // Clear all localStorage keys
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || 
          key.includes('sb-') || 
          key === 'selectedProfile' ||
          key.startsWith('profile-') ||
          key.includes('user-')) {
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
            key.includes('user-')) {
          sessionStorage.removeItem(key);
        }
      });
    }
  } catch (error) {
    console.error('Error cleaning up auth state:', error);
  }
};

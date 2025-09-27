// Utility to clear invalid authentication and force re-login
export const clearAuthAndReload = () => {
  // Clear all authentication data
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
  
  // Clear any other auth-related storage
  sessionStorage.clear();
  
  // Reload the page to reset the app state
  window.location.reload();
};

// Check if token is expired or invalid
export const isTokenValid = () => {
  const token = localStorage.getItem('auth_token');
  if (!token) return false;
  
  try {
    // Basic check - if token exists and is not empty
    return token.length > 10;
  } catch {
    return false;
  }
};

// Force admin login
export const forceAdminLogin = async () => {
  try {
    // Clear existing auth
    clearAuthAndReload();
  } catch (error) {
    console.error('Error during forced login:', error);
    // Fallback - just clear and reload
    clearAuthAndReload();
  }
};
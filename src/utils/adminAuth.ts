const ADMIN_KEY = 'is_admin_authenticated';
const ADMIN_FINGERPRINT_KEY = 'admin_fingerprint';

export const setAdminAuth = (isAuthenticated: boolean) => {
  if (isAuthenticated) {
    localStorage.setItem(ADMIN_KEY, 'true');
    localStorage.setItem(ADMIN_FINGERPRINT_KEY, 'admin');
  } else {
    localStorage.removeItem(ADMIN_KEY);
    localStorage.removeItem(ADMIN_FINGERPRINT_KEY);
  }
};

export const isAdminAuthenticated = (): boolean => {
  return localStorage.getItem(ADMIN_KEY) === 'true';
};

export const getAdminFingerprint = (): string => {
  return localStorage.getItem(ADMIN_FINGERPRINT_KEY) || '';
};

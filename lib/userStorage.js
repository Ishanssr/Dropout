export function notifyUserChanged() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event('dropout-user-changed'));
}

export function subscribeToStoredUser(callback) {
  if (typeof window === 'undefined') return () => {};

  const handler = () => callback();
  window.addEventListener('storage', handler);
  window.addEventListener('dropout-user-changed', handler);

  return () => {
    window.removeEventListener('storage', handler);
    window.removeEventListener('dropout-user-changed', handler);
  };
}

export function getStoredUserSnapshot() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('user');
}

export function parseStoredUser(rawUser) {
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
}

export function clearStoredUser() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  notifyUserChanged();
}

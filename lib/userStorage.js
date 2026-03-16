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

export function getStoredToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function storeUser(user) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('user', JSON.stringify(user));
  notifyUserChanged();
}

export async function restoreStoredUserSession() {
  if (typeof window === 'undefined') return null;

  const existingUser = parseStoredUser(getStoredUserSnapshot());
  if (existingUser) return existingUser;

  const token = getStoredToken();
  if (!token) return null;

  try {
    const { fetchMe } = await import('./api');
    const user = await fetchMe();
    storeUser(user);
    return user;
  } catch {
    clearStoredUser();
    return null;
  }
}

export function notifyUserChanged() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event('dropout-user-changed'));
}

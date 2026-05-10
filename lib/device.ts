/**
 * Returns true when running on iOS (iPhone / iPad).
 * Safe to call during SSR (returns false on server).
 */
export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

/**
 * Returns true when running on Android.
 * Safe to call during SSR (returns false on server).
 */
export function isAndroid(): boolean {
  if (typeof navigator === 'undefined') return false
  return /android/i.test(navigator.userAgent)
}

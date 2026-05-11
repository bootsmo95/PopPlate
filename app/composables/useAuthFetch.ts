export function useAuthHeaders() {
  return import.meta.server ? useRequestHeaders(['cookie']) : undefined
}

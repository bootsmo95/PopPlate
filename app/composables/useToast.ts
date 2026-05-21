interface Toast {
  id: string
  type: 'success' | 'error' | 'undo'
  message: string
  onUndo?: () => void
  createdAt: number
}

export function useToast() {
  const toasts = useState<Toast[]>('toasts', () => [])

  function dismiss(id: string) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  function addToast(toast: Omit<Toast, 'id' | 'createdAt'>, autoDismissMs?: number) {
    const id = Date.now().toString()
    const entry: Toast = { ...toast, id, createdAt: Date.now() }
    // Prepend new toast, cap at 3 visible
    toasts.value = [entry, ...toasts.value].slice(0, 3)
    if (autoDismissMs) {
      setTimeout(() => dismiss(id), autoDismissMs)
    }
  }

  const toast = {
    success(message: string) { addToast({ type: 'success', message }, 3500) },
    error(message: string) { addToast({ type: 'error', message }) },
    undo(message: string, options: { onUndo: () => void }) {
      addToast({ type: 'undo', message, onUndo: options.onUndo }, 5000)
    },
  }

  return { toasts: readonly(toasts), toast, dismiss }
}
